"use client";

import Button from "@/components/Button";
import { FaAngleRight } from "react-icons/fa6";
import BannerSection from "@/components/sections/BannerSection";
import StepsSection from "@/components/sections/StepsSection";
import CheckList from "@/components/CheckList";
import CtaSection from "@/components/CtaSection";
import Accordions from "@/components/Accordions";
import { useTranslations } from "@/lib/useTranslations";

export default function AdmissionsPage() {
    const { t } = useTranslations();
    const bannerContent = {
        title: t("admissions.title"),
        description: t("admissions.desc"),
        bgImg: "/bannerImg.jpg",
    };

    const stepsContent = [
        {
            cardTitle: t("admissions.step1Title"),
            cardDescription: t("admissions.step1Desc"),
            stepNum: "01",
        },
        {
            cardTitle: t("admissions.step2Title"),
            cardDescription: t("admissions.step2Desc"),
            stepNum: "02",
        },
        {
            cardTitle: t("admissions.step3Title"),
            cardDescription: t("admissions.step3Desc"),
            stepNum: "03",
        },
        {
            cardTitle: t("admissions.step4Title"),
            cardDescription: t("admissions.step4Desc"),
            stepNum: "04",
        },
    ];

    const listContent = [
        t("admissions.req1"),
        t("admissions.req2"),
        t("admissions.req3"),
        t("admissions.req4"),
        t("admissions.req5"),
    ];

    const deadlineItem = [
        {
            title: t("admissions.intakeSeptember"),
            headingOne: t("admissions.priorityDeadline"),
            headingTwo: t("admissions.finalDeadline"),
            dateOne: t("admissions.septemberPriorityDate"),
            dateTwo: t("admissions.septemberFinalDate"),
        },
        {
            title: t("admissions.intakeJanuary"),
            headingOne: t("admissions.priorityDeadline"),
            headingTwo: t("admissions.finalDeadline"),
            dateOne: t("admissions.januaryPriorityDate"),
            dateTwo: t("admissions.januaryFinalDate"),
        },
        {
            title: t("admissions.intakeMay"),
            headingOne: t("admissions.priorityDeadline"),
            headingTwo: t("admissions.finalDeadline"),
            dateOne: t("admissions.mayPriorityDate"),
            dateTwo: t("admissions.mayFinalDate"),
        },
    ];

    const accordionsContent = [
        {
            title: t("admissions.faqQ1"),
            description: t("admissions.faqA1"),
        },
        {
            title: t("admissions.faqQ2"),
            description: t("admissions.faqA2"),
        },
        {
            title: t("admissions.faqQ3"),
            description: t("admissions.faqA3"),
        },
        {
            title: t("admissions.faqQ4"),
            description: t("admissions.faqA4"),
        },
    ];

    return (
        <>
            <BannerSection {...bannerContent}>
                <Button className="mt-6" variant="icon" icon={<FaAngleRight />} size="lg">{t("admissions.explorePrograms")}</Button>
            </BannerSection>
            <StepsSection stepsContent={stepsContent} title={t("admissions.stepsTitle") || "How to Apply"} />
            <section className="bg-[#F9F9F9] md:py-25 py-15">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="md:col-span-1">
                            <h2 className="text-3xl font-bold mb-10">{t("admissions.requirements")}</h2>
                            <CheckList listContent={listContent} className="md:max-w-[500px]" />
                        </div>
                        <div className="md:col-span-1">
                            <img src="/cta-img.png" className="w-full md:max-w-[500px] ml-auto h-full object-cover" alt="" />
                            <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-10">{t("admissions.requirements")}</h2>
                            <CheckList listContent={listContent} className="max-w-[500px]" classNamecheckboxList="p-3.5 border border-[#1E73BE]" />
                        </div>
                        <div className="md:col-span-1 h-full">
                            <img src="/cta-img.png" className="w-full h-full object-cover rounded-md" alt="" />
                        </div>
                    </div>
                </div>
            </section>
            <section className="md:py-25 py-15">
                <div className="container">
                    <div className="flex flex-col items-center text-center mb-12">
                        <h2 className="text-4xl md:text-[50px] leading-tight font-bold">{t("admissions.importantDeadlines")}</h2>
                    </div>
                    <div className="mx-auto max-w-[840px] space-y-5">
                        {deadlineItem.map((item, index) => (
                            <div className="grid md:grid-cols-5 gap-4 bg-[#1E73BE0D] py-5 px-7 border border-[#1E73BE] rounded items-center" key={index}>
                                <div className="col-span-2">
                                    <h3 className="text-2xl font-bold">{item.title}</h3>
                                </div>
                                <div className="col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1">
                                            <div className="mb-2.5 text-[15px]">{item.headingOne}</div>
                                            <p className="text-lg font-semibold leading-tight">{item.dateOne}</p>
                                        </div>
                                        <div className="col-span-1">
                                            <div className="mb-2.5 text-[15px]">{item.headingTwo}</div>
                                            <p className="text-lg font-semibold leading-tight">{item.dateTwo}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="md:pb-25 pb-15">
                <div className="container">
                    <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-12 text-center">{t("admissions.faq")}</h2>
                    <div className="mx-auto max-w-[890px] space-y-5">
                        <Accordions accordionsContent={accordionsContent} />
                    </div>
                </div>
            </section>
            <CtaSection />
        </>
    );
}
