import Button from "../Button";

export default function ExplorePrograms({className, ...rest}: {className?: string}) {
    return (
        <>
        <section className={`pt-25 ${className}`} {...rest}>
            <div className="container">
                <div className="bg-[#1E73BE] p-10 rounded-lg text-white grid grid-cols-1 md:grid-cols-4 items-center">
                    <h2 className="font-semibold text-2xl col-span-1 me-4">Explore Programs</h2>
                    <form action="" className="flex items-end gap-5 col-span-1 md:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
                            <div className="col-span-1">
                                <label htmlFor="degree-level" className="block text-xs font-medium mb-2">Select degree level</label>
                                <div className="inline-block relative w-full">
                                    <select className="block appearance-none w-full border border-[#FFFFFFBF] hover:border-white px-4 py-2 pr-8 rounded leading-tight focus:outline-none font-medium">
                                        <option>Select</option>
                                        <option>Option 2</option>
                                        <option>Option 3</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label htmlFor="degree-level" className="block text-xs font-medium mb-2">Select degree level</label>
                                <div className="inline-block relative w-full">
                                    <select className="block appearance-none w-full border border-[#FFFFFFBF] hover:border-white px-4 py-2 pr-8 rounded leading-tight focus:outline-none font-medium">
                                        <option>Select</option>
                                        <option>Option 2</option>
                                        <option>Option 3</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-1">
                                <label htmlFor="degree-level" className="block text-xs font-medium mb-2">Select degree level</label>
                                <div className="inline-block relative w-full">
                                    <select className="block appearance-none w-full border border-[#FFFFFFBF] hover:border-white px-4 py-2 pr-8 rounded leading-tight focus:outline-none font-medium">
                                        <option>Select</option>
                                        <option>Option 2</option>
                                        <option>Option 3</option>
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
        </>
    );
}   