import Link from "next/dist/client/link";
import Button from "../Button";
import Tabs from "../Tabs";
import { IoMdTime } from "react-icons/io";

function ProgramCard() {

    const programCardContent = [
        { img: "/news-card-img.png", title: "Business Administration", description: "Develop strategic thinking and leadership skills for the modern business world.", time: "3 years" },
        { img: "/news-card-img.png", title: "Computer Science", description: "Master algorithms, software engineering, and cutting-edge technology.", time: "4 years" },
        { img: "/news-card-img.png", title: "Data Science", description: "Analyze and interpret complex data to drive informed decision-making.", time: "2 years" },
        { img: "/news-card-img.png", title: "Master of Business Administration", description: "Advance your career with executive-level business acumen and leadership training.", time: "2 years" }
    ];


    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {programCardContent.map((featureItem, index) =>
                <div key={index} className="bg-white rounded-[10px] border border-[#33333340] p-4 flex items-center flex-col">
                    <img src={featureItem.img} alt={featureItem.title} className="w-full h-[140px] rounded-[6px] object-cover mb-3" />
                    <div className="flex flex-col justify-between flex-1">
                        <div className="flex-1">
                            <h3 className="font-semibold text-md mb-2">{featureItem.title}</h3>
                            <p className="text-[15px]">{featureItem.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[13px] text-[#33333380] flex items-center gap-2"><IoMdTime size={22} /> {featureItem.time}</span>
                            <Link href="/programs" className="">
                                <Button variant="outline">View Program</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function FeaturedPrograms() {
    return (
        <>
            <section className="py-25">
                <div className="container">
                    <div className="mb-10">
                        <h2 className="font-semibold text-4xl mb-2.5">Featured Programs</h2>
                        <p className="">Explore our most popular programs designed for career success</p>
                    </div>
                    <div className="">
                        <Tabs
                            tabs={[
                                { label: 'Bachelor’s Degree', content: <ProgramCard /> },
                                { label: 'Master’s Degree', content: <ProgramCard /> }
                            ]}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}