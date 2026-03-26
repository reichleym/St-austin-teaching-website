
import CtaSection from "@/components/CtaSection";

import BannerSection from "@/components/sections/BannerSection";
import Button from "@/components/Button";
import Link from "next/dist/client/link";
import { CiCircleCheck } from "react-icons/ci";
export default function ProgramPage() {
    const bannerContent = {
        title: "Business Administration",
        description: "Develop strategic thinking and leadership skills for the modern business world.",
        bgImg: "/bannerImg.jpg"
    }
    const bannerBadge = ["Bachelor’s", "Online", "4 Years"];
    const checkListContent = [
        "High school diploma or equivalent",
        "Minimum GPA of 2.5",
        "English proficiency test",
        "Personal statement",
    ];
    const numberListContent = [
        {
            num: '01',
            text: "Introduction to Business"
        },
        {
            num: '02',
            text: "Marketing Principles"
        },
        {
            num: '03',
            text: "Strategic Management"
        },
        {
            num: '04',
            text: "Capstone Project"
        },
        {
            num: '05',
            text: "Financial Accounting"
        },
        {
            num: '06',
            text: "Organizational Behavior"
        },
        {
            num: '07',
            text: "Business Ethics"
        },
    ];

    const tagContent =["Business Manager", "Marketing Director", "Financial Analyst", "Entrepreneur", "Operations Manager"];
    return (

        <>
            <BannerSection {...bannerContent}>
                <div className="flex gap-2.5 -order-1 mb-2.5">
                    {bannerBadge.map((badge, index) =>
                        <span className="bg-[#1E73BE] text-white text-xs font-semibold px-2 py-1 rounded" key={index}>{badge}</span>
                    )}
                </div>
                <div className="flex gap-5 mt-11">
                    <Button variant="primary">Apply Now</Button>
                    <Button variant="outline">Request Info</Button>
                </div>
            </BannerSection>
            <section className="py-25">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-5 lg:gap-25 md:gap-12 gap-8">
                        <div className="col-span-3 space-y-15">
                            <div className="">
                                <h2 className="text-4xl font-bold mb-2.5">Program Overview</h2>
                                <p className="">Our Bachelor of Business Administration program equips students with comprehensive knowledge in management, finance, marketing, and entrepreneurship. Through case studies and real-world projects, graduates are prepared to lead in diverse business environments.</p>
                            </div>
                            <div className="">
                                <h2 className="text-4xl font-bold mb-5">Curriculum</h2>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {numberListContent.map((item, index) => (
                                        <li className="flex gap-2.5 items-center" key={index}>
                                            <span className="bg-[#1E73BE] font-semibold text-white w-11 h-11 rounded-full flex items-center justify-center">{item.num}</span>
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="">
                                <h2 className="text-4xl font-bold mb-2.5">Career Opportunities</h2>
                                <p className="mb-10">Our Bachelor of Business Administration program equips students with comprehensive knowledge in management, finance, marketing, and entrepreneurship. Through case studies and real-world projects, graduates are prepared to lead in diverse business environments.</p>
                                <div className="flex flex-wrap gap-4">
                                    {tagContent.map((tag, index) => (
                                        <span className="bg-[#F2F5FA] py-3 px-6 font-semibold" key={index}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2 space-y-5">
                            <div className="bg-[#F2F5FA] p-7 rounded-[6px]">
                                <h4 className="font-semibold text-2xl mb-2">Tuition & Fees</h4>
                                <div className="mb-5"><span className="text-[55px] font-bold">$12,500</span> <span>/ year</span></div>
                                <Link href="#" className="hover:underline">
                                    View financial aid options →
                                </Link>
                            </div>
                            <div className="bg-[#F2F5FA] p-7 rounded-[6px]">
                                <h4 className="font-semibold text-2xl mb-4">Admission Requirements</h4>
                                <ul className="space-y-3">
                                    {checkListContent.map((item, index) => (
                                        <li className="flex gap-2.5 items-center" key={index}>
                                            <CiCircleCheck size={24} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-[#1E73BE] p-7 rounded-[6px] text-white text-center">
                                <h4 className="font-semibold text-2xl mb-5">Start Your Application</h4>
                                <p>The next cohort begins Fall 2026</p>
                                <Button variant="white" className="mt-12 w-full">Apply Now</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <CtaSection />
        </>
    );
}