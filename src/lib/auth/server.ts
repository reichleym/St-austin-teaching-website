import "server-only";

import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSql } from "@/lib/postgres";
import {
    GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT,
    normalizeGovernmentEmployeeGroup,
    normalizeGovernmentVerificationStatus,
    type GovernmentEmployeeGroup,
    type GovernmentVerificationStatus,
} from "@/lib/government-benefits";

const SESSION_COOKIE_NAME = "st_austin_portal_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_RESET_TTL_SECONDS = 60 * 30;
const EMAIL_VERIFICATION_TTL_SECONDS = 60 * 60 * 24 * 3;
const PASSWORD_MIN_LENGTH = 8;
const AUTH_SCHEMA_VERSION = 8;

export type ApplicationStatus = "not_started" | "under_review";

type UserRow = {
    id: number;
    full_name: string;
    email: string;
    password_hash: string;
    is_email_verified: boolean;
    is_enrolled: boolean;
    is_government_employee: boolean;
    government_employee_group: string | null;
    government_employee_id: string | null;
    government_verification_status: string;
    government_discount_percent: number;
};

type SessionUserRow = {
    id: number;
    full_name: string;
    email: string;
    is_email_verified: boolean;
    is_enrolled: boolean;
    is_government_employee: boolean;
    government_employee_group: string | null;
    government_employee_id: string | null;
    government_verification_status: string;
    government_discount_percent: number;
};

type PasswordResetRow = {
    user_id: number;
};

type EmailVerificationRow = {
    user_id: number;
};

type ApplicationStatusRow = {
    application_status: string;
};

export type AuthUser = {
    id: number;
    fullName: string;
    email: string;
    isEmailVerified: boolean;
    isEnrolled: boolean;
    isGovernmentEmployee: boolean;
    governmentEmployeeGroup: GovernmentEmployeeGroup | null;
    governmentEmployeeId: string | null;
    governmentVerificationStatus: GovernmentVerificationStatus;
    governmentDiscountPercent: number;
};

export type GovernmentBenefit = {
    isGovernmentEmployee: boolean;
    governmentEmployeeGroup: GovernmentEmployeeGroup | null;
    governmentEmployeeId: string | null;
    governmentVerificationStatus: GovernmentVerificationStatus;
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

function normalizeGovernmentEmployeeId(value: string | null | undefined): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
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
    is_email_verified?: boolean | null;
    is_enrolled?: boolean | null;
    is_government_employee?: boolean | null;
    government_employee_group?: string | null;
    government_employee_id?: string | null;
    government_verification_status?: string | null;
    government_discount_percent?: number | null;
}): AuthUser {
    const isGovernmentEmployee = Boolean(user.is_government_employee);
    const governmentEmployeeGroup = normalizeGovernmentEmployeeGroup(user.government_employee_group);
    const governmentEmployeeId = normalizeGovernmentEmployeeId(user.government_employee_id);
    const governmentVerificationStatus = normalizeGovernmentVerificationStatus(
        user.government_verification_status
    );
    const hasApprovedGovernmentDiscount = isGovernmentEmployee && governmentVerificationStatus === "approved";

    return {
        id: Number(user.id),
        fullName: user.full_name,
        email: user.email,
        isEmailVerified: Boolean(user.is_email_verified),
        isEnrolled: Boolean(user.is_enrolled),
        isGovernmentEmployee,
        governmentEmployeeGroup: isGovernmentEmployee ? governmentEmployeeGroup : null,
        governmentEmployeeId: isGovernmentEmployee ? governmentEmployeeId : null,
        governmentVerificationStatus: isGovernmentEmployee ? governmentVerificationStatus : "not_submitted",
        governmentDiscountPercent: hasApprovedGovernmentDiscount
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
            ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT FALSE;
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
            ADD COLUMN IF NOT EXISTS government_employee_id TEXT;
        `;

        await sql`
            ALTER TABLE "user-web"
            ADD COLUMN IF NOT EXISTS government_verification_status TEXT NOT NULL DEFAULT 'not_submitted';
        `;

        await sql`
            ALTER TABLE "user-web"
            ADD COLUMN IF NOT EXISTS government_discount_percent INTEGER NOT NULL DEFAULT 0;
        `;

        await sql`
            UPDATE "user-web"
            SET government_verification_status = CASE
                WHEN is_government_employee = TRUE AND COALESCE(government_discount_percent, 0) > 0 THEN 'approved'
                WHEN is_government_employee = TRUE THEN 'pending_review'
                ELSE 'not_submitted'
            END
            WHERE is_government_employee = TRUE
              AND government_verification_status = 'not_submitted';
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

        await sql`
            CREATE TABLE IF NOT EXISTS portal_email_verifications (
                token_hash TEXT PRIMARY KEY,
                user_id BIGINT NOT NULL REFERENCES "user-web"(id) ON DELETE CASCADE,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS portal_email_verifications_user_id_idx ON portal_email_verifications(user_id);
        `;
    })();

    return globalThis.__stAustinAuthSchemaReady;
}

