import "server-only";
import postgres from "postgres";

const connectionString =
    process.env.st_austin_teaching_platform_DATABASE_URL ||
    process.env.st_austin_teaching_platform_POSTGRES_URL ||
    process.env.st_austin_teaching_platform_PRISMA_DATABASE_URL;

type PostgresClient = ReturnType<typeof postgres>;

const globalForPostgres = globalThis as typeof globalThis & {
    __stAustinPostgres?: PostgresClient;
};

function createClient(): PostgresClient {
    if (!connectionString) {
        throw new Error(
            "Missing database URL. Set st_austin_teaching_platform_DATABASE_URL (or *_POSTGRES_URL / *_PRISMA_DATABASE_URL)."
        );
    }

    return postgres(connectionString, {
        prepare: false,
        ssl: "require",
    });
}

export const sql = globalForPostgres.__stAustinPostgres ?? createClient();

if (process.env.NODE_ENV !== "production") {
    globalForPostgres.__stAustinPostgres = sql;
}
