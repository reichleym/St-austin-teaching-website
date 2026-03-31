import Tabs from "../Tabs";
import ProgramCard from "../ProgramCard";

export default function FeaturedPrograms() {
     const programCardContent = [
        { img: "/news-card-img.png", title: "Business Administration", description: "Develop strategic thinking and leadership skills for the modern business world.", time: "3 years", badgeName: "Online" },
        { img: "/news-card-img.png", title: "Computer Science", description: "Master algorithms, software engineering, and cutting-edge technology.", time: "4 years", badgeName: "On-campus" },
        { img: "/news-card-img.png", title: "Data Science", description: "Analyze and interpret complex data to drive informed decision-making.", time: "2 years", badgeName: "Online" },
        { img: "/news-card-img.png", title: "Master of Business Administration", description: "Advance your career with executive-level business acumen and leadership training.", time: "2 years", badgeName: "On-campus" }
    ];
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
                            tabs={[
                                { label: 'Bachelor’s Degree', content: <ProgramCard programCardContent={programCardContent} /> },
                                { label: 'Master’s Degree', content: <ProgramCard programCardContent={programCardContent} /> }
                            ]}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
