import Button from "../Button";
import type { ComponentPropsWithoutRef } from "react";

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
    degreeLevelOptions = [],
    fieldOfStudyOptions = [],
    selectedDegreeLevel = "",
    selectedFieldOfStudy = "",
    action = "/program",
    ...rest
}: ExploreProgramsProps) {
    return (
        <section className={`md:pt-25 pt-15 ${className}`} {...rest}>
            <div className="container">
                <div className="bg-[#1E73BE] p-10 rounded-lg text-white gap-5 grid grid-cols-1 md:grid-cols-4 items-center">
                    <h2 className="font-semibold text-3xl col-span-1">Explore Programs</h2>
                    <form
                        action={action}
                        method="GET"
                        className="md:flex flex-wrap items-end md:space-x-5 md:space-y-0 space-y-5 col-span-1 md:col-span-3"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                            <div className="col-span-1">
                                <label htmlFor="degree-level" className="block text-xs font-medium mb-1">Select degree level</label>
                                <div className="inline-block relative w-full">
                                    <select
                                        id="degree-level"
                                        name="degreeLevel"
                                        defaultValue={selectedDegreeLevel}
                                        className="block appearance-none w-full border border-[#FFFFFFBF] hover:border-white px-3 py-2 pr-8 rounded leading-tight focus:outline-none font-medium"
                                    >
                                        <option value="">All degree levels</option>
                                        {degreeLevelOptions.map((option) => (
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
                                <label htmlFor="field-of-study" className="block text-xs font-medium mb-1">Field of study</label>
                                <div className="inline-block relative w-full">
                                    <select
                                        id="field-of-study"
                                        name="fieldOfStudy"
                                        defaultValue={selectedFieldOfStudy}
                                        className="block appearance-none w-full border border-[#FFFFFFBF] hover:border-white px-3 py-2 pr-8 rounded leading-tight focus:outline-none font-medium"
                                    >
                                        <option value="">All fields of study</option>
                                        {fieldOfStudyOptions.map((option) => (
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
                        <Button variant="white">Search</Button>
                    </form>
                </div>
            </div>
        </section>
    );
}
