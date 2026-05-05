import ProgramDetailClient from "@/components/ProgramDetailClient";
import { notFound } from "next/navigation";
import { getCourseById, type CourseCardItem } from "@/lib/course-catalog";
import { getServerLanguage } from "@/lib/i18n/server";
import { isDatabaseConfigured } from "@/lib/postgres";

type ProgramDetailPageProps = {
    params: Promise<{
        ID: string;
    }>;
};

type ProgramContentPayload = {
    overview?: unknown;
    tuitionAndFees?: unknown;
    curriculum?: unknown;
    admissionRequirements?: unknown;
    careerOpportunities?: unknown;
};

const EMPTY_CONTENT_MESSAGE = "content is not updated yet";

function getNonEmptyString(value: unknown): string | null {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    if (typeof value === "number") {
        return String(value);
    }

    return null;
}

function getStringList(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => getNonEmptyString(item))
        .filter((item): item is string => item !== null);
}

function parseProgramContent(raw: string | undefined): ProgramContentPayload | null {
    if (!raw || raw.trim().length === 0) {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            const record = parsed as Record<string, unknown>;

            if (
                typeof record.overview !== "undefined" ||
                typeof record.tuitionAndFees !== "undefined" ||
                typeof record.curriculum !== "undefined" ||
                typeof record.admissionRequirements !== "undefined" ||
                typeof record.careerOpportunities !== "undefined"
            ) {
                return record as ProgramContentPayload;
            }

            const en = record.en;
            if (en && typeof en === "object" && !Array.isArray(en)) {
                return en as ProgramContentPayload;
            }
        }
    } catch {
        return null;
    }

    return null;
}

const fallbackProgramsBySlug: Record<string, CourseCardItem> = {
    "business-administration": {
        id: "business-administration",
        title: "Business Administration",
        description: "Develop strategic thinking and leadership skills for the modern business world.",
        time: "3 years",
        img: "/news-card-img.png",
        href: "/program/business-administration",
    },
    "computer-science": {
        id: "computer-science",
        title: "Computer Science",
        description: "Master algorithms, software engineering, and cutting-edge technology.",
        time: "4 years",
        img: "/news-card-img.png",
        href: "/program/computer-science",
    },
    "data-science": {
        id: "data-science",
        title: "Data Science",
        description: "Analyze and interpret complex data to drive informed decision-making.",
        time: "2 years",
        img: "/news-card-img.png",
        href: "/program/data-science",
    },
    "master-of-business-administration": {
        id: "master-of-business-administration",
        title: "Master of Business Administration",
        description: "Advance your career with executive-level business acumen and leadership training.",
        time: "2 years",
        img: "/news-card-img.png",
        href: "/program/master-of-business-administration",
    },
    "fallback-1": {
        id: "fallback-1",
        title: "Business Administration",
        description: "Develop strategic thinking and leadership skills for the modern business world.",
        time: "3 years",
        img: "/news-card-img.png",
        href: "/program/business-administration",
    },
    "fallback-2": {
        id: "fallback-2",
        title: "Computer Science",
        description: "Master algorithms, software engineering, and cutting-edge technology.",
        time: "4 years",
        img: "/news-card-img.png",
        href: "/program/computer-science",
    },
    "fallback-3": {
        id: "fallback-3",
        title: "Data Science",
        description: "Analyze and interpret complex data to drive informed decision-making.",
        time: "2 years",
        img: "/news-card-img.png",
        href: "/program/data-science",
    },
    "fallback-4": {
        id: "fallback-4",
        title: "Master of Business Administration",
        description: "Advance your career with executive-level business acumen and leadership training.",
        time: "2 years",
        img: "/news-card-img.png",
        href: "/program/master-of-business-administration",
    },
};

function normalizeProgramId(raw: string): string {
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

function getFallbackProgram(programId: string): CourseCardItem | null {
    const key = programId.trim().toLowerCase();
    return fallbackProgramsBySlug[key] ?? null;
}

async function getProgramForDetail(programId: string): Promise<CourseCardItem | null> {
    if (isDatabaseConfigured) {
        try {
            const lang = await getServerLanguage();
            const fromDb = await getCourseById(programId, lang);
            if (fromDb) {
                return fromDb;
            }
        } catch (error) {
            console.error("Failed to load program by id:", { programId, error });
        }
    }

    return getFallbackProgram(programId);
}

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
    const { ID } = await params;
    const programId = normalizeProgramId(ID);
    const program = await getProgramForDetail(programId);

    if (!program) {
        notFound();
    }

    const bannerBadge = [program.programType ?? "TBD", program.time || "TBD"];
    
    // Parse content for fallback values only (will be overridden by language-specific content in client)
    const structuredContent = parseProgramContent(program.programContent);
    const programOverviewContent = getNonEmptyString(structuredContent?.overview) ?? EMPTY_CONTENT_MESSAGE;
    const tuitionAndFees = getNonEmptyString(structuredContent?.tuitionAndFees) ?? EMPTY_CONTENT_MESSAGE;
    const curriculum = getStringList(structuredContent?.curriculum);
    const admissionRequirements = getStringList(structuredContent?.admissionRequirements);
    const careerOpportunities = getStringList(structuredContent?.careerOpportunities);

    return (
        <ProgramDetailClient
            program={program}
            bannerBadge={bannerBadge}
            programContentJson={program.programContent}
            programOverviewContent={programOverviewContent}
            tuitionAndFees={tuitionAndFees}
            curriculum={curriculum}
            admissionRequirements={admissionRequirements}
            careerOpportunities={careerOpportunities}
        />
    );
}
