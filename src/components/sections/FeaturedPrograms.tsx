import Tabs from "../Tabs";
import ProgramCard from "../ProgramCard";
import Button from "../Button";
import Link from "next/link";
import { getCourseFilters, getCourses, type CourseCardItem } from "@/lib/course-catalog";
import { isDatabaseConfigured } from "@/lib/postgres";

const FEATURED_PROGRAM_LIMIT = 8;

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

type FeaturedProgramsTab = {
    label: string;
    courses: CourseCardItem[];
};

export default async function FeaturedPrograms() {
    let tabsData: FeaturedProgramsTab[] = [
        {
            label: "All",
            courses: fallbackPrograms.slice(0, FEATURED_PROGRAM_LIMIT),
        },
    ];

    if (isDatabaseConfigured) {
        try {
            const filters = await getCourseFilters();
            const degreeLevels = filters.degreeLevel;
            const labels = ["All", ...degreeLevels];
            tabsData = await Promise.all(
                labels.map(async (label) => {
                    const courses = await getCourses({
                        degreeLevel: label === "All" ? undefined : label,
                    });
                    return {
                        label,
                        courses: courses.slice(0, FEATURED_PROGRAM_LIMIT),
                    };
                })
            );
        } catch (error) {
            console.error("Failed to load featured programs from the database:", error);
        }
    }

    return (
        <>
            <section className="md:py-25 py-15">
                <div className="container">
                    <div className="mb-8">
                        <h2 className="font-semibold md:text-[50px] text-4xl mb-2.5">Featured Programs</h2>
                        <p className="">Explore our most popular programs designed for career success</p>
                    </div>
                    <div className="">
                        <Tabs
                            tabs={tabsData.map((tab) => ({
                                label: tab.label,
                                content:
                                    tab.courses.length > 0 ? (
                                        <>
                                            <ProgramCard programCardContent={tab.courses} />
                                            {tab.label === "All" ? (
                                                <div className="mt-8 flex justify-center">
                                                    <Link href="/program">
                                                        <Button variant="outline">View More</Button>
                                                    </Link>
                                                </div>
                                            ) : null}
                                        </>
                                    ) : (
                                        <p className="text-center text-lg">No courses found for this degree level.</p>
                                    ),
                            }))}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
