import "server-only";
import postgres from "postgres";

const DATABASE_ENV_KEYS = [
    "st_austin_teaching_platform_DATABASE_URL",
    "st_austin_teaching_platform_POSTGRES_URL",
    "st_austin_teaching_platform_PRISMA_DATABASE_URL",
    "DATABASE_URL",
    "POSTGRES_URL",
    "PRISMA_DATABASE_URL",
] as const;

type DatabaseEnvKey = (typeof DATABASE_ENV_KEYS)[number];

function getDatabaseConnectionFromEnv(): {
    connectionString?: string;
    source?: DatabaseEnvKey;
} {
    for (const key of DATABASE_ENV_KEYS) {
        const value = process.env[key];
        if (typeof value === "string" && value.trim().length > 0) {
            return {
                connectionString: value.trim(),
                source: key,
            };
        }
    }

    return {};
}

const databaseConnection = getDatabaseConnectionFromEnv();
const connectionString = databaseConnection.connectionString;
const connectionSource = databaseConnection.source;

export const isDatabaseConfigured = Boolean(connectionString);
export const databaseEnvKeys = [...DATABASE_ENV_KEYS];
export const databaseConfigSource = connectionSource ?? null;

type PostgresClient = ReturnType<typeof postgres>;

const globalForPostgres = globalThis as typeof globalThis & {
    __stAustinPostgres?: PostgresClient;
    __stAustinDbConfigLogged?: boolean;
};

function logDbConfig(status: "configured" | "missing"): void {
    if (globalForPostgres.__stAustinDbConfigLogged) {
        return;
    }

    if (status === "configured") {
        console.info("[db] Postgres configured", {
            source: connectionSource,
        });
    } else {
        console.warn("[db] Postgres is not configured. Set one of these env vars:", databaseEnvKeys);
    }

    globalForPostgres.__stAustinDbConfigLogged = true;
}

function createClient(): PostgresClient {
    if (!connectionString) {
        logDbConfig("missing");
        throw new Error(
            `Missing database URL. Set one of: ${databaseEnvKeys.join(", ")}`
        );
    }

    logDbConfig("configured");
    return postgres(connectionString, {
        prepare: false,
        ssl: "require",
    });
}

let sqlClient: PostgresClient | undefined = globalForPostgres.__stAustinPostgres;

export function getSql(): PostgresClient {
    if (sqlClient) {
        return sqlClient;
    }

    sqlClient = createClient();

    if (process.env.NODE_ENV !== "production") {
        globalForPostgres.__stAustinPostgres = sqlClient;
    }

    return sqlClient;
}
