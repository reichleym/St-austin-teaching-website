import BannerSection from "@/components/sections/BannerSection";
import CheckList from "@/components/CheckList";
import WhyAustin from "@/components/sections/WhyAustin";
import CtaSection from "@/components/CtaSection";
import { getTuitionContent, getTuitionSections } from "@/lib/tuition-page";
import { getServerLanguage } from "@/lib/i18n/server";
import { getNestedValue, translationsMap, type Language } from "@/lib/i18n/catalog";

function translate(key: string, translations: Record<string, unknown>, fallbackTranslations: Record<string, unknown>) {
    const value = getNestedValue(translations, key);
    if (typeof value === "string") return value;
    const fallback = getNestedValue(fallbackTranslations, key);
    if (typeof fallback === "string") return fallback;
    return key;
}

export async function generateMetadata() {
    const lang = await getServerLanguage();
    const data = await getTuitionContent(lang);
    return {
        title: data.banner?.title ?? "Tuition & Financial Aid",
        description: data.banner?.description ?? "Tuition and payment options",
    };
}

export default async function TuitionPage() {
    const lang = await getServerLanguage();
    const data = await getTuitionContent(lang);
    const sections = await getTuitionSections(lang);
    const translations = translationsMap[lang as Language];
    const fallbackTranslations = translationsMap.en;
    const bannerBgImg = data.banner?.bgImg ?? "/bannerImg.jpg";
    const banner = {
        title: data.banner?.title ?? translate("tuition.title", translations, fallbackTranslations),
        description: data.banner?.description ?? translate("tuition.subtitle", translations, fallbackTranslations),
        bgImg: bannerBgImg,
    };

    const table = data.tuitionTable ?? {
        title: translate("tuition.title", translations, fallbackTranslations),
        tableHeadings: [translate("tuition.programs", translations, fallbackTranslations), translate("tuition.year", translations, fallbackTranslations), translate("tuition.semester", translations, fallbackTranslations)],
        tableData: [
            { program: "Undergraduate (Online)", perYear: "$12,500", perCredit: "$12,500" },
            { program: "Computer Science", perYear: "$14,000", perCredit: "$14,000" },
            { program: "Data Science", perYear: "$13,000", perCredit: "$13,000" },
            { program: "Master of Business Administration", perYear: "$20,000", perCredit: "$20,000" },
        ],
    };

    const defaultScholarshipCards = [
        { icon: "/wedding-certificate.svg", title: translate('tuition.scholarships.academicExcellence.title', translations, fallbackTranslations), description: translate('tuition.scholarships.academicExcellence.description', translations, fallbackTranslations) },
        { icon: "/global-learning.svg", title: translate('tuition.scholarships.flexibleLearning.title', translations, fallbackTranslations), description: translate('tuition.scholarships.flexibleLearning.description', translations, fallbackTranslations) },
        { icon: "/workspace-premium.svg", title: translate('tuition.scholarships.careerFocused.title', translations, fallbackTranslations), description: translate('tuition.scholarships.careerFocused.description', translations, fallbackTranslations) },
        { icon: "/award-trophy.svg", title: translate('tuition.scholarships.expertFaculty.title', translations, fallbackTranslations), description: translate('tuition.scholarships.expertFaculty.description', translations, fallbackTranslations) },
    ];

    const scholarships = data.scholarships ?? {
        secTitle: translate("tuition.scholarships.title", translations, fallbackTranslations) ?? "Scholarships & Grants",
        whiteCards: defaultScholarshipCards,
    };

    const scholarshipsCards = (scholarships.whiteCards && scholarships.whiteCards.length ? scholarships.whiteCards : defaultScholarshipCards).map((item, idx) => ({
        icon: item.icon ?? defaultScholarshipCards[idx].icon,
        title: item.title ?? defaultScholarshipCards[idx].title,
        description: item.description ?? defaultScholarshipCards[idx].description,
    }));

    const paymentPlans = data.paymentPlans ?? {
        title: translate("tuition.paymentPlans", translations, fallbackTranslations),
        listContent: [translate("tuition.paymentPlan.monthlyInstallment", translations, fallbackTranslations), translate("tuition.paymentPlan.militaryVeteran", translations, fallbackTranslations), translate("tuition.paymentPlan.employerReimbursement", translations, fallbackTranslations), translate("tuition.paymentPlan.federalAid", translations, fallbackTranslations)],
        buttonText: translate('tuition.scholarships.financialAidButton', translations, fallbackTranslations),
    };

    // If DB sections are present use them for structure
    if (sections && sections.length > 0) {
        return (
            <>
                {sections.map((s, idx) => {
                    const content = s.content ?? {};
                    switch (s.componentType) {
                        case "BannerSection": {
                            const b = {
                                title: (content as any).title ?? banner.title,
                                description: (content as any).description ?? banner.description,
                                bgImg: (content as any).bgImg ?? banner.bgImg,
                            };
                            return <BannerSection key={idx} {...b} />;
                        }

                        case "TuitionTableSection": {
                            const t = (content as any) ?? table;
                            const headings: string[] = t.tableHeadings ?? table.tableHeadings;
                            const rows: any[] = t.tableData ?? table.tableData;
                            return (
                                <section className="md:py-25 py-15" key={idx}>
                                    <div className="container">
                                        <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-12 text-center">{t.title ?? table.title}</h2>
                                        <div className="max-w-2xl mx-auto relative overflow-x-auto rounded-lg border border-[#33333326]">
                                            <table className="w-full text-sm text-left text-nowrap">
                                                <thead className="bg-[#1E73BE] text-white text-lg font-semibold">
                                                    <tr>
                                                        {headings.map((heading, index) => (
                                                            <th key={index} className="py-3 px-5">{heading}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="">
                                                    {rows.map((row, index) => (
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
                            );
                        }

                        case "WhyAustin": {
                            const w = (content as any) ?? scholarships;
                            const cards = (w.whiteCards && w.whiteCards.length ? w.whiteCards : defaultScholarshipCards).map((item: any, i: number) => ({
                                icon: item.icon ?? defaultScholarshipCards[i].icon,
                                title: item.title ?? defaultScholarshipCards[i].title,
                                description: item.description ?? defaultScholarshipCards[i].description,
                            }));
                            return <WhyAustin key={idx} whiteCards={cards} secTitle={w.secTitle ?? scholarships.secTitle} whyAustinDesc={null} button={null} />;
                        }

                        case "PaymentPlansSection": {
                            const p = (content as any) ?? paymentPlans;
                            return (
                                <section className="bg-[#F9F9F9] md:py-25 py-15" key={idx}>
                                    <div className="container">
                                        <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-12 text-center">{p.title ?? paymentPlans.title}</h2>
                                        <div className="">
                                            <CheckList listContent={p.listContent ?? paymentPlans.listContent ?? []} className="grid md:grid-cols-2 gap-6 space-y-0" classNamecheckboxList="p-3.5 border border-[#1E73BE]" />
                                            <div className="mt-12 mx-auto block text-center">
                                                <button className="inline-flex rounded-[5px] bg-[#1E73BE] px-6 py-3 font-medium text-white">{p.buttonText ?? paymentPlans.buttonText}</button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            );
                        }

                        case "CtaSection": {
                            return <CtaSection className="pt-15 md:pt-25" key={idx} title={(content as any)?.title ?? data.cta?.title} desc={(content as any)?.desc ?? data.cta?.desc} />;
                        }

                        default:
                            return null;
                    }
                })}
            </>
        );
    }

    return (
        <>
            <BannerSection {...banner} />
            <section className="md:py-25 py-15">
                <div className="container">
                    <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-12 text-center">{banner.title}</h2>
                    <div className="max-w-2xl mx-auto relative overflow-x-auto rounded-lg border border-[#33333326]">
                        <table className="w-full text-sm text-left text-nowrap">
                            <thead className="bg-[#1E73BE] text-white text-lg font-semibold">
                                <tr>
                                    {table.tableHeadings?.map((heading, index) => (
                                        <th key={index} className="py-3 px-5">{heading}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="">
                                {table.tableData?.map((row, index) => (
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
            <WhyAustin whiteCards={scholarshipsCards} secTitle={scholarships.secTitle ?? "Scholarships & Grants"} whyAustinDesc={null} button={null} />
            <section className="bg-[#F9F9F9] md:py-25 py-15">
                <div className="container">
                    <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-12 text-center">{paymentPlans.title}</h2>
                    <div className="">
                        <CheckList listContent={paymentPlans.listContent ?? []} className="grid md:grid-cols-2 gap-6" classNamecheckboxList="p-3.5 border border-[#1E73BE]" />
                        <div className="mt-12 mx-auto block text-center">
                            <button className="inline-flex rounded-[5px] bg-[#1E73BE] px-6 py-3 font-medium text-white">{paymentPlans.buttonText}</button>
                        </div>
                    </div>
                </div>
            </section>
            <CtaSection title={data.cta?.title} desc={data.cta?.desc} className="md:pt-25 pt-15" />
        </>
    );
}