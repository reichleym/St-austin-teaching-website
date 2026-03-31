import Button from "@/components/Button";

export default function MatchingGiftSection() {
    return (
<section className="py-15 md:py-25">
                <div className="container">
                    <div className="mx-auto text-center">
                        <h2 className="text-3xl font-bold leading-tight text-[#333333] md:text-[50px]">
                            Matching Gift Programs Maximize Your Impact
                        </h2>
                        <p className="mx-auto mt-5 max-w-[760px] text-base leading-relaxed text-[#555555]">
                            Many employers sponsor matching gift programs and will match charitable contributions made by their employees. The
                            impact of your gift to St. Austin could be doubled or even tripled!
                        </p>

                        <form className="mx-auto mt-10 max-w-[520px]">
                            <label className="mb-2 block text-left text-sm font-medium text-[#333333]">
                                Search for your employer
                            </label>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <input
                                    type="text"
                                    placeholder="Enter your employers name"
                                    className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 outline-none"
                                />
                                <Button className="min-w-[120px] sm:w-auto" type="submit">
                                    Search
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

               );
}