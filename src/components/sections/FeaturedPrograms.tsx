'use client';

import { useEffect, useMemo, useState } from "react";
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

function FeaturedProgramsSkeleton() {
    const skeletonCards = Array.from({ length: 4 }, (_, index) => index);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-5 animate-pulse" aria-label="Loading">
            {skeletonCards.map((index) => (
                <div
                    key={index}
                    className="bg-white rounded-lg border border-[#33333340] p-4 flex flex-col"
                >
                    <div className="relative w-full mb-3">
                        <div className="w-full h-[140px] rounded bg-[#EDEDED]" />
                        <div className="absolute bottom-2 left-2 h-7 w-20 rounded bg-white border border-[#33333340]" />
                    </div>
                    <div className="flex flex-col justify-between flex-1 w-full">
                        <div className="flex-1">
                            <div className="h-6 w-3/4 rounded bg-[#EDEDED] mb-3" />
                            <div className="h-4 w-full rounded bg-[#EDEDED] mb-2" />
                            <div className="h-4 w-11/12 rounded bg-[#EDEDED] mb-2" />
                            <div className="h-4 w-2/3 rounded bg-[#EDEDED]" />
                        </div>
                        <div className="flex items-center justify-between mt-4 gap-2">
                            <div className="h-5 w-20 rounded bg-[#EDEDED]" />
                            <div className="h-10 w-32 rounded border border-[#1E73BE] bg-white" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function FeaturedPrograms() {
    const { t } = useTranslations();
    const [tabsData, setTabsData] = useState<FeaturedProgramsTab[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [reloadToken, setReloadToken] = useState(0);

    useEffect(() => {
        let active = true;

        async function loadTabs() {
            setIsLoading(true);
            setHasError(false);
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
                    setHasError(true);
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        loadTabs();

        return () => {
            active = false;
        };
    }, [reloadToken]);

    const resolvedTabs: FeaturedProgramsTab[] = useMemo(() => {
        if (tabsData.length > 0) {
            return tabsData;
        }

        return [
            {
                id: ALL_TAB_ID,
                courses: [],
            },
        ];
    }, [tabsData]);

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
                            id: tab.id,
                            label: isAllTab ? t("featuredPrograms.allTab") : tab.id,
                            content:
                                isLoading && tabsData.length === 0 ? (
                                    <FeaturedProgramsSkeleton />
                                ) : hasError ? (
                                    <div className="text-center">
                                        <p className="text-lg">{t("featuredPrograms.loadingError")}</p>
                                        <div className="mt-5 flex justify-center gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setReloadToken((current) => current + 1)}
                                            >
                                                {t("featuredPrograms.retry")}
                                            </Button>
                                            <Link href="/program">
                                                <Button variant="outline">{t("featuredPrograms.viewMore")}</Button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : tab.courses.length > 0 ? (
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
