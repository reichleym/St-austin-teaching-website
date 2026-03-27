import Button from "./Button";

export default function CtaSection() {
    return (
        <>
            <section className="pb-25">
                <div className="container">
                    <div className="bg-[#1E73BE] text-white rounded-lg grid md:grid-cols-10 gap-10 items-center">
                        <div className="md:col-span-6">
                            <div className="md:max-w-[80%] py-6 px-6 mx-auto">
                                <h2 className="font-semibold text-4xl mb-[10px]">Ready to Start Your Journey?</h2>
                                <p className="text-[15px] mb-[30px] md:w-[80%]">Take the next step toward your future. Our admissions team is here to guide you through every step of the process.</p>
                                <div className="flex flex-wrap gap-5">
                                    <Button variant="white">Apply Now</Button>
                                    <Button variant="whiteOutline">Request Info</Button>
                                    <Button variant="whiteOutline">Talk to an Advisor</Button>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-4 relative">
                            <div className="absolute h-full w-full left-0 top-0" style={{background: 'linear-gradient(270deg, rgba(30, 115, 190, 0) 50%, #1E73BE 100%);'}}></div>
                            <img src="/cta-img.png" alt="Find your learning path" className="w-full h-auto rounded-lg" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}