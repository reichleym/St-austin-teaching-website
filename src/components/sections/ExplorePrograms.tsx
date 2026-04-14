"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../Button";
import type { ComponentPropsWithoutRef, FormEvent } from "react";
import { fetchProgramFilters, searchPrograms } from "@/services/programs";
import { useTranslations } from "@/lib/useTranslations";


const EMPTY_OPTIONS: string[] = [];

type ExploreProgramsProps = ComponentPropsWithoutRef<"section"> & {
    className?: string;
    degreeLevelOptions?: string[];
    fieldOfStudyOptions?: string[];
    selectedDegreeLevel?: string;
    selectedFieldOfStudy?: string;
    action?: string;
};

export default function ExplorePrograms({
    className,
    degreeLevelOptions = EMPTY_OPTIONS,
    fieldOfStudyOptions = EMPTY_OPTIONS,
    selectedDegreeLevel = "",
    selectedFieldOfStudy = "",
    action = "/program",
    ...rest
}: ExploreProgramsProps) {
    const { t } = useTranslations();
    const router = useRouter();
    const [degreeLevel, setDegreeLevel] = useState(selectedDegreeLevel);
    const [fieldOfStudy, setFieldOfStudy] = useState(selectedFieldOfStudy);

    const [apiDegreeLevelOptions, setApiDegreeLevelOptions] = useState<string[]>([]);
    const [apiFieldOfStudyOptions, setApiFieldOfStudyOptions] = useState<string[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const hasProvidedDegreeLevelOptions = degreeLevelOptions.length > 0;
    const hasProvidedFieldOfStudyOptions = fieldOfStudyOptions.length > 0;
    const resolvedDegreeLevelOptions = hasProvidedDegreeLevelOptions
        ? degreeLevelOptions
        : apiDegreeLevelOptions;
    const resolvedFieldOfStudyOptions = hasProvidedFieldOfStudyOptions
        ? fieldOfStudyOptions
        : apiFieldOfStudyOptions;

    useEffect(() => {
        setDegreeLevel(selectedDegreeLevel);
        setFieldOfStudy(selectedFieldOfStudy);
    }, [selectedDegreeLevel, selectedFieldOfStudy]);

    useEffect(() => {
        if (hasProvidedDegreeLevelOptions && hasProvidedFieldOfStudyOptions) {
            return;
        }

        let active = true;

        async function hydrateFilters() {
            try {
                const filters = await fetchProgramFilters();

                if (!active) {
                    return;
                }

                if (!hasProvidedDegreeLevelOptions) {
                    setApiDegreeLevelOptions(filters.degreeLevel);
                }

                if (!hasProvidedFieldOfStudyOptions) {
                    setApiFieldOfStudyOptions(filters.fieldOfStudy);
                }
            } catch (error) {
                console.error("Failed to load program filters:", error);
            }
        }

        hydrateFilters();

        return () => {
            active = false;
        };
    }, [hasProvidedDegreeLevelOptions, hasProvidedFieldOfStudyOptions]);

    function buildSearchUrl(): string {
        const params = new URLSearchParams();

        if (degreeLevel) {
            params.set("degreeLevel", degreeLevel);
        }

        if (fieldOfStudy) {
            params.set("fieldOfStudy", fieldOfStudy);
        }

        const query = params.toString();
        return query.length > 0 ? `${action}?${query}` : action;
    }

    async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const destination = buildSearchUrl();

        setIsSearching(true);
        try {
            await searchPrograms({
                degreeLevel: degreeLevel || undefined,
                fieldOfStudy: fieldOfStudy || undefined,
            });
        } catch (error) {
            console.error("Program search request failed:", error);
        } finally {
            setIsSearching(false);
            router.push(destination);
        }
    }

    return (
        <section className={`md:pt-25 pt-15 ${className ?? ""}`.trim()} {...rest}>
            <div className="container">
                <div className="bg-[#1E73BE] p-10 rounded-lg text-white gap-5 grid grid-cols-1 md:grid-cols-4 items-center">
                    <h2 className="font-semibold text-3xl col-span-1">{t('explorePrograms.title')}</h2>
                    <form
                        action={action}
                        method="GET"
                        onSubmit={handleSearchSubmit}
                        className="md:flex flex-wrap items-end md:space-x-5 md:space-y-0 space-y-5 col-span-1 md:col-span-3"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                            <div className="col-span-1">
                                <label htmlFor="degree-level" className="block text-xs font-medium mb-1">{t('explorePrograms.degreeLevel')}</label>
                                <div className="inline-block relative w-full">
                                    <select
                                        id="degree-level"
                                        name="degreeLevel"
                                        value={degreeLevel}
                                        onChange={(event) => setDegreeLevel(event.target.value)}
                                        className="block appearance-none w-full border border-[#FFFFFFBF] hover:border-white px-3 py-2 pr-8 rounded leading-tight focus:outline-none font-medium"
                                    >
                                        <option value="">{t('explorePrograms.allDegreeLevels')}</option>
                                        {resolvedDegreeLevelOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label htmlFor="field-of-study" className="block text-xs font-medium mb-1">{t('explorePrograms.fieldOfStudy')}</label>
                                <div className="inline-block relative w-full">
                                    <select
                                        id="field-of-study"
                                        name="fieldOfStudy"
                                        value={fieldOfStudy}
                                        onChange={(event) => setFieldOfStudy(event.target.value)}
                                        className="block appearance-none w-full border border-[#FFFFFFBF] hover:border-white px-3 py-2 pr-8 rounded leading-tight focus:outline-none font-medium"
                                    >
                                        <option value="">{t('explorePrograms.allFieldsOfStudy')}</option>
                                        {resolvedFieldOfStudyOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button variant="white" disabled={isSearching}>
                            {isSearching ? t('explorePrograms.searching') : t('explorePrograms.search')}
                        </Button>
                    </form>

                </div>
            </div>
        </section>
    );
}
