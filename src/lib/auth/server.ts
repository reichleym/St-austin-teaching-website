import "server-only";

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSql } from "@/lib/postgres";
import {
    GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT,
    normalizeGovernmentEmployeeGroup,
    type GovernmentEmployeeGroup,
} from "@/lib/government-benefits";

const SESSION_COOKIE_NAME = "st_austin_portal_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_RESET_TTL_SECONDS = 60 * 30;
const PASSWORD_MIN_LENGTH = 8;
const AUTH_SCHEMA_VERSION = 5;

export type ApplicationStatus = "not_started" | "under_review";

type UserRow = {
    id: number;
    full_name: string;
    email: string;
    password_hash: string;
    is_enrolled: boolean;
    is_government_employee: boolean;
    government_employee_group: string | null;
    government_discount_percent: number;
};

type SessionUserRow = {
    id: number;
    full_name: string;
    email: string;
    is_enrolled: boolean;
    is_government_employee: boolean;
    government_employee_group: string | null;
    government_discount_percent: number;
};

type PasswordResetRow = {
    user_id: number;
};

type ApplicationStatusRow = {
    application_status: string;
};

export type AuthUser = {
    id: number;
    fullName: string;
    email: string;
    isEnrolled: boolean;
    isGovernmentEmployee: boolean;
    governmentEmployeeGroup: GovernmentEmployeeGroup | null;
    governmentDiscountPercent: number;
};

