'use client';

import Link from "next/link";
import Button from "./Button";
import { useState, useRef, useEffect } from "react";
import { IoMdTime } from "react-icons/io";
import { useTranslations } from "@/lib/useTranslations";

function clampSentences(text?: string, maxSentences = 2) {
    if (!text || typeof text !== 'string') return text ?? "";
    const parts = text.match(/[^.!?]+[.!?]*/g);
    if (!parts) return text;
    if (parts.length <= maxSentences) return text;
    return parts.slice(0, maxSentences).join(' ').trim() + '...';
}

function ProgramDescription({ text }: { text?: string }) {
    const [expanded, setExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);
    const ref = useRef<HTMLParagraphElement | null>(null);
    const [maxHeightPx, setMaxHeightPx] = useState<number | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Compute computed line-height
        const style = window.getComputedStyle(el);
        let lineHeight = parseFloat(style.lineHeight || "0");
        if (isNaN(lineHeight) || lineHeight === 0) {
            // fallback to 1.2 * font-size
            const fontSize = parseFloat(style.fontSize || "16");
            lineHeight = fontSize * 1.2;
        }

        const lines = 5;
        const maxH = Math.round(lineHeight * lines);
        setMaxHeightPx(maxH);

        // Determine if the content is taller than the clamp
        const truncated = el.scrollHeight > maxH + 1;
        setIsTruncated(truncated);
    }, [text]);

    if (!text) return <p />;

    const clampStyle: React.CSSProperties = expanded
        ? {}
        : {
              display: '-webkit-box',
              WebkitLineClamp: 5 as any,
              WebkitBoxOrient: 'vertical' as any,
              overflow: 'hidden',
              maxHeight: maxHeightPx ? `${maxHeightPx}px` : undefined,
          };

    return (
        <div>
            <p ref={ref} style={clampStyle} className="transition-max-height duration-150 ease pointer">
                {text}
            </p>
            {isTruncated && (
                <button
          onClick={() => setExpanded(!expanded)}
          className=" text-blue-600 font-medium hover:underline"
        >
          {expanded ? "See less" : "See more"}
        </button>
            )}
        </div>
    );
}

type ProgramCardItem = {
    img: string;
    title?: string;
    titleKey?: string;
    description?: string;
    descriptionKey?: string;
    time?: string;
    timeKey?: string;
    programType?: string;
    badgeName?: string;
    badgeKey?: string;
    href?: string;
};

function toProgramHref(featureItem: ProgramCardItem): string {
    const title = featureItem.title ?? "program";
    if (featureItem.href && featureItem.href.trim().length > 0) {
        return featureItem.href;
    }

    const slug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `/program/${encodeURIComponent(slug || "program")}`;
}

const defaultProgramCardContent: ProgramCardItem[] = [
    {
        img: "/news-card-img.png",
        titleKey: "featuredPrograms.fallbackPrograms.businessAdministration.title",
        descriptionKey: "featuredPrograms.fallbackPrograms.businessAdministration.description",
        timeKey: "featuredPrograms.fallbackPrograms.businessAdministration.duration",
        badgeKey: "programCard.badgeNew",
        href: "/program/business-administration"
    },
    {
        img: "/news-card-img.png",
        titleKey: "featuredPrograms.fallbackPrograms.computerScience.title",
        descriptionKey: "featuredPrograms.fallbackPrograms.computerScience.description",
        timeKey: "featuredPrograms.fallbackPrograms.computerScience.duration",
        badgeKey: "programCard.badgePopular",
        href: "/program/computer-science"
    },
    {
        img: "/news-card-img.png",
        titleKey: "featuredPrograms.fallbackPrograms.dataScience.title",
        descriptionKey: "featuredPrograms.fallbackPrograms.dataScience.description",
        timeKey: "featuredPrograms.fallbackPrograms.dataScience.duration",
        badgeKey: "programCard.badgeNew",
        href: "/program/data-science"
    },
    {
        img: "/news-card-img.png",
        titleKey: "featuredPrograms.fallbackPrograms.mba.title",
        descriptionKey: "featuredPrograms.fallbackPrograms.mba.description",
        timeKey: "featuredPrograms.fallbackPrograms.mba.duration",
        badgeKey: "programCard.badgePopular",
        href: "/program/master-of-business-administration"
    }
];

export default function ProgramCard({
    programCardContent,
    defaultBadgeLabel,
    viewProgramLabel,
}: {
    programCardContent?: ProgramCardItem[];
    defaultBadgeLabel?: string;
    viewProgramLabel?: string;
}) {
    const { t } = useTranslations();
    const cards = (programCardContent ?? defaultProgramCardContent).map((item) => ({
        ...item,
        title: item.title ?? (item.titleKey ? t(item.titleKey) : ""),
        description: item.description ?? (item.descriptionKey ? t(item.descriptionKey) : ""),
        time: item.time ?? (item.timeKey ? t(item.timeKey) : ""),
        badgeName:
            item.badgeName ??
            item.programType ??
            (item.badgeKey ? t(item.badgeKey) : undefined),
    }));
    const badgeLabel = defaultBadgeLabel ?? t("programCard.defaultBadgeLabel");
    const viewLabel = viewProgramLabel ?? t("programCard.viewProgramLabel");

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-5">
            {cards.map((featureItem, index) => (
                <div key={index} className="bg-white rounded-lg border border-[#33333340] p-4 flex flex-col">
                    <div className="relative w-full mb-3">
                        <img src={featureItem.img} alt={featureItem.title} className="w-full h-[140px] rounded object-cover" />
                        <span className="absolute bottom-2 border border-[#33333340] left-2 bg-white text-sm font-medium px-2 py-1 rounded">
                            {featureItem.badgeName || badgeLabel}
                        </span>
                    </div>
                    <div className="flex flex-col justify-between flex-1">
                        <div className="flex-1">
                                <div className="font-semibold text-xl mb-2">{featureItem.title}</div>
                                <ProgramDescription text={featureItem.description} />
                        </div>
                        <div className="flex items-center justify-between mt-4 gap-2">
                            <span className="text-[13px] text-[#33333380] flex items-center gap-2"><IoMdTime size={22} /> {featureItem.time}</span>
                            <Link href={toProgramHref(featureItem)} className="">
                                <Button variant="outline">{viewLabel}</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
