import { IoMdTime } from "react-icons/io";
import Button from "../Button";


function NewsCard() {

    const NewsCardContent = [
        { img: "/news-card-img.png", title: "Business Administration", description: "Develop strategic thinking and leadership skills for the modern business world.", time: "March 15, 2026", newsbadge: "Accreditation" },
        { img: "/news-card-img.png", title: "Computer Science", description: "Master algorithms, software engineering, and cutting-edge technology.", time: "April 10, 2026", newsbadge: "Admissions" },
        { img: "/news-card-img.png", title: "Data Science", description: "Analyze and interpret complex data to drive informed decision-making.", time: "May 20, 2026", newsbadge: "Accreditation" },
        { img: "/news-card-img.png", title: "Master of Business Administration", description: "Advance your career with executive-level business acumen and leadership training.", time: "June 5, 2026", newsbadge: "Campus" }
    ];


    return (
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-5 gap-10">
            {NewsCardContent.map((NewsItem, index) =>
                <div key={index} className="">
                    <div className="relative">
                        <img src={NewsItem.img} alt={NewsItem.title} className="w-full h-[200px] object-cover mb-4 rounded-[10px] " />
                        <span className="absolute bottom-2 left-2 bg-[#1E73BE] text-white text-sm font-medium px-2 py-1 rounded">{NewsItem.newsbadge}</span>
                    </div>
                    <div className="">
                        <div className="font-semibold text-xl mb-2 leading-tight">{NewsItem.title}</div>
                        <p className="leading-tight">{NewsItem.description}</p>
                        <div className="flex items-center justify-between mt-5">
                            <span className="text-sm text-[#33333380] flex items-center gap-2"><IoMdTime size={22} /> {NewsItem.time}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function NewsAnnouncements() {
    return (
        <>
            <section className="md:py-25 py-15">
                <div className="container">
                    <div className="mb-8 flex flex-wrap gap-5 items-center justify-between">
                        <h2 className="font-semibold md:text-[50px] text-4xl leading-tight">News & Announcements</h2>
                        <Button className="" variant="outline" icon={true}>Read More News</Button>
                    </div>
                    <NewsCard />
                </div>
            </section>
        </>
    );
}