async function getUserByEmail(email: string): Promise<UserRow | null> {
    await ensureAuthSchema();
    const sql = getSql();
    const rows = await sql<UserRow[]>`
        SELECT
            u.id,
            u.full_name,
            u.email,
            u.password_hash,
            COALESCE((to_jsonb(u) ->> 'is_email_verified')::boolean, FALSE) AS is_email_verified,
            u.is_enrolled,
            u.is_government_employee,
            u.government_employee_group,
            u.government_employee_id,
            u.government_verification_status,
            u.government_discount_percent
        FROM "user-web" u
        WHERE u.email = ${normalizeEmail(email)}
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
            RETURNING
                id,
                full_name,
                email,
                password_hash,
                is_enrolled,
                is_government_employee,
                government_employee_group,
                government_employee_id,
                government_verification_status,
                government_discount_percent;
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
            COALESCE((to_jsonb(u) ->> 'is_email_verified')::boolean, FALSE) AS is_email_verified,
            u.is_enrolled,
            u.is_government_employee,
            u.government_employee_group,
            u.government_employee_id,
            u.government_verification_status,
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
            government_employee_id: string | null;
            government_verification_status: string;
            government_discount_percent: number;
        }>
    >`
        SELECT
            u.is_government_employee,
            u.government_employee_group,
            u.government_employee_id,
            u.government_verification_status,
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
    const governmentVerificationStatus = normalizeGovernmentVerificationStatus(
        row.government_verification_status
    );
    const hasApprovedGovernmentDiscount =
        isGovernmentEmployee && governmentVerificationStatus === "approved";

    return {
        isGovernmentEmployee,
        governmentEmployeeGroup: isGovernmentEmployee
            ? normalizeGovernmentEmployeeGroup(row.government_employee_group)
            : null,
        governmentEmployeeId: isGovernmentEmployee
            ? normalizeGovernmentEmployeeId(row.government_employee_id)
            : null,
        governmentVerificationStatus: isGovernmentEmployee
            ? governmentVerificationStatus
            : "not_submitted",
        governmentDiscountPercent: hasApprovedGovernmentDiscount
            ? Number(row.government_discount_percent ?? GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT)
            : 0,
    };
}

