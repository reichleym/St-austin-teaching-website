
import Link from "next/link";
import Button from "./Button";
import { IoMdTime } from "react-icons/io";

type ProgramCardItem = {
    img: string;
    title: string;
    description: string;
    time: string;
    badgeName?: string;
    href?: string;
};

function toProgramHref(featureItem: ProgramCardItem): string {
    if (featureItem.href && featureItem.href.trim().length > 0) {
        return featureItem.href;
    }

    const slug = featureItem.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `/program/${encodeURIComponent(slug || "program")}`;
}

const defaultProgramCardContent: ProgramCardItem[] = [
    { img: "/news-card-img.png", title: "Business Administration", description: "Develop strategic thinking and leadership skills for the modern business world.", time: "3 years", badgeName: "New", href: "/program/business-administration" },
    { img: "/news-card-img.png", title: "Computer Science", description: "Master algorithms, software engineering, and cutting-edge technology.", time: "4 years", badgeName: "Popular", href: "/program/computer-science" },
    { img: "/news-card-img.png", title: "Data Science", description: "Analyze and interpret complex data to drive informed decision-making.", time: "2 years", badgeName: "New", href: "/program/data-science" },
    { img: "/news-card-img.png", title: "Master of Business Administration", description: "Advance your career with executive-level business acumen and leadership training.", time: "2 years", badgeName: "Popular", href: "/program/master-of-business-administration" },
];

export default function ProgramCard({ programCardContent }: { programCardContent?: ProgramCardItem[] }) {
    const cards = programCardContent ?? defaultProgramCardContent;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-5">
            {cards.map((featureItem, index) =>
                <div key={index} className="bg-white rounded-lg border border-[#33333340] p-4 flex items-center flex-col">
                    <div className="relative w-full mb-3">
                        <img src={featureItem.img} alt={featureItem.title} className="w-full h-[140px] rounded object-cover" />
                        <span className="absolute bottom-2 border border-[#33333340] left-2 bg-white text-sm font-medium px-2 py-1 rounded">
                            {featureItem.badgeName || "Program"}
                        </span>
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                        <div className="flex-1">
                            <div className="font-semibold text-xl mb-2">{featureItem.title}</div>
                            <p className="">{featureItem.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[13px] text-[#33333380] flex items-center gap-2"><IoMdTime size={22} /> {featureItem.time}</span>
                            <Link href={toProgramHref(featureItem)} className="">
                                <Button variant="outline">View Program</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
