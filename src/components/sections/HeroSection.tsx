import Button from "../Button";
import { FaAngleRight } from "react-icons/fa6";
import Link from "next/link";


export default function HeroSection() {
    return (
        <>
            <section className="relative max-h-[calc(100vh - 150px)] h-full md:min-h-[700px] text-white bg-black py-20 flex items-center bg-no-repeat bg-cover" style={{ backgroundImage: "url('../hero-banner.png')",}}>
                <div className="container mx-auto">
                    <div className="max-w-xl">
                        <h1 className="text-4xl md:text-[55px] font-bold mb-5 leading-tight">
                            Education That Leads Directly To Your Career
                        </h1>
                        <p className="mb-10">
                            Learn practical skills and gain real experience that prepares you to step directly into your career with confidence.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/apply" className="inline-flex">
                                <Button>Apply Now</Button>
                            </Link>
                            <Link href="/apply" className="inline-flex">
                                <Button variant="icon" icon={<FaAngleRight />}>Apply Now</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
