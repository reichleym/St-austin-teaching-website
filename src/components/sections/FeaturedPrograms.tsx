'use client';

import { useEffect, useState } from "react";
import Tabs from "../Tabs";
import ProgramCard from "../ProgramCard";
import Button from "../Button";
import Link from "next/link";
import { useTranslations } from "@/lib/useTranslations";
import { fetchProgramFilters, searchPrograms, type ProgramCardItem } from "@/services/programs";

const FEATURED_PROGRAM_LIMIT = 8;
const ALL_TAB_ID = "__all__";

type FeaturedProgramsTab = {
    id: string;
    courses: ProgramCardItem[];
};

export default function FeaturedPrograms() {
    const { t } = useTranslations();
    const [tabsData, setTabsData] = useState<FeaturedProgramsTab[]>([]);

    useEffect(() => {
        let active = true;

        async function loadTabs() {
            try {
                const filters = await fetchProgramFilters();
                const degreeLevels = filters.degreeLevel;
                const tabIds = [ALL_TAB_ID, ...degreeLevels];

                const nextTabs = await Promise.all(
                    tabIds.map(async (tabId) => {
                        const courses = await searchPrograms({
                            degreeLevel: tabId === ALL_TAB_ID ? undefined : tabId,
                        });

                        return {
                            id: tabId,
                            courses: courses.slice(0, FEATURED_PROGRAM_LIMIT),
                        };
                    })
                );

                if (active) {
                    setTabsData(nextTabs);
                }
            } catch (error) {
                console.error("Failed to load featured programs:", error);
                if (active) {
                    setTabsData([]);
                }
            }
        }

        loadTabs();

        return () => {
            active = false;
        };
    }, []);

    const fallbackPrograms: ProgramCardItem[] = [
        {
            id: "fallback-1",
            img: "/news-card-img.png",
            title: t("featuredPrograms.fallbackPrograms.businessAdministration.title"),
            description: t("featuredPrograms.fallbackPrograms.businessAdministration.description"),
            time: t("featuredPrograms.fallbackPrograms.businessAdministration.duration"),
            href: "/program/business-administration",
        },
        {
            id: "fallback-2",
            img: "/news-card-img.png",
            title: t("featuredPrograms.fallbackPrograms.computerScience.title"),
            description: t("featuredPrograms.fallbackPrograms.computerScience.description"),
            time: t("featuredPrograms.fallbackPrograms.computerScience.duration"),
            href: "/program/computer-science",
        },
        {
            id: "fallback-3",
            img: "/news-card-img.png",
            title: t("featuredPrograms.fallbackPrograms.dataScience.title"),
            description: t("featuredPrograms.fallbackPrograms.dataScience.description"),
            time: t("featuredPrograms.fallbackPrograms.dataScience.duration"),
            href: "/program/data-science",
        },
        {
            id: "fallback-4",
            img: "/news-card-img.png",
            title: t("featuredPrograms.fallbackPrograms.mba.title"),
            description: t("featuredPrograms.fallbackPrograms.mba.description"),
            time: t("featuredPrograms.fallbackPrograms.mba.duration"),
            href: "/program/master-of-business-administration",
        },
    ];

    const resolvedTabs: FeaturedProgramsTab[] =
        tabsData.length > 0
            ? tabsData
            : [
                  {
                      id: ALL_TAB_ID,
                      courses: fallbackPrograms.slice(0, FEATURED_PROGRAM_LIMIT),
                  },
              ];

    return (
        <section className="md:py-25 py-15">
            <div className="container">
                <div className="mb-8">
                    <h2 className="font-semibold md:text-[50px] text-4xl mb-2.5">{t("featuredPrograms.title")}</h2>
                    <p>{t("featuredPrograms.desc")}</p>
                </div>
                <Tabs
                    tabs={resolvedTabs.map((tab) => {
                        const isAllTab = tab.id === ALL_TAB_ID;

                        return {
                            label: isAllTab ? t("featuredPrograms.allTab") : tab.id,
                            content:
                                tab.courses.length > 0 ? (
                                    <>
                                        <ProgramCard
                                            programCardContent={tab.courses}
                                            defaultBadgeLabel={t("featuredPrograms.defaultBadge")}
                                            viewProgramLabel={t("featuredPrograms.viewProgram")}
                                        />
                                        {isAllTab ? (
                                            <div className="mt-8 flex justify-center">
                                                <Link href="/program">
                                                    <Button variant="outline">{t("featuredPrograms.viewMore")}</Button>
                                                </Link>
                                            </div>
                                        ) : null}
                                    </>
                                ) : (
                                    <p className="text-center text-lg">{t("featuredPrograms.noCourses")}</p>
                                ),
                        };
                    })}
                />
            </div>
        </section>
    );
}
