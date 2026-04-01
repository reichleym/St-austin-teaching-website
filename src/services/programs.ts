export type ProgramCardItem = {
    id: string;
    title: string;
    description: string;
    time: string;
    img: string;
    href: string;
};

export type ProgramFilters = {
    degreeLevel: string[];
    fieldOfStudy: string[];
};

type ProgramsApiResponse = {
    ok: boolean;
    data?: ProgramCardItem[];
    filters?: ProgramFilters;
    error?: string;
};

type ProgramSearchInput = {
    degreeLevel?: string;
    fieldOfStudy?: string;
    includeFilters?: boolean;
};

const PROGRAMS_API_PATH = "/api/courses";

function logInfo(message: string, details?: Record<string, unknown>): void {
    console.info(`[programs-service] ${message}`, details ?? {});
}

function logError(message: string, details?: Record<string, unknown>): void {
    console.error(`[programs-service] ${message}`, details ?? {});
}

function buildSearchParams(input: ProgramSearchInput): URLSearchParams {
    const params = new URLSearchParams();

    if (input.degreeLevel) {
        params.set("degreeLevel", input.degreeLevel);
    }

    if (input.fieldOfStudy) {
        params.set("fieldOfStudy", input.fieldOfStudy);
    }

    if (input.includeFilters) {
        params.set("includeFilters", "1");
    }

    return params;
}

async function requestPrograms(input: ProgramSearchInput = {}): Promise<ProgramsApiResponse> {
    const params = buildSearchParams(input);
    const query = params.toString();
    const url = query.length > 0 ? `${PROGRAMS_API_PATH}?${query}` : PROGRAMS_API_PATH;
    const startedAt = Date.now();

    logInfo("Request started", { url, input });

    let response: Response;
    try {
        response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            cache: "no-store",
        });
    } catch (error) {
        logError("Network error while calling courses API", { url, error });
        throw new Error("Unable to reach courses API.");
    }

    let payload: ProgramsApiResponse | undefined;
    try {
        payload = (await response.json()) as ProgramsApiResponse;
    } catch (error) {
        logError("Failed to parse API response JSON", {
            url,
            status: response.status,
            error,
        });
        throw new Error("Courses API returned an invalid response.");
    }

    if (!response.ok || !payload?.ok) {
        logError("Request failed", {
            url,
            status: response.status,
            statusText: response.statusText,
            payloadError: payload?.error ?? null,
            durationMs: Date.now() - startedAt,
        });
        throw new Error(payload?.error || `Failed to fetch programs (HTTP ${response.status}).`);
    }

    logInfo("Request succeeded", {
        url,
        status: response.status,
        count: payload.data?.length ?? 0,
        hasFilters: Boolean(payload.filters),
        durationMs: Date.now() - startedAt,
    });

    return payload;
}

export async function searchPrograms(input: ProgramSearchInput = {}): Promise<ProgramCardItem[]> {
    const payload = await requestPrograms(input);
    return payload.data ?? [];
}

export async function fetchProgramFilters(): Promise<ProgramFilters> {
    const payload = await requestPrograms({ includeFilters: true });
    return (
        payload.filters ?? {
            degreeLevel: [],
            fieldOfStudy: [],
        }
    );
}