export async function setCurrentUserGovernmentBenefit(input: {
    isGovernmentEmployee: boolean;
    governmentEmployeeGroup?: string | null;
    governmentEmployeeId?: string | null;
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
    const governmentEmployeeId = isGovernmentEmployee
        ? normalizeGovernmentEmployeeId(input.governmentEmployeeId)
        : null;

    if (isGovernmentEmployee && !governmentEmployeeGroup) {
        throw new Error("Please select your government employee category.");
    }

    if (isGovernmentEmployee && !governmentEmployeeId) {
        throw new Error("Please provide your government employee ID.");
    }

    const sql = getSql();
    const tokenHash = hashToken(rawToken);

    const rows = await sql<
        Array<{
            id: number;
            is_government_employee: boolean;
            government_employee_group: string | null;
            government_employee_id: string | null;
            government_verification_status: string;
            government_discount_percent: number;
        }>
    >`
        UPDATE "user-web" u
        SET is_government_employee = ${isGovernmentEmployee},
            government_employee_group = ${governmentEmployeeGroup},
            government_employee_id = ${governmentEmployeeId},
            government_verification_status = CASE
                WHEN ${isGovernmentEmployee} = FALSE THEN 'not_submitted'
                WHEN u.is_government_employee = TRUE
                    AND u.government_verification_status = 'approved'
                    AND u.government_employee_group IS NOT DISTINCT FROM ${governmentEmployeeGroup}
                    AND u.government_employee_id IS NOT DISTINCT FROM ${governmentEmployeeId}
                THEN 'approved'
                ELSE 'pending_review'
            END,
            government_discount_percent = CASE
                WHEN ${isGovernmentEmployee} = FALSE THEN 0
                WHEN u.is_government_employee = TRUE
                    AND u.government_verification_status = 'approved'
                    AND u.government_employee_group IS NOT DISTINCT FROM ${governmentEmployeeGroup}
                    AND u.government_employee_id IS NOT DISTINCT FROM ${governmentEmployeeId}
                THEN COALESCE(NULLIF(u.government_discount_percent, 0), ${GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT})
                ELSE 0
            END,
            updated_at = NOW()
        FROM portal_sessions s
        WHERE s.user_id = u.id
          AND s.token_hash = ${tokenHash}
          AND s.expires_at > NOW()
        RETURNING
            u.id,
            u.is_government_employee,
            u.government_employee_group,
            u.government_employee_id,
            u.government_verification_status,
            u.government_discount_percent;
    `;

    const updated = rows[0];
    if (!updated) {
        await clearSessionCookieAndData(rawToken);
        throw new Error("Unauthorized.");
    }

    return {
        isGovernmentEmployee: Boolean(updated.is_government_employee),
        governmentEmployeeGroup: normalizeGovernmentEmployeeGroup(updated.government_employee_group),
        governmentEmployeeId: normalizeGovernmentEmployeeId(updated.government_employee_id),
        governmentVerificationStatus: normalizeGovernmentVerificationStatus(
            updated.government_verification_status
        ),
        governmentDiscountPercent: Number(updated.government_discount_percent ?? 0),
    };
}

export async function reviewGovernmentBenefitByEmail(input: {
    email: string;
    decision: "approve" | "reject";
}): Promise<GovernmentBenefit> {
    const email = normalizeEmail(input.email);
    if (!isValidEmail(email)) {
        throw new Error("Please provide a valid email address.");
    }

    await ensureAuthSchema();
    const sql = getSql();

    const userRows = await sql<
        Array<{
            id: number;
            is_government_employee: boolean;
            government_employee_group: string | null;
            government_employee_id: string | null;
        }>
    >`
        SELECT id, is_government_employee, government_employee_group, government_employee_id
        FROM "user-web"
        WHERE email = ${email}
        LIMIT 1;
    `;

    const existing = userRows[0];
    if (!existing) {
        throw new Error("No user account found for that email address.");
    }

    if (
        !existing.is_government_employee ||
        !normalizeGovernmentEmployeeGroup(existing.government_employee_group) ||
        !normalizeGovernmentEmployeeId(existing.government_employee_id)
    ) {
        throw new Error("This user has not submitted a valid government employee discount request.");
    }

    const verificationStatus: GovernmentVerificationStatus =
        input.decision === "approve" ? "approved" : "rejected";
    const discountPercent =
        verificationStatus === "approved" ? GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT : 0;

    const rows = await sql<
        Array<{
            is_government_employee: boolean;
            government_employee_group: string | null;
            government_employee_id: string | null;
            government_verification_status: string;
            government_discount_percent: number;
        }>
    >`
        UPDATE "user-web"
        SET government_verification_status = ${verificationStatus},
            government_discount_percent = ${discountPercent},
            updated_at = NOW()
        WHERE id = ${existing.id}::bigint
        RETURNING
            is_government_employee,
            government_employee_group,
            government_employee_id,
            government_verification_status,
            government_discount_percent;
    `;

    const updated = rows[0];
    if (!updated) {
        throw new Error("Unable to update government discount review status.");
    }

    return {
        isGovernmentEmployee: Boolean(updated.is_government_employee),
        governmentEmployeeGroup: normalizeGovernmentEmployeeGroup(updated.government_employee_group),
        governmentEmployeeId: normalizeGovernmentEmployeeId(updated.government_employee_id),
        governmentVerificationStatus: normalizeGovernmentVerificationStatus(
            updated.government_verification_status
        ),
        governmentDiscountPercent:
            normalizeGovernmentVerificationStatus(updated.government_verification_status) ===
            "approved"
                ? Number(updated.government_discount_percent ?? GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT)
                : 0,
    };
}

async function createEmailVerificationTokenForUserId(userId: number): Promise<string> {
    await ensureAuthSchema();
    const sql = getSql();

    await sql`
        DELETE FROM portal_email_verifications
        WHERE user_id = ${userId}::bigint;
    `;

    const verificationToken = randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(verificationToken);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_SECONDS * 1000);

    await sql`
        INSERT INTO portal_email_verifications (token_hash, user_id, expires_at)
        VALUES (${verificationTokenHash}, ${userId}::bigint, ${expiresAt.toISOString()}::timestamptz);
    `;

    return verificationToken;
}

