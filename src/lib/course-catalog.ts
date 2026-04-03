import "server-only";
import { getSql } from "@/lib/postgres";

type DbCourse = Record<string, unknown>;

type CourseColumnMap = {
    tableName: string;
    id?: string;
    title?: string;
    description?: string;
    programContent?: string;
    duration?: string;
    image?: string;
    degreeLevel?: string;
    fieldOfStudy?: string;
};

export type CourseCardItem = {
    id: string;
    title: string;
    description: string;
    programContent?: string;
    time: string;
    img: string;
    href: string;
};

export type CourseFilters = {
    degreeLevel: string[];
    fieldOfStudy: string[];
};

const TEXT_COLUMN_CANDIDATES = {
    id: ["id", "course_id", "uuid", "slug"],
    title: ["title", "course_name", "name", "program_name", "program_title"],
    description: ["description", "summary", "overview", "details"],
    programContent: ["program_content", "programContent", "programcontent"],
    duration: ["duration", "time", "length", "timeline"],
    image: ["image", "image_url", "thumbnail", "cover_image", "banner_image"],
    degreeLevel: ["degree_level", "degree", "level", "program_level", "degree_type"],
    fieldOfStudy: ["field_of_study", "field", "study_field", "discipline", "major"],
} as const;

function normalize(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function quoteIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, "\"\"")}"`;
}

function pickColumn(columnNames: string[], candidates: readonly string[]): string | undefined {
    const normalizedLookup = new Map(columnNames.map((name) => [normalize(name), name]));
    for (const candidate of candidates) {
        const hit = normalizedLookup.get(normalize(candidate));
        if (hit) {
            return hit;
        }
    }
    return undefined;
}

async function getCourseColumns(): Promise<CourseColumnMap> {
    const sql = getSql();

    const tableRows = await sql<
        Array<{
            table_name: string;
        }>
    >`
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and lower(table_name) in ('course', 'courses')
        order by case
            when lower(table_name) = 'course' then 0
            else 1
        end
        limit 1
    `;

    const tableName = tableRows[0]?.table_name;

    if (!tableName) {
        throw new Error("Could not find a course table in the public schema.");
    }

    const rows = await sql<
        Array<{
            column_name: string;
        }>
    >`
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = ${tableName}
    `;

    const columnNames = rows.map((row) => row.column_name);

    return {
        tableName,
        id: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.id),
        title: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.title),
        description: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.description),
        programContent: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.programContent),
        duration: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.duration),
        image: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.image),
        degreeLevel: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.degreeLevel),
        fieldOfStudy: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.fieldOfStudy),
    };
}

async function getDistinctValues(tableName: string, column?: string): Promise<string[]> {
    if (!column) {
        return [];
    }

    const sql = getSql();
    const quotedTable = quoteIdentifier(tableName);
    const quoted = quoteIdentifier(column);
    const query = `
        select distinct ${quoted}::text as value
        from ${quotedTable}
        where ${quoted} is not null
          and btrim(${quoted}::text) <> ''
        order by value asc
    `;

    const rows = await sql.unsafe<Array<{ value: string }>>(query);
    return rows.map((row) => row.value);
}

function getSafeString(value: unknown, fallback = ""): string {
    if (typeof value === "string" && value.trim().length > 0) {
        return value;
    }
    if (typeof value === "number") {
        return String(value);
    }
    return fallback;
}

function getOptionalJsonString(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim().length > 0) {
        return value;
    }

    if (value && typeof value === "object") {
        try {
            return JSON.stringify(value);
        } catch {
            return undefined;
        }
    }

    return undefined;
}

function toProgramSlug(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function mapCourseRow(row: DbCourse, columns: CourseColumnMap, index: number): CourseCardItem {
    const idValue =
        (columns.id ? row[columns.id] : undefined) ?? row.id ?? row.course_id ?? row.slug ?? index + 1;
    const id = String(idValue);

    const title = getSafeString(
        columns.title ? row[columns.title] : undefined,
        getSafeString(row.title, `Course ${index + 1}`)
    );
    const description = getSafeString(
        columns.description ? row[columns.description] : undefined,
        getSafeString(row.description, "Program information coming soon.")
    );
    const programContent = getOptionalJsonString(
        columns.programContent ? row[columns.programContent] : row.programContent
    );
    const time = getSafeString(
        columns.duration ? row[columns.duration] : undefined,
        getSafeString(row.duration, "Duration TBD")
    );
    const img = getSafeString(
        columns.image ? row[columns.image] : undefined,
        "/news-card-img.png"
    );

    return {
        id,
        title,
        description,
        programContent,
        time,
        img,
        href: `/program/${encodeURIComponent(id)}`,
    };
}

export async function getCourseFilters(): Promise<CourseFilters> {
    const columns = await getCourseColumns();
    const [degreeLevel, fieldOfStudy] = await Promise.all([
        getDistinctValues(columns.tableName, columns.degreeLevel),
        getDistinctValues(columns.tableName, columns.fieldOfStudy),
    ]);

    return { degreeLevel, fieldOfStudy };
}

export async function getCourses(filters: {
    degreeLevel?: string;
    fieldOfStudy?: string;
}): Promise<CourseCardItem[]> {
    const sql = getSql();
    const columns = await getCourseColumns();
    const conditions: string[] = [];
    const params: string[] = [];

    if (filters.degreeLevel && columns.degreeLevel) {
        params.push(filters.degreeLevel);
        const quoted = quoteIdentifier(columns.degreeLevel);
        conditions.push(`lower(${quoted}::text) = lower($${params.length})`);
    }

    if (filters.fieldOfStudy && columns.fieldOfStudy) {
        params.push(filters.fieldOfStudy);
        const quoted = quoteIdentifier(columns.fieldOfStudy);
        conditions.push(`lower(${quoted}::text) = lower($${params.length})`);
    }

    const where = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
    const quotedTable = quoteIdentifier(columns.tableName);
    const query = `
        select *
        from ${quotedTable}
        ${where}
        limit 100
    `;

    const rows = await sql.unsafe<DbCourse[]>(query, params);
    return rows.map((row, index) => mapCourseRow(row, columns, index));
}

export async function getCourseById(courseId: string): Promise<CourseCardItem | null> {
    const sql = getSql();
    const columns = await getCourseColumns();
    const normalizedCourseId = courseId.trim();

    if (normalizedCourseId.length === 0) {
        return null;
    }

    if (columns.id) {
        const quotedTable = quoteIdentifier(columns.tableName);
        const quotedId = quoteIdentifier(columns.id);
        const rowByIdQuery = `
            select *
            from ${quotedTable}
            where lower(${quotedId}::text) = lower($1)
            limit 1
        `;
        const rowById = await sql.unsafe<DbCourse[]>(rowByIdQuery, [normalizedCourseId]);

        if (rowById.length > 0) {
            return mapCourseRow(rowById[0], columns, 0);
        }
    }

    // Fallback for routes using a title slug when id lookup does not match.
    const quotedTable = quoteIdentifier(columns.tableName);
    const rows = await sql.unsafe<DbCourse[]>(`
        select *
        from ${quotedTable}
        limit 500
    `);
    const mappedRows = rows.map((row, index) => mapCourseRow(row, columns, index));
    const normalizedId = normalizedCourseId.toLowerCase();
    const normalizedSlug = toProgramSlug(normalizedCourseId);

    return (
        mappedRows.find((course) => course.id.toLowerCase() === normalizedId) ??
        mappedRows.find((course) => toProgramSlug(course.title) === normalizedSlug) ??
        null
    );
}
