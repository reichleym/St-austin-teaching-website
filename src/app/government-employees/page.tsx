import BannerSection from "@/components/sections/BannerSection";
import Button from "@/components/Button";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa6";
import GovernmentEmployeeDiscountCard from "@/components/government-employee/GovernmentEmployeeDiscountCard";
import { getGovernmentEmployeesContent } from "@/lib/government-employees-page";
import { getServerLanguage } from "@/lib/i18n/server";
import { getNestedValue, translationsMap, type Language } from "@/lib/i18n/catalog";
import type { GovernmentVerificationStatus } from "@/lib/government-benefits";

function translate(key: string, translations: Record<string, unknown>, fallbackTranslations: Record<string, unknown>) {
    const value = getNestedValue(translations, key);
    if (typeof value === "string") {
        return value;
    }

    const fallbackValue = getNestedValue(fallbackTranslations, key);
    if (typeof fallbackValue === "string") {
        return fallbackValue;
    }

    return key;
}

type EmployeeGroup = {
    title: string;
    summary: string;
    support: string[];
};

// Use the component's internal GovernmentBenefitState shape (structural typing will apply)

export async function generateMetadata() {
    const lang = await getServerLanguage();
    const data = await getGovernmentEmployeesContent(lang);

    return {
        title: data.banner?.title ?? "Government Employees",
        description: data.banner?.description ?? "Support and discounts for public employees.",
    };
}

