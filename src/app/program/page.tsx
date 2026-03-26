
import CtaSection from "@/components/CtaSection";
import ExplorePrograms from "@/components/sections/ExplorePrograms";
import ProgramCard from "@/components/ProgramCard";
import BannerSection from "@/components/sections/BannerSection";
import Button from "@/components/Button";
export default function ProgramPage() {
    const programCardContent = [
        { img: "/news-card-img.png", title: "Business Administration", description: "Develop strategic thinking and leadership skills for the modern business world.", time: "3 years" },
        { img: "/news-card-img.png", title: "Computer Science", description: "Master algorithms, software engineering, and cutting-edge technology.", time: "4 years" },
        { img: "/news-card-img.png", title: "Data Science", description: "Analyze and interpret complex data to drive informed decision-making.", time: "2 years" },
        { img: "/news-card-img.png", title: "Master of Business Administration", description: "Advance your career with executive-level business acumen and leadership training.", time: "2 years" }
    ];
    const bannerContent = {
        title: "Our Programs",
        description: "Discover career-focused programs designed for the modern professional.",
        bgImg: "/bannerImg.jpg"
    }
    return (

        <>
            <BannerSection {...bannerContent} />
            <ExplorePrograms className="py-0" />
            <section className="py-25">
                <div className="container">
                    <div className="">
                        <ProgramCard programCardContent={programCardContent} />
                    </div>
                </div>
            </section>
            <CtaSection />
        </>
    );
}