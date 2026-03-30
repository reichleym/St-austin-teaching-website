import Button from "./Button";

export default function CtaSection({ className }: { className?: string }) {
    return (
        <>
            <section className={`md:pb-25 pb-15 ${className || ''}`}>
                <div className="container">
                    <div className="bg-[#1E73BE] text-white rounded-lg grid md:grid-cols-10 gap-10 items-center">
                        <div className="md:col-span-6">
                            <div className="lg:max-w-[80%] py-6 px-6 mx-auto">
                                <h2 className="font-semibold text-4xl mb-[10px]">Ready to Start Your Journey?</h2>
                                <p className="text-[15px] mb-6 md:w-[80%]">Take the next step toward your future. Our admissions team is here to guide you through every step of the process.</p>
                                <div className="flex flex-wrap gap-5">
                                    <Button variant="white">Apply Now</Button>
                                    <Button variant="whiteOutline">Request Info</Button>
                                    <Button variant="whiteOutline">Talk to an Advisor</Button>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-4 relative h-full">
                            <div className="absolute h-full w-full inset-0 bg-[linear-gradient(360deg,rgba(30,115,190,0)_50%,#1E73BE_100%)] md:bg-[linear-gradient(270deg,rgba(30,115,190,0)_50%,#1E73BE_100%)]"></div>
                            <img src="/cta-img.png" alt="Ready to Start Your Journey?" className="w-full h-full rounded-lg object-cover" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}