'use client';

import { IoMdTime } from "react-icons/io";
import Button from "../Button";
import { useTranslations } from "@/lib/useTranslations";

const newsCardContent = [
    {
        img: "/news-card-img.png",
        titleKey: "newsAnnouncements.card1Title",
        descriptionKey: "newsAnnouncements.card1Desc",
        timeKey: "newsAnnouncements.card1Time",
        badgeKey: "newsAnnouncements.card1Badge"
    },
    {
        img: "/news-card-img.png",
        titleKey: "newsAnnouncements.card2Title",
        descriptionKey: "newsAnnouncements.card2Desc",
        timeKey: "newsAnnouncements.card2Time",
        badgeKey: "newsAnnouncements.card2Badge"
    },
    {
        img: "/news-card-img.png",
        titleKey: "newsAnnouncements.card3Title",
        descriptionKey: "newsAnnouncements.card3Desc",
        timeKey: "newsAnnouncements.card3Time",
        badgeKey: "newsAnnouncements.card3Badge"
    },
    {
        img: "/news-card-img.png",
        titleKey: "newsAnnouncements.card4Title",
        descriptionKey: "newsAnnouncements.card4Desc",
        timeKey: "newsAnnouncements.card4Time",
        badgeKey: "newsAnnouncements.card4Badge"
    }
];

function NewsCard() {
    const { t } = useTranslations();

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-5 gap-10">
            {newsCardContent.map((NewsItem, index) => (
                <div key={index} className="">
                    <div className="relative">
                        <img src={NewsItem.img} alt={t(NewsItem.titleKey)} className="w-full h-[200px] object-cover mb-4 rounded-[10px] " />
                        <span className="absolute bottom-2 left-2 bg-[#1E73BE] text-white text-sm font-medium px-2 py-1 rounded">{t(NewsItem.badgeKey)}</span>
                    </div>
                    <div className="">
                        <div className="font-semibold text-xl mb-2 leading-tight">{t(NewsItem.titleKey)}</div>
                        <p className="leading-tight">{t(NewsItem.descriptionKey)}</p>
                        <div className="flex items-center justify-between mt-5">
                            <span className="text-sm text-[#33333380] flex items-center gap-2"><IoMdTime size={22} /> {t(NewsItem.timeKey)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function NewsAnnouncements() {
    const { t } = useTranslations();

    return (
        <section className="md:py-25 py-15">
            <div className="container">
                <div className="mb-8 flex flex-wrap gap-5 items-center justify-between">
                    <h2 className="font-semibold md:text-[50px] text-4xl leading-tight">{t("newsAnnouncements.title")}</h2>
                    <Button className="" variant="outline" icon={true}>{t("newsAnnouncements.readMore")}</Button>
                </div>
                <NewsCard />
            </div>
        </section>
    );
}