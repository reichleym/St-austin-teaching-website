"use client";

import Link from "next/link";
import { FaAngleRight } from "react-icons/fa";
import { useTranslations } from "@/lib/useTranslations";

const StoriesContent = [
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profileKey: "featuredStories.profile1" },
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profileKey: "featuredStories.profile1" },
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profileKey: "featuredStories.profile1" },
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profileKey: "featuredStories.profile1" },
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profileKey: "featuredStories.profile1" },
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profileKey: "featuredStories.profile1" }
];

export default function FeaturedStories() {
    const { t } = useTranslations();

    return (
        <section className="md:py-25 py-15 bg-[#F9F9F9]">
            <div className="container">
                <div className="mb-12 flex flex-wrap gap-5 items-center justify-between">
                    <h2 className="font-semibold md:text-[50px] text-4xl leading-tight">{t('featuredStories.title')}</h2>
                    <Link href="#" className="text-[#1E73BE] hover:underline flex items-center gap-2">
                        {t('featuredStories.viewMore')} <FaAngleRight />
                    </Link>
                </div>
            </div>
            <div className="container-fluid max-w-[2000px]">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
                    {StoriesContent.map((card, index) => (
                        <div key={index} className="bg-white rounded-[10px] shadow-md relative overflow-hidden h-[340px]">
                            <div
                                className="absolute h-full w-full left-0 top-0"
                                style={{ background: "linear-gradient(180deg, rgba(115, 137, 158, 0) 50%, #73899E 100%)" }}
                            ></div>
                            <img src={card.img} alt={card.name} className="w-full h-full object-cover" />
                            <div className="p-5 absolute bottom-0 left-0 w-full text-white">
                                <h3 className="font-semibold text-md mb-1">{card.name}</h3>
                                <p className="text-sm">{t(card.profileKey)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