export default async function GovernmentEmployeesPage() {
    const lang = await getServerLanguage();
    const data = await getGovernmentEmployeesContent(lang);
    const translations = translationsMap[lang as Language];
    const fallbackTranslations = translationsMap.en;

    const bannerContent = {
        title: data.banner?.title ?? translate("governmentEmployees.bannerTitle", translations, fallbackTranslations),
        description: data.banner?.description ?? translate("governmentEmployees.bannerDescription", translations, fallbackTranslations),
        bgImg: data.banner?.bgImg ?? "/bannerImg.jpg",
    };

    const quickLinks = [
        translate("governmentEmployees.quickLinks.tuitionSupport", translations, fallbackTranslations),
        translate("governmentEmployees.quickLinks.flexibleSchedules", translations, fallbackTranslations),
        translate("governmentEmployees.quickLinks.advising", translations, fallbackTranslations),
        translate("governmentEmployees.quickLinks.creditForPriorLearning", translations, fallbackTranslations),
        translate("governmentEmployees.quickLinks.careerPathways", translations, fallbackTranslations),
        translate("governmentEmployees.quickLinks.veteransSupport", translations, fallbackTranslations),
    ];

    const employeeGroups: EmployeeGroup[] =
        (data.supportGroups?.groups as any[] | undefined)?.map((g) => ({
            title: g.title ?? "",
            summary: g.summary ?? "",
            support: g.support ?? [],
        })) ?? [
            {
                title: translate("governmentEmployees.groups.civilService.title", translations, fallbackTranslations),
                summary: translate("governmentEmployees.groups.civilService.summary", translations, fallbackTranslations),
                support: [
                    translate("governmentEmployees.groups.civilService.support1", translations, fallbackTranslations),
                    translate("governmentEmployees.groups.civilService.support2", translations, fallbackTranslations),
                    translate("governmentEmployees.groups.civilService.support3", translations, fallbackTranslations),
                ],
            },
            {
                title: translate("governmentEmployees.groups.veterans.title", translations, fallbackTranslations),
                summary: translate("governmentEmployees.groups.veterans.summary", translations, fallbackTranslations),
                support: [
                    translate("governmentEmployees.groups.veterans.support1", translations, fallbackTranslations),
                    translate("governmentEmployees.groups.veterans.support2", translations, fallbackTranslations),
                    translate("governmentEmployees.groups.veterans.support3", translations, fallbackTranslations),
                ],
            },
            {
                title: translate("governmentEmployees.groups.publicSafety.title", translations, fallbackTranslations),
                summary: translate("governmentEmployees.groups.publicSafety.summary", translations, fallbackTranslations),
                support: [
                    translate("governmentEmployees.groups.publicSafety.support1", translations, fallbackTranslations),
                    translate("governmentEmployees.groups.publicSafety.support2", translations, fallbackTranslations),
                    translate("governmentEmployees.groups.publicSafety.support3", translations, fallbackTranslations),
                ],
            },
            {
                title: translate("governmentEmployees.groups.publicHealth.title", translations, fallbackTranslations),
                summary: translate("governmentEmployees.groups.publicHealth.summary", translations, fallbackTranslations),
                support: [
                    translate("governmentEmployees.groups.publicHealth.support1", translations, fallbackTranslations),
                    translate("governmentEmployees.groups.publicHealth.support2", translations, fallbackTranslations),
                    translate("governmentEmployees.groups.publicHealth.support3", translations, fallbackTranslations),
                ],
            },
        ];

    const initialBenefit = {
        isGovernmentEmployee: false,
        governmentEmployeeGroup: null,
        governmentEmployeeId: null,
        governmentVerificationStatus: ("not_submitted" as GovernmentVerificationStatus),
        governmentDiscountPercent: data.discountCard?.discountPercent ?? 0,
    };

    const isLoggedIn = false;

    return (
        <>
            <BannerSection {...bannerContent}>
                {/* <Button className="mt-6" variant="icon" icon={<FaAngleRight />} size="lg">
                    {translate("governmentEmployees.claimButton", translations, fallbackTranslations)}
                </Button> */}
            </BannerSection>

            <section className="py-15 md:py-25">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <aside className="lg:col-span-1 rounded-lg border border-[#1E73BE40] bg-[#1E73BE0D] p-6">
                            <p className="text-sm font-semibold text-[#1E73BE] mb-2">
                                {translate("governmentEmployees.asideTitle", translations, fallbackTranslations)}
                            </p>
                            <h3 className="text-[28px] font-bold leading-tight mb-5">{translate("governmentEmployees.quickLinksTitle", translations, fallbackTranslations)}</h3>
                            <ul className="space-y-3">
                                {quickLinks.map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8">
                                <p className="font-semibold mb-2">{translate("governmentEmployees.contactSupport", translations, fallbackTranslations)}</p>
                                <p className="text-sm">{translate("governmentEmployees.contactEmail", translations, fallbackTranslations)}</p>
                                <p className="text-sm">{translate("governmentEmployees.contactPhone", translations, fallbackTranslations)}</p>
                            </div>
                        </aside>

                        <div className="lg:col-span-2">
                            <GovernmentEmployeeDiscountCard isLoggedIn={isLoggedIn} initialBenefit={initialBenefit} />

                            <div className="mt-6 rounded-lg border border-[#33333333] bg-white p-6">
                                <h3 className="text-[28px] font-bold mb-2">{translate("governmentEmployees.howDiscountWorksTitle", translations, fallbackTranslations)}</h3>
                                <ul className="space-y-2 text-[17px] text-[#333333CC]">
                                    <li className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>{data.howItWorks?.steps ? data.howItWorks.steps[0] : translate("governmentEmployees.howDiscountWorksStep1", translations, fallbackTranslations)}</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>
                                            {data.howItWorks?.steps ? data.howItWorks.steps[1] : (
                                                <>
                                                    {translate("governmentEmployees.howDiscountWorksStep2Part1", translations, fallbackTranslations)} <strong>{initialBenefit.governmentDiscountPercent}% off</strong> {translate("governmentEmployees.howDiscountWorksStep2Part2", translations, fallbackTranslations)}
                                                </>
                                            )}
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>{data.howItWorks?.steps ? data.howItWorks.steps[2] : translate("governmentEmployees.howDiscountWorksStep3", translations, fallbackTranslations)}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                                    {translate("governmentEmployees.supportByGroupTitle", translations, fallbackTranslations)}
                                </h2>
                                <p>
                                    {translate("governmentEmployees.supportByGroupDesc", translations, fallbackTranslations)}
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
                                <h3 className="text-[30px] font-bold mb-3">{translate("governmentEmployees.cta.title", translations, fallbackTranslations) ?? "Ready to Begin?"}</h3>
                                <p className="mb-6">
                                    {data.cta?.buttons ? data.cta?.title : translate("governmentEmployees.cta.desc", translations, fallbackTranslations) ?? "Apply now and indicate your government employee category so our team can guide your enrollment and support options."}
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    <Link
                                        href={data.cta?.buttons?.[0]?.href ?? "/apply"}
                                        className="bg-white text-[#1E73BE] rounded-[5px] px-5 py-2.5 font-medium"
                                    >
                                        {data.cta?.buttons?.[0]?.text ?? translate("governmentEmployees.cta.startApplication", translations, fallbackTranslations) ?? "Start Application"}
                                    </Link>
                                    <Link
                                        href={data.cta?.buttons?.[1]?.href ?? "/program"}
                                        className="border border-white rounded-[5px] px-5 py-2.5 font-medium"
                                    >
                                        {data.cta?.buttons?.[1]?.text ?? translate("governmentEmployees.cta.viewPrograms", translations, fallbackTranslations) ?? "View Programs"}
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
