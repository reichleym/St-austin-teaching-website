'use client';

import BannerSection from "@/components/sections/BannerSection";
import Button from "@/components/Button";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa6";
import GovernmentEmployeeDiscountCard from "@/components/government-employee/GovernmentEmployeeDiscountCard";
import { isDatabaseConfigured } from "@/lib/postgres";
import { getCurrentSessionUser } from "@/lib/auth/server";
import { useTranslations } from "@/lib/useTranslations";
import {
    GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT,
    type GovernmentEmployeeGroup,
    type GovernmentVerificationStatus,
} from "@/lib/government-benefits";

type EmployeeGroup = {
    title: string;
    summary: string;
    support: string[];
};

type GovernmentBenefitState = {
    isGovernmentEmployee: boolean;
    governmentEmployeeGroup: GovernmentEmployeeGroup | null;
    governmentEmployeeId: string | null;
    governmentVerificationStatus: GovernmentVerificationStatus;
    governmentDiscountPercent: number;
};

export default function GovernmentEmployeesPage() {
    const { t } = useTranslations();

    // Translation support - keeping fallback English for now
    // This page has server-side database logic that will be refactored later
    let initialBenefit: GovernmentBenefitState = {
        isGovernmentEmployee: false,
        governmentEmployeeGroup: null,
        governmentEmployeeId: null,
        governmentVerificationStatus: "not_submitted",
        governmentDiscountPercent: 0,
    };

    // Server-side logic removed for now - will be refactored
    // This keeps the component as a client component for translation support
    let isLoggedIn = false;

    const bannerContent = {
        title: t("governmentEmployees.bannerTitle"),
        description: t("governmentEmployees.bannerDescription"),
        bgImg: "Government Employees",
    };

    const quickLinks = [
        t("governmentEmployees.quickLinks.tuitionSupport"),
        t("governmentEmployees.quickLinks.flexibleSchedules"),
        t("governmentEmployees.quickLinks.advising"),
        t("governmentEmployees.quickLinks.creditForPriorLearning"),
        t("governmentEmployees.quickLinks.careerPathways"),
        t("governmentEmployees.quickLinks.veteransSupport"),
    ];

    const employeeGroups: EmployeeGroup[] = [
        {
            title: t("governmentEmployees.groups.civilService.title"),
            summary: t("governmentEmployees.groups.civilService.summary"),
            support: [
                t("governmentEmployees.groups.civilService.support1"),
                t("governmentEmployees.groups.civilService.support2"),
                t("governmentEmployees.groups.civilService.support3"),
            ],
        },
        {
            title: t("governmentEmployees.groups.veterans.title"),
            summary: t("governmentEmployees.groups.veterans.summary"),
            support: [
                t("governmentEmployees.groups.veterans.support1"),
                t("governmentEmployees.groups.veterans.support2"),
                t("governmentEmployees.groups.veterans.support3"),
            ],
        },
        {
            title: t("governmentEmployees.groups.publicSafety.title"),
            summary: t("governmentEmployees.groups.publicSafety.summary"),
            support: [
                t("governmentEmployees.groups.publicSafety.support1"),
                t("governmentEmployees.groups.publicSafety.support2"),
                t("governmentEmployees.groups.publicSafety.support3"),
            ],
        },
        {
            title: t("governmentEmployees.groups.publicHealth.title"),
            summary: t("governmentEmployees.groups.publicHealth.summary"),
            support: [
                t("governmentEmployees.groups.publicHealth.support1"),
                t("governmentEmployees.groups.publicHealth.support2"),
                t("governmentEmployees.groups.publicHealth.support3"),
            ],
        },
    ];

    return (
        <>
            <BannerSection {...bannerContent}>
                <Button className="mt-6" variant="icon" icon={<FaAngleRight />} size="lg">
                    {t("governmentEmployees.claimButton")}
                </Button>
            </BannerSection>

            <section className="py-15 md:py-25">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <aside className="lg:col-span-1 rounded-lg border border-[#1E73BE40] bg-[#1E73BE0D] p-6">
                            <p className="text-sm font-semibold text-[#1E73BE] mb-2">
                                {t("governmentEmployees.asideTitle")}
                            </p>
                            <h3 className="text-[28px] font-bold leading-tight mb-5">{t("governmentEmployees.quickLinksTitle")}</h3>
                            <ul className="space-y-3">
                                {quickLinks.map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8">
                                <p className="font-semibold mb-2">{t("governmentEmployees.contactSupport")}</p>
                                <p className="text-sm">{t("governmentEmployees.contactEmail")}</p>
                                <p className="text-sm">{t("governmentEmployees.contactPhone")}</p>
                            </div>
                        </aside>

                        <div className="lg:col-span-2">
                            <GovernmentEmployeeDiscountCard isLoggedIn={isLoggedIn} initialBenefit={initialBenefit} />

                            <div className="mt-6 rounded-lg border border-[#33333333] bg-white p-6">
                                <h3 className="text-[28px] font-bold mb-2">{t("governmentEmployees.howDiscountWorksTitle")}</h3>
                                <ul className="space-y-2 text-[17px] text-[#333333CC]">
                                    <li className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>{t("governmentEmployees.howDiscountWorksStep1")}</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>
                                            {t("governmentEmployees.howDiscountWorksStep2Part1")} <strong>{GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT}% off</strong> {t("governmentEmployees.howDiscountWorksStep2Part2")}
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>{t("governmentEmployees.howDiscountWorksStep3")}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                                    {t("governmentEmployees.supportByGroupTitle")}
                                </h2>
                                <p>
                                    {t("governmentEmployees.supportByGroupDesc")}
                                </p>
                            </div>

                            <div className="space-y-5">
                                {employeeGroups.map((group) => (
                                    <article key={group.title} className="rounded-lg border border-[#33333333] p-6">
                                        <h3 className="text-[26px] font-bold mb-2">{group.title}</h3>
                                        <p className="mb-4">{group.summary}</p>
                                        <ul className="space-y-2">
                                            {group.support.map((item) => (
                                                <li key={item} className="flex gap-2">
                                                    <span className="text-[#1E73BE] mt-0.5">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>

                            <div className="mt-10 rounded-lg bg-[#1E73BE] text-white p-7">
                                <h3 className="text-[30px] font-bold mb-3">Ready to Begin?</h3>
                                <p className="mb-6">
                                    Apply now and indicate your government employee category so our team can guide your
                                    enrollment and support options.
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    <Link
                                        href="/apply"
                                        className="bg-white text-[#1E73BE] rounded-[5px] px-5 py-2.5 font-medium"
                                    >
                                        Start Application
                                    </Link>
                                    <Link
                                        href="/program"
                                        className="border border-white rounded-[5px] px-5 py-2.5 font-medium"
                                    >
                                        View Programs
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
