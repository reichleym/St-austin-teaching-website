import "server-only";

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSql } from "@/lib/postgres";

const SESSION_COOKIE_NAME = "st_austin_portal_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_RESET_TTL_SECONDS = 60 * 30;
const PASSWORD_MIN_LENGTH = 8;
const AUTH_SCHEMA_VERSION = 2;

type UserRow = {
    id: number;
    full_name: string;
    email: string;
    password_hash: string;
};

type SessionUserRow = {
    id: number;
    full_name: string;
    email: string;
};

type PasswordResetRow = {
    user_id: number;
};

export type AuthUser = {
    id: number;
    fullName: string;
    email: string;
};

declare global {
    var __stAustinAuthSchemaReady: Promise<void> | undefined;
    var __stAustinAuthSchemaVersion: number | undefined;
}

function normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function hashToken(value: string): string {
    return createHash("sha256").update(value).digest("hex");
}

function hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = scryptSync(password, salt, 64).toString("hex");
    return `scrypt$${salt}$${derivedKey}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
    const [algorithm, salt, expectedHash] = storedHash.split("$");
    if (algorithm !== "scrypt" || !salt || !expectedHash) {
        return false;
    }

    const actualHash = scryptSync(password, salt, 64).toString("hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");
    const actualBuffer = Buffer.from(actualHash, "hex");

    if (expectedBuffer.length !== actualBuffer.length) {
        return false;
    }

    return timingSafeEqual(expectedBuffer, actualBuffer);
}

function toAuthUser(user: { id: number; full_name: string; email: string }): AuthUser {
    return {
        id: Number(user.id),
        fullName: user.full_name,
        email: user.email,
    };
}

function getCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: SESSION_TTL_SECONDS,
        path: "/",
    };
}

async function ensureAuthSchema(): Promise<void> {
    if (
        globalThis.__stAustinAuthSchemaReady &&
        globalThis.__stAustinAuthSchemaVersion === AUTH_SCHEMA_VERSION
    ) {
        return globalThis.__stAustinAuthSchemaReady;
    }

    globalThis.__stAustinAuthSchemaVersion = AUTH_SCHEMA_VERSION;
    globalThis.__stAustinAuthSchemaReady = (async () => {
        const sql = getSql();

        const relationRows = await sql<{ user_table: string | null; legacy_table: string | null }[]>`
            SELECT
                to_regclass('public."user-web"')::text AS user_table,
                to_regclass('public.portal_users')::text AS legacy_table;
        `;

        const relation = relationRows[0];
        if (!relation?.user_table && relation?.legacy_table) {
            await sql`
                ALTER TABLE portal_users
                RENAME TO "user-web";
            `;
        }

        await sql`
            CREATE TABLE IF NOT EXISTS "user-web" (
                id BIGSERIAL PRIMARY KEY,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS portal_sessions (
                token_hash TEXT PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES "user-web"(id) ON DELETE CASCADE,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS portal_sessions_user_id_idx ON portal_sessions(user_id);
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS portal_password_resets (
                token_hash TEXT PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES "user-web"(id) ON DELETE CASCADE,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS portal_password_resets_user_id_idx ON portal_password_resets(user_id);
        `;
    })();

    return globalThis.__stAustinAuthSchemaReady;
}

async function getUserByEmail(email: string): Promise<UserRow | null> {
    await ensureAuthSchema();
    const sql = getSql();
    const rows = await sql<UserRow[]>`
        SELECT id, full_name, email, password_hash
        FROM "user-web"
        WHERE email = ${normalizeEmail(email)}
        LIMIT 1;
    `;

    return rows[0] ?? null;
}

async function setSessionCookieForUser(userId: number): Promise<void> {
    await ensureAuthSchema();
    const sql = getSql();

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

    await sql`
        DELETE FROM portal_sessions
        WHERE user_id = ${userId}::bigint;
    `;

    await sql`
        INSERT INTO portal_sessions (token_hash, user_id, expires_at)
        VALUES (${tokenHash}, ${userId}::bigint, ${expiresAt.toISOString()}::timestamptz);
    `;

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, getCookieOptions());
}

async function clearSessionCookieAndData(token: string | null): Promise<void> {
    if (token) {
        await ensureAuthSchema();
        const sql = getSql();
        await sql`
            DELETE FROM portal_sessions
            WHERE token_hash = ${hashToken(token)};
        `;
    }

    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

export function validatePasswordForAuth(password: string): string | null {
    const trimmed = password.trim();

    if (!trimmed) {
        return "Password is required.";
    }

    if (trimmed.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
    }

    return null;
}

export async function signupUser(input: {
    fullName: string;
    email: string;
    password: string;
}): Promise<AuthUser> {
    const fullName = input.fullName.trim();
    const email = normalizeEmail(input.email);
    const passwordValidationMessage = validatePasswordForAuth(input.password);

    if (!fullName || fullName.length < 2) {
        throw new Error("Please provide your full name.");
    }

    if (!isValidEmail(email)) {
        throw new Error("Please provide a valid email address.");
    }

    if (passwordValidationMessage) {
        throw new Error(passwordValidationMessage);
    }

    await ensureAuthSchema();
    const sql = getSql();

    const passwordHash = hashPassword(input.password.trim());

    try {
        const rows = await sql<UserRow[]>`
            INSERT INTO "user-web" (full_name, email, password_hash)
            VALUES (${fullName}, ${email}, ${passwordHash})
            RETURNING id, full_name, email, password_hash;
        `;

        const createdUser = rows[0];
        if (!createdUser) {
            throw new Error("Failed to create account.");
        }

        await setSessionCookieForUser(Number(createdUser.id));
        return toAuthUser(createdUser);
    } catch (error: unknown) {
        const maybeSqlError = error as { code?: string };
        if (maybeSqlError?.code === "23505") {
            throw new Error("An account with this email already exists.");
        }
        throw error;
    }
}

export async function loginUser(input: {
    email: string;
    password: string;
}): Promise<AuthUser> {
    const email = normalizeEmail(input.email);
    const password = input.password;

    if (!isValidEmail(email)) {
        throw new Error("Please provide a valid email address.");
    }

    if (!password.trim()) {
        throw new Error("Password is required.");
    }

    const user = await getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
        throw new Error("Invalid email or password.");
    }

    await setSessionCookieForUser(Number(user.id));
    return toAuthUser(user);
}

export async function logoutUser(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
    await clearSessionCookieAndData(token);
}

export async function getCurrentSessionUser(): Promise<AuthUser | null> {
    await ensureAuthSchema();
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!rawToken) {
        return null;
    }

    const sql = getSql();
    const tokenHash = hashToken(rawToken);

    const rows = await sql<SessionUserRow[]>`
        SELECT u.id, u.full_name, u.email
        FROM portal_sessions s
        INNER JOIN "user-web" u ON u.id = s.user_id
        WHERE s.token_hash = ${tokenHash}
          AND s.expires_at > NOW()
        LIMIT 1;
    `;

    const user = rows[0];

    if (!user) {
        await clearSessionCookieAndData(rawToken);
        return null;
    }

    return toAuthUser(user);
}

export async function requestPasswordReset(emailInput: string): Promise<{ devResetToken?: string }> {
    const email = normalizeEmail(emailInput);

    if (!isValidEmail(email)) {
        throw new Error("Please provide a valid email address.");
    }

    const user = await getUserByEmail(email);
    if (!user) {
        return {};
    }

    await ensureAuthSchema();
    const sql = getSql();

    await sql`
        DELETE FROM portal_password_resets
        WHERE user_id = ${user.id}::bigint;
    `;

    const resetToken = randomBytes(32).toString("hex");
    const resetTokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000);

    await sql`
        INSERT INTO portal_password_resets (token_hash, user_id, expires_at)
        VALUES (${resetTokenHash}, ${user.id}::bigint, ${expiresAt.toISOString()}::timestamptz);
    `;

    if (process.env.NODE_ENV !== "production") {
        return { devResetToken: resetToken };
    }

    return {};
}

export async function confirmPasswordReset(input: {
    email: string;
    token: string;
    newPassword: string;
}): Promise<void> {
    const email = normalizeEmail(input.email);
    const token = input.token.trim();
    const passwordValidationMessage = validatePasswordForAuth(input.newPassword);

    if (!isValidEmail(email)) {
        throw new Error("Please provide a valid email address.");
    }

    if (!token) {
        throw new Error("Reset token is required.");
    }

    if (passwordValidationMessage) {
        throw new Error(passwordValidationMessage);
    }

    const user = await getUserByEmail(email);
    if (!user) {
        throw new Error("Invalid reset token or email.");
    }

    await ensureAuthSchema();
    const sql = getSql();
    const tokenHash = hashToken(token);

    const resetRows = await sql<PasswordResetRow[]>`
        SELECT user_id
        FROM portal_password_resets
        WHERE token_hash = ${tokenHash}
          AND user_id = ${user.id}::bigint
          AND expires_at > NOW()
        LIMIT 1;
    `;

    if (!resetRows[0]) {
        throw new Error("Invalid or expired reset token.");
    }

    await sql`
        UPDATE "user-web"
        SET password_hash = ${hashPassword(input.newPassword.trim())},
            updated_at = NOW()
        WHERE id = ${user.id}::bigint;
    `;

    await sql`
        DELETE FROM portal_password_resets
        WHERE user_id = ${user.id}::bigint;
    `;

    await sql`
        DELETE FROM portal_sessions
        WHERE user_id = ${user.id}::bigint;
    `;
}

export const authCookieName = SESSION_COOKIE_NAME;
