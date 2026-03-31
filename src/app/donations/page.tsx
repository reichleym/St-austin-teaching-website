"use client";

import { useState } from "react";
import BannerSection from "@/components/sections/BannerSection";
import Button from "@/components/Button";
import Tabs from "@/components/Tabs";
import Accreditation from "@/components/sections/Accreditation";
import { FaAngleRight, FaGift, FaHeart } from "react-icons/fa6";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import CtaSection from "@/components/CtaSection";
import MatchingGiftSection from "@/components/sections/EmployerMatchingGift";

export default function DonationsPage() {
    const bannerContent = {
        title: "Make Your Gift to St. Austin University",
        description: "When you support St. Austin through student scholarships, you help others succeed. Every dollar donated funds scholarships and programs to help more students achieve their degrees.",
        bgImg: "/bannerImg.jpg"
    };

    const oneTimeAmounts = ["$25", "$50", "$100", "$250", "$500", "$1000"];
    const monthlyAmounts = ["$10", "$25", "$50", "$100", "$250", "$500"];
    const [selectedAmount, setSelectedAmount] = useState("$50");

    const otherWaysToGive = [
        "Mail a check to St. Austin University, Office of Advancement",
        "Donate stock, securities, or cryptocurrency",
        "Include St. Austin in your estate plans",
        "Set up a donor-advised fund gift"
    ];

    const blockFeatures = [
        {
            cardTitle: "Student Scholarships",
            cardDescription: "Every dollar donated funds scholarships to help students achieve their degrees and transform their careers.",
            icon: "/carbon_gui-management.png"
        },
        {
            cardTitle: "Academic Programs",
            cardDescription: "Support the development of innovative programs that prepare students for the demands of a modern workforce.",
            icon: "/tabler_message-check.png"
        },
        {
            cardTitle: "Student Support Services",
            cardDescription: "Help fund mentoring, tutoring, career counseling, and wellness resources for our diverse student body.",
            icon: "/hugeicons_progress-04.png"
        },
    ];

    const renderAmountGrid = (amounts: string[]) => (
        <div className="space-y-6 pt-2">
            <div className="grid grid-cols-2 gap-4 md:gap-[6] md:[grid-template-columns:repeat(auto-fit,minmax(150px,200px))]">
                {amounts.map((amount) => {
                    const isActive = selectedAmount === amount;

                    return (
                        <button
                            key={amount}
                            type="button"
                            onClick={() => setSelectedAmount(amount)}
                            className={`min-h-[50px] cursor-pointer border border-[#1E73BE] text-lg font-semibold transition-colors duration-200 ${
                                isActive
                                    ? "border-[#1E73BE] bg-[#1E73BE] text-white"
                                    : "border-[#8CC2F0] bg-[#1E73BE1A] text-[#333333] hover:border-[#1E73BE]"
                            }`}
                        >
                            {amount}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-4 text-[#8A8A8A] my-8 max-w-[450px] mx-auto">
                <span className="h-px flex-1 bg-[#D9D9D9]" />
                <span className="text-md font-medium tracking-[0.18em] tracking-[0em]">Or</span>
                <span className="h-px flex-1 bg-[#D9D9D9]" />
            </div>
        </div>
    );

    return (
        <>
            <BannerSection {...bannerContent}>
                <Button className="mt-6" variant="icon" icon={<FaAngleRight />} size="lg">
                    Explore Programs
                </Button>
            </BannerSection>

            <section className="py-15 md:py-25">
                <div className="container">
                    <div className="grid gap-[70px] md:gap-[140px] xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,420px)]">
                        <div className="rounded-[10px] bg-white">
                            <div className="mb-10">
                                <h2 className="mb-3 text-3xl font-bold leading-tight md:text-[35px]">Choose Your Gift Amount</h2>
                                <p className="text-[#333333]">Select a suggested amount or enter your own.</p>
                            </div>

                            <Tabs
                                defaultActiveTab="One Time"
                                tabs={[
                                    {
                                        label: "One Time",
                                        content: renderAmountGrid(oneTimeAmounts)
                                    },
                                    {
                                        label: "Monthly",
                                        content: renderAmountGrid(monthlyAmounts)
                                    }
                                ]}
                            />

                            <div className="space-y-5 pt-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#333333]">Enter a custom amount</label>
                                    <div className="flex items-center rounded-[5px] border border-[#BDBDBD] px-4">
                                        <span className="text-lg font-semibold text-[#333333]">$</span>
                                        <input
                                            type="text"
                                            placeholder={selectedAmount.replace("$", "")}
                                            className="h-12 w-full bg-transparent px-2 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#333333]">Designate your gift (optional)</label>
                                    <select className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 text-[#666666] outline-none">
                                        <option>Where It&apos;s Needed Most</option>
                                        <option>Student Scholarships</option>
                                        <option>Campus Ministry</option>
                                        <option>Academic Programs</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-10">
                                <h3 className="mb-8 text-3xl font-bold leading-tight md:text-[35px]">Your Information</h3>
                                <form>
    <div className="grid gap-[20px] md:gap-[24px] sm:grid-cols-2">
        <div>
            <label className="mb-2 block text-sm font-medium text-[#333333]">First Name</label>
            <input
                type="text"
                placeholder="First Name"
                className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 outline-none"
            />
        </div>
        <div>
            <label className="mb-2 block text-sm font-medium text-[#333333]">Last Name</label>
            <input
                type="text"
                placeholder="Last Name"
                className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 outline-none"
            />
        </div>
    </div>

    <div className="pt-5">
        <label className="mb-2 block text-sm font-medium text-[#333333]">Email Address</label>
        <input
            type="email"
            placeholder="email@example.com"
            className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 outline-none"
        />
    </div>

    <Button className="mt-8 w-full" type="submit">
        Donate
    </Button>
</form>

                                <p className="mx-auto mt-5 max-w-[480px] text-center text-base leading-relaxed text-[#333333]">
                                    Your donation is tax-deductible to the fullest extent allowed by law. St. Austin University is a 501(c)(3) organization.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-[10px] bg-[#EFF6FD] py-8 md:py-10 px-6 md:px-5">
                                <FaHeart className="mb-5 text-[30px] text-[#1E73BE]" />
                                <h5 className="mb-3 text-[22px] font-semibold leading-tight">Why Give?</h5>
                                <p className="max-w-[470px] text-[#333333]">
                                    Your generosity directly impacts students&apos; lives. Last year, donor-funded scholarships helped over 1,200 students complete their degrees and launch successful careers.
                                </p>

                                <div className="mt-10 grid grid-cols-2 gap-5">
                                    <div>
                                        <p className="text-[35px] md:text-[50px] font-semibold text-[#1E73BE] leading-[1em]">$2.4M</p>
                                        <p className="mt-2 text-md font-medium text-[#1E73BE]">Raised Last Year</p>
                                    </div>
                                    <div>
                                        <p className="text-[35px] md:text-[50px] font-semibold text-[#1E73BE] leading-[1em]">1,200+</p>
                                        <p className="mt-2 text-md font-medium text-[#1E73BE]">Students Helped</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[10px] bg-[#EFF6FD] py-8 md:py-10 px-6 md:px-5">
                                <FaGift className="mb-5 text-[30px] text-[#1E73BE]" />
                                <h5 className="mb-3 text-[22px] font-semibold leading-tight">Other Ways to Give</h5>

                                <div className="space-y-3">
                                    {otherWaysToGive.map((item) => (
                                        <div key={item} className="flex items-start gap-3">
                                            <IoIosCheckmarkCircleOutline className="mt-0.5 shrink-0 text-[22px] text-[#1E73BE] " />
                                            <p className="text-[#333333] ">{item}</p>
                                        </div>
                                    ))}
                                </div>

                                <Button className="mt-10 w-full underline" type="button">
                                    Contact Advancement Office →
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

           

            <Accreditation
                blockContent={blockFeatures}
                title="Your Impact at St. Austin"
                description="Every gift, no matter the size, helps us provide accessible, high-quality education to students who need it most."
                className="bg-[#F5F5F5] py-25"
                classNameCard="items-center text-center"
            />

            <MatchingGiftSection />

            <CtaSection />
        </>
    );
}
