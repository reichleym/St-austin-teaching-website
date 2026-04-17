'use client';

import { useTranslations } from "@/lib/useTranslations";

const cardItems = [
    {
        icon: "/assignments.svg",
        titleKey: "learningExperience.card1Title",
        descriptionKey: "learningExperience.card1Desc"
    },
    {
        icon: "/group-discussion-meeting.svg",
        titleKey: "learningExperience.card2Title",
        descriptionKey: "learningExperience.card2Desc"
    },
    {
        icon: "/live-tv.svg",
        titleKey: "learningExperience.card3Title",
        descriptionKey: "learningExperience.card3Desc"
    }
];

export default function LearningExp() {
    const { t } = useTranslations();

    return (
        <div className="bg-[#1E73BE] md:flex flex-wrap">
            <div className="flex-1 md:order-2">
                <img src="/learning-exp-img.jpg" className="h-full object-cover" alt="" />
            </div>
            <div className="container md:py-25 py-15 flex-1">
                <div className="max-w-xl mx-auto">
                    <div className="text-white mb-10">
                        <h2 className="md:text-[50px] text-4xl font-bold mb-2.5 leading-tight">{t("learningExperience.title")}</h2>
                        <p className="leading-tight">{t("learningExperience.desc")}</p>
                    </div>
                    <div className="space-y-5">
                        {cardItems.map((item, index) => (
                            <div className="bg-white p-5 rounded-[10px]" key={index}>
                                <div className="flex items-center">
                                    <div className="text-4xl mr-5">
                                        <img src={item.icon} alt={t(item.titleKey)} />
                                    </div>
                                    <div className="">
                                        <div className="font-semibold text-xl mb-2 leading-tight">{t(item.titleKey)}</div>
                                        <p className="leading-tight">{t(item.descriptionKey)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}