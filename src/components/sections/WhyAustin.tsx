'use client';

import Link from "next/link";
import Button from "../Button";
import { useTranslations } from "@/lib/useTranslations";

const defaultCardItems = [
    {
        icon: "/wedding-certificate.svg",
        titleKey: "whyAustin.card1Title",
        descriptionKey: "whyAustin.card1Desc"
    },
    {
        icon: "/global-learning.svg",
        titleKey: "whyAustin.card2Title",
        descriptionKey: "whyAustin.card2Desc"
    },
    {
        icon: "/workspace-premium.svg",
        titleKey: "whyAustin.card3Title",
        descriptionKey: "whyAustin.card3Desc"
    },
    {
        icon: "/award-trophy.svg",
        titleKey: "whyAustin.card4Title",
        descriptionKey: "whyAustin.card4Desc"
    }
];

export default function WhyAustin({ whiteCards, secTitle, whyAustinDesc, button }: { whiteCards?: { icon: string; title: string; description: string; }[]; secTitle?: string; whyAustinDesc?: React.ReactNode | string | null; button?: React.ReactNode }) {
    const { t } = useTranslations();
    const title = secTitle ?? t("whyAustin.title");
    const description = whyAustinDesc === undefined ? t("whyAustin.desc") : whyAustinDesc;
    const cards = whiteCards ?? defaultCardItems.map((item) => ({
        icon: item.icon,
        title: t(item.titleKey),
        description: t(item.descriptionKey),
    }));

    return (
        <div className="bg-[#1E73BE] md:py-25 py-15">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 items-center">
                    <div className="text-white lg:col-span-3">
                        <h2 className="text-4xl md:text-[50px] font-bold mb-2.5 leading-tight">{title}</h2>
                        <p className="mb-7">{description}</p>
                        {button ? button : <Link href='/about' className="inline-block"><Button variant="white">{t("whyAustin.learnMore")}</Button></Link>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-5">
                        {cards.map((item, index) => (
                            <div className="bg-white p-5 rounded-[10px]" key={index}>
                                <div className="flex items-center mb-2.5">
                                    <div className="text-4xl mr-2.5">
                                        <img src={item.icon} alt={item.title} width={60} />
                                    </div>
                                    <div className="text-xl font-semibold">{item.title}</div>
                                </div>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}