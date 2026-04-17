"use client";

import CtaSection from "@/components/CtaSection";
import ExplorePrograms from "@/components/sections/ExplorePrograms";
import ProgramCard from "@/components/ProgramCard";
import BannerSection from "@/components/sections/BannerSection";
import Button from "@/components/Button";
import CheckList from "@/components/CheckList";
import WhyAustin from "@/components/sections/WhyAustin";
import Link from "next/link";
import { useTranslations } from "@/lib/useTranslations";

export default function ProgramPage() {
    const { t } = useTranslations();
    const bannerContent = {
        title: t("tuition.title"),
        description: t("tuition.subtitle"),
        bgImg: "/bannerImg.jpg"
    }

    const tableHeadings = [ t("tuition.programs"),  t("tuition.year"),  t("tuition.semester")];
    const tableData = [
        { program: "Undergraduate (Online)", perYear: "$12,500", perCredit: "$12,500" },
        { program: "Computer Science", perYear: "$14,000", perCredit: "$14,000" },
        { program: "Data Science", perYear: "$13,000", perCredit: "$13,000" },
        { program: "Master of Business Administration", perYear: "$20,000", perCredit: "$20,000" }
    ];


    const whiteCards = [
        {
            icon: "/wedding-certificate.svg",
            title: t('tuition.scholarships.academicExcellence.title'),
            description: t('tuition.scholarships.academicExcellence.description')
        },
        {
            icon: "/global-learning.svg",
            title: t('tuition.scholarships.flexibleLearning.title'),
            description: t('tuition.scholarships.flexibleLearning.description')
        },
        {
            icon: "/workspace-premium.svg",
            title: t('tuition.scholarships.careerFocused.title'),
            description: t('tuition.scholarships.careerFocused.description')
        },
        {
            icon: "/award-trophy.svg",
            title: t('tuition.scholarships.expertFaculty.title'),
            description: t('tuition.scholarships.expertFaculty.description')
        }
    ]

    return (

        <>
            <BannerSection {...bannerContent} />
            <section className="md:py-25 py-15">
                <div className="container">
                    <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-12 text-center">{t("tuition.title")}</h2>
                    <div className="max-w-2xl mx-auto relative overflow-x-auto rounded-lg border border-[#33333326]">
                        <table className="w-full text-sm text-left text-nowrap">
                            <thead className="bg-[#1E73BE] text-white text-lg font-semibold">
                                <tr>
                                    {tableHeadings.map((heading, index) => (
                                        <th key={index} className="py-3 px-5">{heading}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="">
                                {tableData.map((row, index) => (
                                    <tr key={index} className="odd:bg-[#F9F9F9] border-b border-[#33333326] text-lg last:border-0">
                                        <td className="py-3 px-5">{row.program}</td>
                                        <td className="py-3 px-5">{row.perYear}</td>
                                        <td className="py-3 px-5">{row.perCredit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
            <WhyAustin whiteCards={whiteCards} secTitle="Scholarships & Grants" whyAustinDesc={null} button={null} />
            <section className="bg-[#F9F9F9] md:py-25 py-15">
                <div className="container">
                    <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-12 text-center">{t("tuition.paymentPlans")}</h2>
                    <div className="">
                        <CheckList listContent={[t("tuition.paymentPlan.monthlyInstallment"), t("tuition.paymentPlan.militaryVeteran"), t("tuition.paymentPlan.employerReimbursement"), t("tuition.paymentPlan.federalAid")]} className="grid md:grid-cols-2 gap-6 space-y-0" classNamecheckboxList="p-3.5 border border-[#1E73BE]" />
                        <Button className="mt-12 mx-auto block" variant="primary">{t('tuition.scholarships.financialAidButton')}</Button>
                        {/* <CheckList listContent={[t("tuition.paymentPlan.monthlyInstallment"), t("tuition.paymentPlan.militaryVeteran"), t("tuition.paymentPlan.employerReimbursement"), t("tuition.paymentPlan.federalAid")]} className="grid md:grid-cols-2 gap-6" />
                        <Link href="/contact"><Button className="mt-12 mx-auto block" variant="primary">{t('tuition.scholarships.financialAidButton')}</Button></Link> */}
                    </div>
                </div>
            </section>
            <CtaSection className="md:pt-25 pt-15" />
        </>
    );
}