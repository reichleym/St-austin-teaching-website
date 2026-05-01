'use client';

import Link from "next/link";
import Button from "../Button";
import { useTranslations } from "@/lib/useTranslations";
import { useRef } from "react";

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

type CardItem = { icon: string; title: string; description: string };

export default function WhyAustin({
    whiteCards,
    secTitle,
    whyAustinDesc,
    button,
    cardsVariant = "default",
    enableCarousel = false,
}: {
    whiteCards?: CardItem[];
    secTitle?: string;
    whyAustinDesc?: React.ReactNode | string | null;
    button?: React.ReactNode;
    cardsVariant?: "default" | "team";
    enableCarousel?: boolean;
}) {
    const { t } = useTranslations();
    const title = secTitle ?? t("whyAustin.title");
    const description = whyAustinDesc === undefined ? t("whyAustin.desc") : whyAustinDesc;
    const cards = whiteCards ?? defaultCardItems.map((item) => ({
        icon: item.icon,
        title: t(item.titleKey),
        description: t(item.descriptionKey),
    }));

    const carouselRef = useRef<HTMLDivElement | null>(null);
    const scrollCarousel = (direction: -1 | 1) => {
        const el = carouselRef.current;
        if (!el) return;
        const firstItem = el.querySelector<HTMLElement>("[data-carousel-item='true']");
        const scrollAmount = firstItem ? firstItem.offsetWidth + 16 : Math.round(el.clientWidth * 0.9);
        el.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
    };

    const renderCard = (item: CardItem, index: number) => {
        if (cardsVariant === "team") {
            return (
                <div className="bg-white rounded-[10px] overflow-hidden" key={index}>
                    <div className="p-6 flex flex-col items-center md:items-start text-center md:text-left">
                        <img src={item.icon} alt={item.title} width={70} className="mb-4" />
                        <div className="text-xl font-semibold leading-tight mb-2.5">{item.title}</div>
                        <p>{item.description}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white p-5 rounded-[10px]" key={index}>
                <div className="flex items-center mb-2.5">
                    <div className="text-4xl mr-2.5">
                        <img src={item.icon} alt={item.title} width={60} />
                    </div>
                    <div className="text-xl font-semibold">{item.title}</div>
                </div>
                <p>{item.description}</p>
            </div>
        );
    };

    return (
        <div className="bg-[#1E73BE] md:py-25 py-15">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 items-center">
                    <div className="text-white lg:col-span-3">
                        <h2 className="text-4xl md:text-[50px] font-bold mb-2.5 leading-tight">{title}</h2>
                        {description ? <p className="mb-7">{description}</p> : null}
                        {button ? button : <Link href='/about' className="inline-block"><Button variant="white">{t("whyAustin.learnMore")}</Button></Link>}
                    </div>
                    <div className="lg:col-span-5">
                        {enableCarousel ? (
                            <>
                                <div className="flex items-center justify-end gap-2 mb-4 md:hidden">
                                    <button
                                        type="button"
                                        onClick={() => scrollCarousel(-1)}
                                        className="h-10 w-10 rounded-full bg-white/15 text-white hover:bg-white/25"
                                        aria-label="Scroll cards left"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => scrollCarousel(1)}
                                        className="h-10 w-10 rounded-full bg-white/15 text-white hover:bg-white/25"
                                        aria-label="Scroll cards right"
                                    >
                                        ›
                                    </button>
                                </div>

                                <div
                                    ref={carouselRef}
                                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:hidden hide-scrollbar"
                                    aria-label="Cards carousel"
                                >
                                    {cards.map((item, index) => (
                                        <div
                                            key={index}
                                            data-carousel-item="true"
                                            className="snap-start shrink-0 w-[85%] max-w-[420px]"
                                        >
                                            {renderCard(item, index)}
                                        </div>
                                    ))}
                                </div>

                                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {cards.map((item, index) => renderCard(item, index))}
                                </div>
                            </>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {cards.map((item, index) => renderCard(item, index))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
