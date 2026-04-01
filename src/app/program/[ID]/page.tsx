import CtaSection from "@/components/CtaSection";
import BannerSection from "@/components/sections/BannerSection";
import Button from "@/components/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { getCourseById, type CourseCardItem } from "@/lib/course-catalog";
import { isDatabaseConfigured } from "@/lib/postgres";

type ProgramDetailPageProps = {
    params: Promise<{
        ID: string;
    }>;
};

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
            const fromDb = await getCourseById(programId);
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

    const bannerContent = {
        title: program.title,
        description: program.description,
        bgImg: "/bannerImg.jpg",
    };
    const bannerBadge = ["Online", program.time];
    const checkListContent = [
        "High school diploma or equivalent",
        "Minimum GPA of 2.5",
        "English proficiency test",
        "Personal statement",
    ];
    const curriculum = [
        "Introduction to Business",
        "Marketing Principles",
        "Strategic Management",
        "Capstone Project",
        "Financial Accounting",
        "Organizational Behavior",
        "Business Ethics",
    ];
    const careers = [
        "Business Manager",
        "Marketing Director",
        "Financial Analyst",
        "Entrepreneur",
        "Operations Manager",
    ];

    return (
        <>
            <BannerSection {...bannerContent}>
                <div className="flex gap-2.5 -order-1 mb-2.5">
                    {bannerBadge.map((badge, index) => (
                        <span
                            className="bg-[#fff] border border-[#1E73BE] text-[#1E73BE] text-sm font-semibold px-2 py-1 rounded"
                            key={index}
                        >
                            {badge}
                        </span>
                    ))}
                </div>
                <div className="flex gap-5 mt-11">
                    <Button variant="primary">Apply Now</Button>
                    <Button variant="outline">Request Info</Button>
                </div>
            </BannerSection>
            <section className="md:py-25 py-15">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-5 lg:gap-25 md:gap-12 gap-8">
                        <div className="md:col-span-3 space-y-12">
                            <div>
                                <h2 className="md:text-4xl text-3xl font-bold mb-5">Program Overview</h2>
                                <p>{program.description}</p>
                            </div>
                            <div>
                                <h2 className="md:text-4xl text-3xl font-bold mb-5">Curriculum</h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {curriculum.map((item, index) => (
                                        <li className="flex gap-4 items-center" key={item}>
                                            <span className="bg-[#1E73BE] font-semibold text-white w-11 h-11 rounded-full flex items-center justify-center">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h2 className="md:text-4xl text-3xl font-bold mb-5">Career Opportunities</h2>
                                <p className="mb-5">{program.description}</p>
                                <div className="flex flex-wrap gap-5">
                                    {careers.map((tag) => (
                                        <span
                                            className="bg-[#1E73BE1A] p-3 border border-[#1E73BE] font-semibold flex items-center gap-2.5"
                                            key={tag}
                                        >
                                            <IoIosCheckmarkCircleOutline size={24} className="text-[#1E73BE]" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-10">
                            <div className="bg-[#F2F5FA] p-7 rounded-lg space-y-5">
                                <h4 className="font-semibold text-[22px] leading-tight">Tuition & Fees</h4>
                                <div className="leading-tight">
                                    <span className="md:text-[50px] text-4xl font-bold">$12,500</span> <span>/ year</span>
                                </div>
                                <Link href="/tuition" className="hover:underline">
                                    View financial aid options →
                                </Link>
                            </div>
                            <div className="bg-[#F2F5FA] p-7 rounded-lg">
                                <h4 className="font-semibold text-[22px] mb-4">Admission Requirements</h4>
                                <ul className="space-y-3">
                                    {checkListContent.map((item) => (
                                        <li className="flex gap-2.5 items-center" key={item}>
                                            <IoIosCheckmarkCircleOutline size={24} className="text-[#1E73BE]" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-[#1E73BE] p-7 rounded-lg text-white text-center">
                                <h3 className="font-semibold text-[28px] leading-tight mb-5">Start Your Application</h3>
                                <p>The next cohort begins Fall 2026</p>
                                <Button variant="white" className="mt-10 w-full">
                                    Apply Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <CtaSection />
        </>
    );
}
