'use client';

import { useTranslations } from "@/lib/useTranslations";

const valueCards = [
    {
        value: "15,000+",
        titleKey: "learnSomething.cardGraduates"
    },
    {
        value: "92%",
        titleKey: "learnSomething.cardPlacementRate"
    },
    {
        value: "50+",
        titleKey: "learnSomething.cardPrograms"
    },
    {
        value: "4.8/5",
        titleKey: "learnSomething.cardSatisfaction"
    }
];

export default function LearnSomething() {
    const { t } = useTranslations();

    return (
        <div className="bg-[#F9F9F9] md:py-25 py-15">
            <div className="container">
                <div className="">
                    <div className="">
                        <h2 className="md:text-[50px] text-4xl font-bold mb-2.5 leading-tight">{t("learnSomething.title")}</h2>
                        <p className="mb-7">{t("learnSomething.desc")}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 mt-10 md:gap-6 gap-4">
                        {valueCards.map((card, index) => (
                            <div className="text-center px-2 py-8 bg-white rounded-[10px] border-b-6 border-[#1E73BE]" key={index}>
                                <div className="lg:text-6xl text-4xl text-[#1E73BE] font-semibold mb-4 italic">{card.value}</div>
                                <p className="text-xl font-medium">{t(card.titleKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}   