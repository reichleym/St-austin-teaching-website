import "server-only";
import { getSql } from "@/lib/postgres";
import { toLanguage, type Language } from "@/lib/i18n/catalog";

type DbCourse = Record<string, unknown>;

type CourseColumnMap = {
    tableName: string;
    id?: string;
    title?: string;
    description?: string;
    programContent?: string;
    duration?: string;
    durationFr?: string;
    durationEs?: string;
    programType?: string;
    programTypeFr?: string;
    programTypeEs?: string;
    image?: string;
    degreeLevel?: string;
    degreeLevelFr?: string;
    degreeLevelEs?: string;
    fieldOfStudy?: string;
    fieldOfStudyFr?: string;
    fieldOfStudyEs?: string;
    visibility?: string;
    translations?: string;
};

export type CourseCardItem = {
    id: string;
    title: string;
    description: string;
    programContent?: string;
    time: string;
    programType?: string;
    img: string;
    href: string;
};

export type CourseFilters = {
    degreeLevel: string[];
    fieldOfStudy: string[];
};

const TEXT_COLUMN_CANDIDATES = {
    id: ["id", "code", "course_id", "program_id", "uuid", "slug"],
    title: ["title", "course_name", "name", "program_name", "program_title"],
    description: ["description", "summary", "overview", "details"],
    programContent: ["program_content", "programContent", "programcontent"],
    duration: ["programDuration", "program_duration", "duration", "time", "length", "timeline"],
    programType: ["programType", "program_type", "deliveryMode", "delivery_mode", "studyMode", "study_mode"],
    image: ["image", "image_url", "thumbnail", "cover_image", "banner_image"],
    degreeLevel: ["degree_level", "degree", "level", "program_level", "degree_type", "degreeLevel", "programLevel"],
    fieldOfStudy: ["field_of_study", "field", "study_field", "discipline", "major", "fieldOfStudy", "studyField"],
    visibility: ["visibility", "publish_status", "is_published"],
    translations: ["translations", "translation", "i18n", "localizations", "localized_content"],
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

function pickLocalizedColumn(columnNames: string[], baseCandidates: readonly string[], localeSuffixes = ["_fr", "fr"]): string | undefined {
    // look for columns that include a locale suffix and whose base matches a candidate
    for (const col of columnNames) {
        for (const suffix of localeSuffixes) {
            if (col.toLowerCase().endsWith(suffix.toLowerCase())) {
                const base = col.slice(0, -suffix.length);
                for (const candidate of baseCandidates) {
                    if (normalize(base) === normalize(candidate)) {
                        return col;
                    }
                }
            }
        }
    }

    // fallback: check candidates with suffix appended
    for (const suffix of localeSuffixes) {
        for (const candidate of baseCandidates) {
            const candidateWith = `${candidate}${suffix}`;
            const hit = pickColumn(columnNames, [candidateWith]);
            if (hit) return hit;
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
          and lower(table_name) in ('program', 'programs', 'course', 'courses')
        order by case
            when lower(table_name) = 'program' then 0
            when lower(table_name) = 'programs' then 1
            when lower(table_name) = 'course' then 2
            when lower(table_name) = 'courses' then 3
            else 4
        end
        limit 1
    `;

    const tableName = tableRows[0]?.table_name;

    if (!tableName) {
        throw new Error("Could not find a program/course table in the public schema.");
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
        durationFr: pickLocalizedColumn(columnNames, TEXT_COLUMN_CANDIDATES.duration),
        durationEs: pickLocalizedColumn(columnNames, TEXT_COLUMN_CANDIDATES.duration, ["_es", "es"]),
        programType: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.programType),
        programTypeFr: pickLocalizedColumn(columnNames, TEXT_COLUMN_CANDIDATES.programType),
        programTypeEs: pickLocalizedColumn(columnNames, TEXT_COLUMN_CANDIDATES.programType, ["_es", "es"]),
        image: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.image),
        degreeLevel: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.degreeLevel),
        degreeLevelFr: pickLocalizedColumn(columnNames, TEXT_COLUMN_CANDIDATES.degreeLevel),
        degreeLevelEs: pickLocalizedColumn(columnNames, TEXT_COLUMN_CANDIDATES.degreeLevel, ["_es", "es"]),
        fieldOfStudy: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.fieldOfStudy),
        fieldOfStudyFr: pickLocalizedColumn(columnNames, TEXT_COLUMN_CANDIDATES.fieldOfStudy),
        fieldOfStudyEs: pickLocalizedColumn(columnNames, TEXT_COLUMN_CANDIDATES.fieldOfStudy, ["_es", "es"]),
        visibility: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.visibility),
        translations: pickColumn(columnNames, TEXT_COLUMN_CANDIDATES.translations),
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

function formatDbEnumLabel(value: string): string {
    return value.replace(/_/g, " ").replace(/\s+/g, " ").trim();
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

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toProgramSlug(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function getProgramContentObject(value: unknown): Record<string, unknown> | null {
    if (!value) {
        return null;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return null;
        }

        try {
            const parsed: unknown = JSON.parse(trimmed);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                return parsed as Record<string, unknown>;
            }
        } catch {
            return null;
        }

        return null;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }

    return null;
}

function getTranslationForLanguage(rawTranslations: unknown, language: Language): Record<string, unknown> | null {
    const root = getProgramContentObject(rawTranslations);
    if (!root) {
        return null;
    }

    const translation = root[language];
    if (isRecord(translation)) {
        return translation;
    }

    return null;
}

function pickProgramContentText(
    content: Record<string, unknown> | null,
    keys: readonly string[]
): string {
    if (!content) {
        return "";
    }

    for (const key of keys) {
        const value = getSafeString(content[key], "");
        if (value.length > 0) {
            return value;
        }
    }

    return "";
}

function looksLikeLocalizedProgramContent(content: Record<string, unknown> | null): boolean {
    if (!content) {
        return false;
    }

    return isRecord(content.en) || isRecord(content.fr);
}

function toLocalizedProgramContent(
    rawProgramContent: unknown,
    rawTranslations: unknown
): string | undefined {
    const parsedProgramContent = getProgramContentObject(rawProgramContent);
    const hasLocalizedContent = looksLikeLocalizedProgramContent(parsedProgramContent);

    const enContent = hasLocalizedContent
        ? (isRecord(parsedProgramContent?.en) ? (parsedProgramContent?.en as Record<string, unknown>) : {})
        : (parsedProgramContent ?? {});

    const enFromTranslations = getTranslationForLanguage(rawTranslations, "en");
    const mergedEnContent =
        enFromTranslations && Object.keys(enFromTranslations).length > 0
            ? { ...enContent, ...enFromTranslations }
            : enContent;

    const frFromProgramContent = hasLocalizedContent
        ? (isRecord(parsedProgramContent?.fr) ? (parsedProgramContent?.fr as Record<string, unknown>) : {})
        : {};

    const frFromTranslations = getTranslationForLanguage(rawTranslations, "fr");
    const frContent =
        frFromTranslations && Object.keys(frFromTranslations).length > 0
            ? { ...frFromProgramContent, ...frFromTranslations }
            : frFromProgramContent;

    const esFromProgramContent = hasLocalizedContent
        ? (isRecord(parsedProgramContent?.es) ? (parsedProgramContent?.es as Record<string, unknown>) : {})
        : {};

    const esFromTranslations = getTranslationForLanguage(rawTranslations, "es");
    const esContent =
        esFromTranslations && Object.keys(esFromTranslations).length > 0
            ? { ...esFromProgramContent, ...esFromTranslations }
            : esFromProgramContent;

    const result: Record<string, unknown> = { en: mergedEnContent };
    if (Object.keys(frContent).length > 0) {
        result.fr = frContent;
    }
    if (Object.keys(esContent).length > 0) {
        result.es = esContent;
    }

    try {
        return JSON.stringify(result);
    } catch {
        return getOptionalJsonString(rawProgramContent);
    }
}

function buildPublishedVisibilityCondition(column: string): string {
    const quoted = quoteIdentifier(column);
    return `(${quoted} is null or lower(${quoted}::text) in ('published', 'active', 'public', 'visible'))`;
}

function addPublishedVisibilityCondition(conditions: string[], columns: CourseColumnMap): void {
    if (!columns.visibility) {
        return;
    }

    conditions.push(buildPublishedVisibilityCondition(columns.visibility));
}

function getWhereClause(conditions: string[]): string {
    if (conditions.length === 0) {
        return "";
    }

    return `where ${conditions.join(" and ")}`;
}

function mapCourseRow(row: DbCourse, columns: CourseColumnMap, index: number, language: Language): CourseCardItem {
    const idValue =
        (columns.id ? row[columns.id] : undefined) ?? row.id ?? row.course_id ?? row.slug ?? index + 1;
    const id = String(idValue);

    const rawTranslations = columns.translations ? row[columns.translations] : row.translations;
    const translation = getTranslationForLanguage(rawTranslations, language);

    const title = getSafeString(
        translation?.title ?? (columns.title ? row[columns.title] : undefined),
        getSafeString(row.title, `Course ${index + 1}`)
    );
    const rawProgramContent = columns.programContent ? row[columns.programContent] : row.programContent;
    const parsedProgramContent = getProgramContentObject(rawProgramContent);
    const descriptionFromProgramContent = pickProgramContentText(parsedProgramContent, [
        "description",
        "overview",
        "summary",
    ]);
    const localizedDescription = pickProgramContentText(translation, [
        "description",
        "overview",
        "summary",
        "details",
    ]);
    const description =
        localizedDescription ||
        descriptionFromProgramContent ||
        getSafeString(columns.description ? row[columns.description] : undefined, "Program information coming soon.");

    const durationFromProgramContent = pickProgramContentText(parsedProgramContent, [
        "duration",
        "timeline",
        "time",
    ]);
    const localizedDuration = pickProgramContentText(translation, ["duration", "timeline", "time", "length"]);
    const durationColumn =
        language === "fr"
            ? columns.durationFr ?? columns.duration
            : language === "es"
            ? columns.durationEs ?? columns.duration
            : columns.duration;
    const durationFromColumns = durationColumn ? getSafeString(row[durationColumn], "") : "";
    const time = localizedDuration || durationFromProgramContent || durationFromColumns || "TBD";

    const programTypeColumn =
        language === "fr"
            ? columns.programTypeFr ?? columns.programType
            : language === "es"
            ? columns.programTypeEs ?? columns.programType
            : columns.programType;
    const programTypeFromColumns = programTypeColumn ? getSafeString(row[programTypeColumn], "") : "";
    const programType =
        programTypeColumn
            ? programTypeFromColumns
                ? formatDbEnumLabel(programTypeFromColumns)
                : "TBD"
            : "TBD";
    const img = getSafeString(
        columns.image ? row[columns.image] : undefined,
        "/news-card-img.png"
    );

    const programContent = toLocalizedProgramContent(rawProgramContent, rawTranslations) ?? getOptionalJsonString(rawProgramContent);

    return {
        id,
        title,
        description,
        programContent,
        time,
        programType,
        img,
        href: `/program/${encodeURIComponent(id)}`,
    };
}

export async function getCourseFilters(language: string | null = null): Promise<CourseFilters> {
    const columns = await getCourseColumns();
    const lang = toLanguage(language) ?? "en";

    const degreeColumn =
        lang === "fr"
            ? columns.degreeLevelFr ?? columns.degreeLevel
            : lang === "es"
            ? columns.degreeLevelEs ?? columns.degreeLevel
            : columns.degreeLevel;
    const fieldColumn =
        lang === "fr"
            ? columns.fieldOfStudyFr ?? columns.fieldOfStudy
            : lang === "es"
            ? columns.fieldOfStudyEs ?? columns.fieldOfStudy
            : columns.fieldOfStudy;

    const [degreeLevel, fieldOfStudy] = await Promise.all([
        getDistinctValues(columns.tableName, degreeColumn),
        getDistinctValues(columns.tableName, fieldColumn),
    ]);

    return { degreeLevel, fieldOfStudy };
}

export async function getCourses(filters: {
    degreeLevel?: string;
    fieldOfStudy?: string;
    language?: Language;
}): Promise<CourseCardItem[]> {
    const sql = getSql();
    const columns = await getCourseColumns();
    const conditions: string[] = [];
    const params: string[] = [];
    const language = toLanguage(filters.language ?? null) ?? "en";

    addPublishedVisibilityCondition(conditions, columns);

    const degreeColumn =
        language === "fr"
            ? columns.degreeLevelFr ?? columns.degreeLevel
            : language === "es"
            ? columns.degreeLevelEs ?? columns.degreeLevel
            : columns.degreeLevel;
    const fieldColumn =
        language === "fr"
            ? columns.fieldOfStudyFr ?? columns.fieldOfStudy
            : language === "es"
            ? columns.fieldOfStudyEs ?? columns.fieldOfStudy
            : columns.fieldOfStudy;

    if (filters.degreeLevel && degreeColumn) {
        params.push(filters.degreeLevel);
        const quoted = quoteIdentifier(degreeColumn);
        conditions.push(`lower(${quoted}::text) = lower($${params.length})`);
    }

    if (filters.fieldOfStudy && fieldColumn) {
        params.push(filters.fieldOfStudy);
        const quoted = quoteIdentifier(fieldColumn);
        conditions.push(`lower(${quoted}::text) = lower($${params.length})`);
    }

    const where = getWhereClause(conditions);
    const quotedTable = quoteIdentifier(columns.tableName);
    const query = `
        select *
        from ${quotedTable}
        ${where}
        limit 100
    `;

    const rows = await sql.unsafe<DbCourse[]>(query, params);
    return rows.map((row, index) => mapCourseRow(row, columns, index, language));
}

export async function getCourseById(courseId: string, language: Language = "en"): Promise<CourseCardItem | null> {
    const sql = getSql();
    const columns = await getCourseColumns();
    const normalizedCourseId = courseId.trim();
    const resolvedLanguage = toLanguage(language) ?? "en";

    if (normalizedCourseId.length === 0) {
        return null;
    }

    const baseConditions: string[] = [];
    addPublishedVisibilityCondition(baseConditions, columns);

    if (columns.id) {
        const quotedTable = quoteIdentifier(columns.tableName);
        const quotedId = quoteIdentifier(columns.id);
        const conditions = [...baseConditions, `lower(${quotedId}::text) = lower($1)`];
        const rowByIdQuery = `
            select *
            from ${quotedTable}
            where ${conditions.join(" and ")}
            limit 1
        `;
        const rowById = await sql.unsafe<DbCourse[]>(rowByIdQuery, [normalizedCourseId]);

        if (rowById.length > 0) {
            return mapCourseRow(rowById[0], columns, 0, resolvedLanguage);
        }
    }

    // Fallback for routes using a title slug when id lookup does not match.
    const quotedTable = quoteIdentifier(columns.tableName);
    const where = getWhereClause(baseConditions);
    const rows = await sql.unsafe<DbCourse[]>(`
        select *
        from ${quotedTable}
        ${where}
        limit 500
    `);
    const mappedRows = rows.map((row, index) => mapCourseRow(row, columns, index, resolvedLanguage));
    const normalizedId = normalizedCourseId.toLowerCase();
    const normalizedSlug = toProgramSlug(normalizedCourseId);

    return (
        mappedRows.find((course) => course.id.toLowerCase() === normalizedId) ??
        mappedRows.find((course) => toProgramSlug(course.title) === normalizedSlug) ??
        null
    );
}
