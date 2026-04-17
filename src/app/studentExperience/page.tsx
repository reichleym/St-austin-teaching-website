"use client";

import BannerSection from "@/components/sections/BannerSection";
import CtaSection from "@/components/CtaSection";
import Accreditation from "@/components/sections/Accreditation";
import CheckList from "@/components/CheckList";
import Button from "@/components/Button";
import { useTranslations } from "@/lib/useTranslations";

export default function studentExperiencePage() {
    const { t } = useTranslations();
    const bannerContent = {
        title: t("studentExperience.title"),
        description: t("studentExperience.desc"),
        bgImg: "/bannerImg.jpg"
    }

    const blockContent = [
        {
            cardTitle: "Flexible Online Learning",
            cardDescription: "Study from anywhere with our state-of-the-art virtual classroom and asynchronous course materials.",
            icon: "/awards-icon.png"
        },
        {
            cardTitle: "Collaborative Community",
            cardDescription: "Engage with peers through discussion forums, group projects, and networking events.",
            icon: "/business-icon.png"
        },
        {
            cardTitle: "Career Services",
            cardDescription: "Resume workshops, mock interviews, job fairs, and direct employer connections for every student.",
            icon: "/nursing-icon.png"
        },

        {
            cardTitle: "24/7 Support",
            cardDescription: "Study from anywhere with our state-of-the-art virtual classroom and asynchronous course materials.",
            icon: "/awards-icon.png"
        },
        {
            cardTitle: "Rich Resources",
            cardDescription: "Engage with peers through discussion forums, group projects, and networking events.",
            icon: "/business-icon.png"
        },
        {
            cardTitle: "Global Network",
            cardDescription: "Resume workshops, mock interviews, job fairs, and direct employer connections for every student.",
            icon: "/nursing-icon.png"
        },
    ]
    const listContent = [
        "Academic advising and mentorship",
        "Writing center and tutoring",
        "Disability and accessibility services",
        "Mental health and wellness programs",
        "Library and research support",
        "Technology help desk"
    ]

    return (
        <>
            <BannerSection {...bannerContent} >
            </BannerSection>
            <Accreditation blockContent={blockContent} title="How You'll Learn"/>
            <section className="md:pb-25 pb-15">
                <div className="container">
                    <div className="grid md:grid-cols-2 md:gap-15 gap-10 items-center">
                        <div className="md:col-span-1 h-full">
                            <img src="cta-img.png" className="h-full object-cover rounded-md w-full" alt="" />
                        </div>
                        <div className="md:col-span-1">
                            <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-[10px]">Learn on Your Schedule</h2>
                            <p className="text-lg">Whether you're a working professional, a parent, or a career changer, our programs are designed to fit your life. Study anytime, anywhere with our award-winning online platform.</p>
                            <CheckList listContent={listContent} className="max-w-[500px] mt-5" classNamecheckboxList="mb-3 p-0 text-[#1E73BE] font-semibold" />
                        </div>
                    </div>
                </div>
            </section>
            <section className="md:pb-25 pb-15">
                <div className="container">
                    <div className="grid md:grid-cols-2 md:gap-15 gap-10 items-center">
                        <div className="md:col-span-1">
                            <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-[10px]">Your Learning Dashboard</h2>
                            <p className="text-lg">Our integrated portal gives you access to assignments, discussions, messaging, grades, and more — all in one place.</p>
                            <Button className="mt-6" variant="primary">Access the Portal</Button>
                        </div>
                        <div className="md:col-span-1 h-full">
                            <img src="cta-img.png" className="h-full object-cover rounded-md w-full" alt="" />
                        </div>

                    </div>
                </div>
            </section>
            <CtaSection />
        </>
    );
}