export async function createEmailVerificationTokenForUser(emailInput: string): Promise<string | null> {
    const email = normalizeEmail(emailInput);
    if (!isValidEmail(email)) {
        throw new Error("Please provide a valid email address.");
    }

    const user = await getUserByEmail(email);
    if (!user) {
        return null;
    }

    return createEmailVerificationTokenForUserId(Number(user.id));
}

export async function verifyEmailAddress(input: { email: string; token: string }): Promise<void> {
    const email = normalizeEmail(input.email);
    const token = input.token.trim();

    if (!isValidEmail(email)) {
        throw new Error("Please provide a valid email address.");
    }

    if (!token) {
        throw new Error("Verification token is required.");
    }

    const user = await getUserByEmail(email);
    if (!user) {
        throw new Error("Invalid verification token or email.");
    }

    await ensureAuthSchema();
    const sql = getSql();
    const tokenHash = hashToken(token);

    const verificationRows = await sql<EmailVerificationRow[]>`
        SELECT user_id
        FROM portal_email_verifications
        WHERE token_hash = ${tokenHash}
          AND user_id = ${user.id}::bigint
          AND expires_at > NOW()
        LIMIT 1;
    `;

    if (!verificationRows[0]) {
        throw new Error("Invalid or expired verification token.");
    }

    await sql`
        UPDATE "user-web"
        SET is_email_verified = TRUE,
            updated_at = NOW()
        WHERE id = ${user.id}::bigint;
    `;

    await sql`
        DELETE FROM portal_email_verifications
        WHERE user_id = ${user.id}::bigint;
    `;
}

export async function requestPasswordReset(emailInput: string): Promise<{
    resetToken?: string;
    devResetToken?: string;
    userEmail?: string;
    userFullName?: string;
}> {
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

    const result: {
        resetToken?: string;
        devResetToken?: string;
        userEmail?: string;
        userFullName?: string;
    } = {
        resetToken,
        userEmail: user.email,
        userFullName: user.full_name,
    };

    if (process.env.NODE_ENV !== "production") {
        result.devResetToken = resetToken;
    }

    return result;
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
