"use client";

import BannerSection from "@/components/sections/BannerSection";
import CtaSection from "@/components/CtaSection";
import Accreditation from "@/components/sections/Accreditation";
import { Icon } from "lucide-react";
import IconCard from "@/components/IconCard";
import { useTranslations } from "@/lib/useTranslations";

export default function AboutPage() {
    const { t } = useTranslations();
    const bannerContent = {
        title: t("about.title"),
        description: t("about.mission"),
        bgImg: "/bannerImg.jpg",
    };

    const blockContent = [
        {
            cardTitle: "National Board of Higher Education",
            cardDescription: "National Board of Higher Education",
            icon: "/awards-icon.png",
        },
        {
            cardTitle: "Business Programs",
            cardDescription: "International accreditation for business programs",
            icon: "/business-icon.png",
        },
        {
            cardTitle: "Nursing Programs",
            cardDescription: "Commission on Collegiate Nursing Education",
            icon: "/nursing-icon.png",
        },
    ];

    const teamMembers = [
        {
            name: "Dr. Margaret Chen",
            role: "President",
            image: "/team1.jpg",
            description:
                "Dr. Chen brings over 25 years of academic leadership experience and a vision for accessible, career-oriented education.",
        },
        {
            name: "Dr. Robert Williams",
            role: "Provost & VP of Academic Affairs",
            image: "/team1.jpg",
            description: "A distinguished scholar in educational innovation, Dr. Williams oversees curriculum development and academic quality.",
        },
        {
            name: "Dr. Amara Osei",
            role: "Dean of Student Affairs",
            image: "/team1.jpg",
            description: "Dr. Osei is passionate about student success and leads initiatives in mentorship, career services, and community building.",
        },
        {
            name: "Prof. David Nakamura",
            role: "Dean of Technology",
            image: "/team1.jpg",
            description: "Prof. Nakamura drives the university's technology programs and digital learning infrastructure with industry expertise.",
        },
    ];

    return (
        <>
            <BannerSection {...bannerContent} />

            <section className="md:py-25 py-15">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div className="md:col-span-1">
                            <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-[10px]">{t("about.history")}</h2>
                            <p className="">
                                {t("about.historyDesc")}
                            </p>
                        </div>
                        <div className="md:col-span-1 h-full">
                            <img src="/cta-img.png" className="h-full object-cover rounded-lg w-full" alt="" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="md:py-25 py-15 bg-[#F5F5F5]">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="md:col-span-1">
                            <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-[10px]">{t("about.mission")}</h2>
                            <p className="text-lg">{t("about.missionDesc")}</p>
                        </div>
                        <div className="md:col-span-1">
                            <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-[10px]">{t("about.vision")}</h2>
                            <p className="text-lg">{t("about.visionDesc")}</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="md:py-25 py-15">
                <div className="container">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-4xl md:text-[50px] leading-tight font-bold">{t("about.accreditation")}</h2>
                    </div>
                    <IconCard blockContent={blockContent} classNameCard="border border-[#33333340] p-[30px]" />
                </div>
            </section>

            <section className="pb-25">
                <div className="container">
                    <div className="flex flex-col items-center text-center mb-[50px]">
                        <h2 className="text-4xl md:text-[50px] leading-tight font-bold">{t("about.leadership")}</h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-5">
                        {teamMembers.map((member) => (
                            <div key={member.name} className="card rounded-md bg-[#F5F5F5] overflow-hidden">
                                <img src={member.image} alt={member.name} className="w-full h-[322px] object-cover" />
                                <div className="p-5">
                                    <h4 className="font-semibold mb-[5px] text-[22px] leading-tight">{member.name}</h4>
                                    <h5 className="text-lg font-medium mb-[10px] text-[#1E73BE] leading-tight">{member.role}</h5>
                                    <p className="text-lg">{member.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CtaSection />
        </>
    );
}
