import CtaSection from "@/components/CtaSection";
import ExplorePrograms from "@/components/sections/ExplorePrograms";
import ProgramCard from "@/components/ProgramCard";
import BannerSection from "@/components/sections/BannerSection";
import { getCourseFilters, getCourses, type CourseCardItem } from "@/lib/course-catalog";
import { getServerLanguage } from "@/lib/i18n/server";
import { isDatabaseConfigured } from "@/lib/postgres";

type ProgramPageSearchParams = Promise<{
    degreeLevel?: string | string[];
    fieldOfStudy?: string | string[];
}>;

function getSingleParam(value: string | string[] | undefined): string {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }
    return value ?? "";
}

const fallbackPrograms: CourseCardItem[] = [
    {
        id: "fallback-1",
        img: "/news-card-img.png",
        title: "Business Administration",
        description: "Develop strategic thinking and leadership skills for the modern business world.",
        time: "3 years",
        href: "/program/business-administration",
    },
    {
        id: "fallback-2",
        img: "/news-card-img.png",
        title: "Computer Science",
        description: "Master algorithms, software engineering, and cutting-edge technology.",
        time: "4 years",
        href: "/program/computer-science",
    },
    {
        id: "fallback-3",
        img: "/news-card-img.png",
        title: "Data Science",
        description: "Analyze and interpret complex data to drive informed decision-making.",
        time: "2 years",
        href: "/program/data-science",
    },
    {
        id: "fallback-4",
        img: "/news-card-img.png",
        title: "Master of Business Administration",
        description: "Advance your career with executive-level business acumen and leadership training.",
        time: "2 years",
        href: "/program/master-of-business-administration",
    },
];

export default async function ProgramPage({
    searchParams,
}: {
    searchParams: ProgramPageSearchParams;
}) {
    const lang = await getServerLanguage();
    const params = await searchParams;
    const selectedDegreeLevel = getSingleParam(params.degreeLevel);
    const selectedFieldOfStudy = getSingleParam(params.fieldOfStudy);
    const bannerContent = {
        title: "Our Programs",
        description: "Discover career-focused programs designed for the modern professional.",
        bgImg: "/bannerImg.jpg",
    };

    let programs = fallbackPrograms;
    let degreeLevelOptions: string[] = [];
    let fieldOfStudyOptions: string[] = [];

    if (isDatabaseConfigured) {
        try {
            const [filters, dbPrograms] = await Promise.all([
                getCourseFilters(),
                getCourses({
                    degreeLevel: selectedDegreeLevel || undefined,
                    fieldOfStudy: selectedFieldOfStudy || undefined,
                    language: lang,
                }),
            ]);
            degreeLevelOptions = filters.degreeLevel;
            fieldOfStudyOptions = filters.fieldOfStudy;
            programs = dbPrograms;
        } catch (error) {
            console.error("Failed to load courses from the database:", error);
        }
    }

    return (
        <>
            <BannerSection {...bannerContent} />
            <ExplorePrograms
                className="py-0"
                degreeLevelOptions={degreeLevelOptions}
                fieldOfStudyOptions={fieldOfStudyOptions}
                selectedDegreeLevel={selectedDegreeLevel}
                selectedFieldOfStudy={selectedFieldOfStudy}
                action="/program"
            />
            <section className="py-25">
                <div className="container">
                    <div className="">
                        {programs.length > 0 ? (
                            <ProgramCard programCardContent={programs} />
                        ) : (
                            <p className="text-center text-lg">No courses found for the selected filters.</p>
                        )}
                    </div>
                </div>
            </section>
            <CtaSection />
        </>
    );
}
