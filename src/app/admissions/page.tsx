import BannerSection from "@/components/sections/BannerSection";
import StepsSection from "@/components/sections/StepsSection";
import CheckList from "@/components/CheckList";
import CtaSection from "@/components/CtaSection";
import Accordions from "@/components/Accordions";
import Button from "@/components/Button";
import { FaAngleRight } from "react-icons/fa6";
import { getAdmissionsContent, getAdmissionsSections } from "@/lib/admissions-page";
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
    const data = await getAdmissionsContent(lang);
    return {
        title: data.banner?.title ?? "Admissions",
        description: data.banner?.description ?? "Admissions and application information",
    };
}

export default async function AdmissionsPage() {
    const lang = await getServerLanguage();
    const data = await getAdmissionsContent(lang);
    const translations = translationsMap[lang as Language];
    const fallbackTranslations = translationsMap.en;

    const sections = await getAdmissionsSections(lang);

    const bannerContent = {
        title: data.banner?.title ?? translate("admissions.title", translations, fallbackTranslations),
        description: data.banner?.description ?? translate("admissions.desc", translations, fallbackTranslations),
        bgImg: data.banner?.bgImg ?? "/bannerImg.jpg",
    };

    const rawSteps = data.steps?.stepsContent ?? [];
    const stepsContent = (rawSteps.length ? rawSteps : [
        { cardTitle: translate("admissions.step1Title", translations, fallbackTranslations), cardDescription: translate("admissions.step1Desc", translations, fallbackTranslations), stepNum: "01" },
        { cardTitle: translate("admissions.step2Title", translations, fallbackTranslations), cardDescription: translate("admissions.step2Desc", translations, fallbackTranslations), stepNum: "02" },
        { cardTitle: translate("admissions.step3Title", translations, fallbackTranslations), cardDescription: translate("admissions.step3Desc", translations, fallbackTranslations), stepNum: "03" },
        { cardTitle: translate("admissions.step4Title", translations, fallbackTranslations), cardDescription: translate("admissions.step4Desc", translations, fallbackTranslations), stepNum: "04" },
    ]).map((item, idx) => ({
        cardTitle: item.cardTitle ?? translate(`admissions.step${idx + 1}Title`, translations, fallbackTranslations),
        cardDescription: item.cardDescription ?? translate(`admissions.step${idx + 1}Desc`, translations, fallbackTranslations),
        stepNum: item.stepNum ?? String(idx + 1).padStart(2, "0"),
    }));
    const requirementsImage = data.requirements?.image ?? "/cta-img.png";

    const requirements = data.requirements ?? {
        title: translate("admissions.requirements", translations, fallbackTranslations),
        requirementsDesc: translate("admissions.requirementsDesc", translations, fallbackTranslations),
        listContent: [translate("admissions.req1", translations, fallbackTranslations), translate("admissions.req2", translations, fallbackTranslations), translate("admissions.req3", translations, fallbackTranslations), translate("admissions.req4", translations, fallbackTranslations), translate("admissions.req5", translations, fallbackTranslations)],
        image: requirementsImage,
    };

    const deadlines = data.deadlines?.deadlineItem ?? [
        { title: translate("admissions.intakeSeptember", translations, fallbackTranslations), headingOne: translate("admissions.priorityDeadline", translations, fallbackTranslations), headingTwo: translate("admissions.finalDeadline", translations, fallbackTranslations), dateOne: translate("admissions.septemberPriorityDate", translations, fallbackTranslations), dateTwo: translate("admissions.septemberFinalDate", translations, fallbackTranslations) },
        { title: translate("admissions.intakeJanuary", translations, fallbackTranslations), headingOne: translate("admissions.priorityDeadline", translations, fallbackTranslations), headingTwo: translate("admissions.finalDeadline", translations, fallbackTranslations), dateOne: translate("admissions.januaryPriorityDate", translations, fallbackTranslations), dateTwo: translate("admissions.januaryFinalDate", translations, fallbackTranslations) },
        { title: translate("admissions.intakeMay", translations, fallbackTranslations), headingOne: translate("admissions.priorityDeadline", translations, fallbackTranslations), headingTwo: translate("admissions.finalDeadline", translations, fallbackTranslations), dateOne: translate("admissions.mayPriorityDate", translations, fallbackTranslations), dateTwo: translate("admissions.mayFinalDate", translations, fallbackTranslations) },
    ];

    const rawAccordions = data.faq?.accordionsContent ?? [];
    const accordionsContent = (rawAccordions.length ? rawAccordions : [
        { title: translate("admissions.faqQ1", translations, fallbackTranslations), description: translate("admissions.faqA1", translations, fallbackTranslations) },
        { title: translate("admissions.faqQ2", translations, fallbackTranslations), description: translate("admissions.faqA2", translations, fallbackTranslations) },
        { title: translate("admissions.faqQ3", translations, fallbackTranslations), description: translate("admissions.faqA3", translations, fallbackTranslations) },
        { title: translate("admissions.faqQ4", translations, fallbackTranslations), description: translate("admissions.faqA4", translations, fallbackTranslations) },
    ]).map((item, idx) => ({
        title: item.title ?? translate(`admissions.faqQ${idx + 1}`, translations, fallbackTranslations),
        description: item.description ?? translate(`admissions.faqA${idx + 1}`, translations, fallbackTranslations),
    }));

    // If DB sections are present use them for structure
    if (sections && sections.length > 0) {
        return (
            <>
                {sections.map((s, idx) => {
                    const content = s.content ?? {};
                    switch (s.componentType) {
                        case "BannerSection": {
                            const b = {
                                title: (content as any).title ?? bannerContent.title,
                                description: (content as any).description ?? bannerContent.description,
                                bgImg: (content as any).bgImg ?? bannerContent.bgImg,
                            };
                            return <BannerSection key={idx} {...b}><Button className="mt-6" variant="icon" icon={<FaAngleRight />} size="lg">{translate("admissions.explorePrograms", translations, fallbackTranslations)}</Button></BannerSection>;
                        }

                        case "StepsSection": {
                            const sdata = (content as any) ?? { stepsContent, title: data.steps?.title };
                            const sc = (sdata.stepsContent ?? []).map((item: any, i: number) => ({
                                cardTitle: item.cardTitle ?? translate(`admissions.step${i + 1}Title`, translations, fallbackTranslations),
                                cardDescription: item.cardDescription ?? translate(`admissions.step${i + 1}Desc`, translations, fallbackTranslations),
                                stepNum: item.stepNum ?? String(i + 1).padStart(2, "0"),
                            }));
                            return <StepsSection key={idx} stepsContent={sc} title={sdata.title ?? (data.steps?.title ?? translate("admissions.stepsTitle", translations, fallbackTranslations))} />;
                        }

                        case "RequirementsSection": {
                            const r = (content as any) ?? requirements;
                            return (
                                <section className="bg-[#F9F9F9] md:py-25 py-15" key={idx}>
                                    <div className="container">
                                        <div className="grid md:grid-cols-2 gap-10">
                                            <div>
                                                <h2 className="text-3xl font-bold mb-10">{r.title}</h2>
                                                <CheckList listContent={r.listContent ?? []} className="md:max-w-[500px]" />
                                            </div>
                                            <div>
                                                <img src={r.image ?? "/cta-img.png"} className="w-full md:max-w-[500px] ml-auto h-full object-cover" alt="" />
                                                <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-10">{r.title}</h2>
                                                <CheckList listContent={r.listContent ?? []} className="max-w-[500px]" classNamecheckboxList="p-3.5 border border-[#1E73BE]" />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            );
                        }

                        case "DeadlinesSection": {
                            const d = (content as any) ?? { title: data.deadlines?.title, deadlineItem: deadlines };
                            const items = d.deadlineItem ?? deadlines;
                            return (
                                <section className="md:py-25 py-15" key={idx}>
                                    <div className="container">
                                        <div className="flex flex-col items-center text-center mb-12">
                                            <h2 className="text-4xl md:text-[50px] leading-tight font-bold">{d.title ?? data.deadlines?.title ?? translate("admissions.importantDeadlines", translations, fallbackTranslations)}</h2>
                                        </div>
                                        <div className="mx-auto max-w-[840px] space-y-5">
                                            {items.map((item: any, index: number) => (
                                                <div className="grid md:grid-cols-5 gap-4 bg-[#1E73BE0D] py-5 px-7 border border-[#1E73BE] rounded items-center" key={index}>
                                                    <div className="col-span-2">
                                                        <h3 className="text-2xl font-bold">{item.title}</h3>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <div className="mb-2.5 text-[15px]">{item.headingOne}</div>
                                                                <p className="text-lg font-semibold leading-tight">{item.dateOne}</p>
                                                            </div>
                                                            <div>
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
                            );
                        }

                        case "FaqSection": {
                            const f = (content as any) ?? { title: data.faq?.title, accordionsContent };
                            return (
                                <section className="md:pb-25 pb-15" key={idx}>
                                    <div className="container">
                                        <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-12 text-center">{f.title ?? data.faq?.title ?? translate("admissions.faq", translations, fallbackTranslations)}</h2>
                                        <div className="mx-auto max-w-[890px] space-y-5">
                                            <Accordions accordionsContent={f.accordionsContent ?? accordionsContent} />
                                        </div>
                                    </div>
                                </section>
                            );
                        }

                        case "CtaSection": {
                            return <CtaSection key={idx} title={(content as any)?.title ?? data.cta?.title} desc={(content as any)?.desc ?? data.cta?.desc} />;
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
            <BannerSection {...bannerContent}>
                <Button className="mt-6" variant="icon" icon={<FaAngleRight />} size="lg">{translate("admissions.explorePrograms", translations, fallbackTranslations)}</Button>
            </BannerSection>

            <StepsSection stepsContent={stepsContent} title={(data.steps?.title ?? translate("admissions.stepsTitle", translations, fallbackTranslations)) || "How to Apply"} />

            <section className="bg-[#F9F9F9] md:py-25 py-15">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="md:col-span-1">
                            <h2 className="text-3xl font-bold mb-10">{requirements.title}</h2>
                            <CheckList listContent={requirements.listContent ?? []} className="md:max-w-[500px]" />
                        </div>
                        <div className="md:col-span-1">
                            <img src={requirements.image ?? "/cta-img.png"} className="w-full md:max-w-[500px] ml-auto h-full object-cover" alt="" />
                            <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-10">{requirements.title}</h2>
                            <CheckList listContent={requirements.listContent ?? []} className="max-w-[500px]" classNamecheckboxList="p-3.5 border border-[#1E73BE]" />
                        </div>
                        <div className="md:col-span-1 h-full">
                            <img src={requirements.image ?? "/cta-img.png"} className="w-full h-full object-cover rounded-md" alt="" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="md:py-25 py-15">
                <div className="container">
                    <div className="flex flex-col items-center text-center mb-12">
                        <h2 className="text-4xl md:text-[50px] leading-tight font-bold">{data.deadlines?.title ?? translate("admissions.importantDeadlines", translations, fallbackTranslations)}</h2>
                    </div>
                    <div className="mx-auto max-w-[840px] space-y-5">
                        {deadlines.map((item, index) => (
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
                    <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-12 text-center">{data.faq?.title ?? translate("admissions.faq", translations, fallbackTranslations)}</h2>
                    <div className="mx-auto max-w-[890px] space-y-5">
                        <Accordions accordionsContent={accordionsContent} />
                    </div>
                </div>
            </section>

            <CtaSection title={data.cta?.title} desc={data.cta?.desc} />
        </>
    );
}