export type GovernmentBenefit = {
    isGovernmentEmployee: boolean;
    governmentEmployeeGroup: GovernmentEmployeeGroup | null;
    governmentDiscountPercent: number;
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

function normalizeApplicationStatus(value: string | null | undefined): ApplicationStatus {
    return value === "under_review" ? "under_review" : "not_started";
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

function toAuthUser(user: {
    id: number;
    full_name: string;
    email: string;
    is_enrolled?: boolean | null;
    is_government_employee?: boolean | null;
    government_employee_group?: string | null;
    government_discount_percent?: number | null;
}): AuthUser {
    const isGovernmentEmployee = Boolean(user.is_government_employee);
    const governmentEmployeeGroup = normalizeGovernmentEmployeeGroup(user.government_employee_group);

    return {
        id: Number(user.id),
        fullName: user.full_name,
        email: user.email,
        isEnrolled: Boolean(user.is_enrolled),
        isGovernmentEmployee,
        governmentEmployeeGroup: isGovernmentEmployee ? governmentEmployeeGroup : null,
        governmentDiscountPercent: isGovernmentEmployee
            ? Number(user.government_discount_percent ?? GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT)
            : 0,
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
            ALTER TABLE "user-web"
            ADD COLUMN IF NOT EXISTS is_enrolled BOOLEAN NOT NULL DEFAULT FALSE;
        `;

        await sql`
            ALTER TABLE "user-web"
            ADD COLUMN IF NOT EXISTS application_status TEXT NOT NULL DEFAULT 'not_started';
        `;

        await sql`
            ALTER TABLE "user-web"
            ADD COLUMN IF NOT EXISTS is_government_employee BOOLEAN NOT NULL DEFAULT FALSE;
        `;

        await sql`
            ALTER TABLE "user-web"
            ADD COLUMN IF NOT EXISTS government_employee_group TEXT;
        `;

        await sql`
            ALTER TABLE "user-web"
            ADD COLUMN IF NOT EXISTS government_discount_percent INTEGER NOT NULL DEFAULT 0;
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
        SELECT id, full_name, email, password_hash, is_enrolled, is_government_employee, government_employee_group, government_discount_percent
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
            RETURNING id, full_name, email, password_hash, is_enrolled, is_government_employee, government_employee_group, government_discount_percent;
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
        SELECT
            u.id,
            u.full_name,
            u.email,
            u.is_enrolled,
            u.is_government_employee,
            u.government_employee_group,
            u.government_discount_percent
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

export async function getCurrentUserApplicationStatus(): Promise<ApplicationStatus> {
    await ensureAuthSchema();
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!rawToken) {
        return "not_started";
    }

    const sql = getSql();
    const tokenHash = hashToken(rawToken);

    const rows = await sql<ApplicationStatusRow[]>`
        SELECT u.application_status
        FROM portal_sessions s
        INNER JOIN "user-web" u ON u.id = s.user_id
        WHERE s.token_hash = ${tokenHash}
          AND s.expires_at > NOW()
        LIMIT 1;
    `;

    const row = rows[0];
    if (!row) {
        await clearSessionCookieAndData(rawToken);
        return "not_started";
    }

    return normalizeApplicationStatus(row.application_status);
}

export async function setCurrentUserApplicationStatus(status: ApplicationStatus): Promise<void> {
    await ensureAuthSchema();
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!rawToken) {
        throw new Error("Unauthorized.");
    }

    const sql = getSql();
    const tokenHash = hashToken(rawToken);

    const rows = await sql<{ id: number }[]>`
        UPDATE "user-web" u
        SET application_status = ${status},
            updated_at = NOW()
        FROM portal_sessions s
        WHERE s.user_id = u.id
          AND s.token_hash = ${tokenHash}
          AND s.expires_at > NOW()
        RETURNING u.id;
    `;

    if (!rows[0]) {
        await clearSessionCookieAndData(rawToken);
        throw new Error("Unauthorized.");
    }
}

export async function getCurrentUserGovernmentBenefit(): Promise<GovernmentBenefit> {
    await ensureAuthSchema();
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!rawToken) {
        throw new Error("Unauthorized.");
    }

    const sql = getSql();
    const tokenHash = hashToken(rawToken);

    const rows = await sql<
        Array<{
            is_government_employee: boolean;
            government_employee_group: string | null;
            government_discount_percent: number;
        }>
    >`
        SELECT
            u.is_government_employee,
            u.government_employee_group,
            u.government_discount_percent
        FROM portal_sessions s
        INNER JOIN "user-web" u ON u.id = s.user_id
        WHERE s.token_hash = ${tokenHash}
          AND s.expires_at > NOW()
        LIMIT 1;
    `;

    const row = rows[0];
    if (!row) {
        await clearSessionCookieAndData(rawToken);
        throw new Error("Unauthorized.");
    }

    const isGovernmentEmployee = Boolean(row.is_government_employee);
    return {
        isGovernmentEmployee,
        governmentEmployeeGroup: isGovernmentEmployee
            ? normalizeGovernmentEmployeeGroup(row.government_employee_group)
            : null,
        governmentDiscountPercent: isGovernmentEmployee
            ? Number(row.government_discount_percent ?? GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT)
            : 0,
    };
}

export async function setCurrentUserGovernmentBenefit(input: {
    isGovernmentEmployee: boolean;
    governmentEmployeeGroup?: string | null;
}): Promise<GovernmentBenefit> {
    await ensureAuthSchema();
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!rawToken) {
        throw new Error("Unauthorized.");
    }

    const isGovernmentEmployee = Boolean(input.isGovernmentEmployee);
    const governmentEmployeeGroup = isGovernmentEmployee
        ? normalizeGovernmentEmployeeGroup(input.governmentEmployeeGroup)
        : null;

    if (isGovernmentEmployee && !governmentEmployeeGroup) {
        throw new Error("Please select your government employee category.");
    }

    const discountPercent = isGovernmentEmployee ? GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT : 0;

    const sql = getSql();
    const tokenHash = hashToken(rawToken);

    const rows = await sql<
        Array<{
            id: number;
            is_government_employee: boolean;
            government_employee_group: string | null;
            government_discount_percent: number;
        }>
    >`
        UPDATE "user-web" u
        SET is_government_employee = ${isGovernmentEmployee},
            government_employee_group = ${governmentEmployeeGroup},
            government_discount_percent = ${discountPercent},
            updated_at = NOW()
        FROM portal_sessions s
        WHERE s.user_id = u.id
          AND s.token_hash = ${tokenHash}
          AND s.expires_at > NOW()
        RETURNING u.id, u.is_government_employee, u.government_employee_group, u.government_discount_percent;
    `;

    const updated = rows[0];
    if (!updated) {
        await clearSessionCookieAndData(rawToken);
        throw new Error("Unauthorized.");
    }

    return {
        isGovernmentEmployee: Boolean(updated.is_government_employee),
        governmentEmployeeGroup: normalizeGovernmentEmployeeGroup(updated.government_employee_group),
        governmentDiscountPercent: Number(updated.government_discount_percent ?? 0),
    };
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
