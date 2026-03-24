import Button from "../Button";
import { FaAngleRight } from "react-icons/fa6";


export default function HeroSection() {
    return (
        <>
            <section className="relative max-h-[calc(100vh - 150px)] h-full md:min-h-[700px] text-white bg-black py-20 flex items-center bg-no-repeat bg-cover" style={{ backgroundImage: "url('../hero-banner.png')",}}>
                <div className="container mx-auto">
                    <div className="max-w-xl">
                        <h1 className="text-4xl md:text-[48px] font-bold mb-2.5 leading-tight">
                            Education <br /> That Leads Directly To Your Career
                        </h1>
                        <p className="mb-7.5">
                            Learn practical skills and gain real experience that prepares you to step directly into your career with confidence.
                        </p>
                        <div className="flex gap-4">
                            <Button>Apply Now</Button>
                            <Button variant="icon" icon={<FaAngleRight />}>Apply Now</Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}