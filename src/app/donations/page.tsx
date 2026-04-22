import BannerSection from "@/components/sections/BannerSection";
import Accreditation from "@/components/sections/Accreditation";
import MatchingGiftSection from "@/components/sections/EmployerMatchingGift";
import CtaSection from "@/components/CtaSection";
import DonationsFormClient from "@/components/donations/DonationsFormClient";
import { getDonationsContent, getDonationsSections } from "@/lib/donations-page";
import { getServerLanguage } from "@/lib/i18n/server";
import { getNestedValue, translationsMap, type Language } from "@/lib/i18n/catalog";
import { FaHeart, FaGift } from "react-icons/fa6";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

function translate(key: string, translations: Record<string, unknown>, fallbackTranslations: Record<string, unknown>) {
    const value = getNestedValue(translations, key);
    if (typeof value === "string") return value;
    const fallback = getNestedValue(fallbackTranslations, key);
    if (typeof fallback === "string") return fallback;
    return key;
}

export async function generateMetadata() {
    const lang = await getServerLanguage();
    const data = await getDonationsContent(lang);
    const sections = await getDonationsSections(lang);
    return {
        title: data.banner?.title ?? "Donations",
        description: data.banner?.description ?? "Support our mission",
    };
}

export default async function DonationsPage() {
    const lang = await getServerLanguage();
    const data = await getDonationsContent(lang);
    const translations = translationsMap[lang as Language];
    const fallbackTranslations = translationsMap.en;
    const sections = await getDonationsSections(lang);

    const bannerBgImg = data.banner?.bgImg ?? "/bannerImg.jpg";
    const banner = {
        title: data.banner?.title ?? translate("donations.title", translations, fallbackTranslations),
        description: data.banner?.description ?? translate("donations.desc", translations, fallbackTranslations),
        bgImg: bannerBgImg,
    };

    const oneTimeAmounts = data.donationForm?.oneTimeAmounts ?? ["XAF 2,500", "XAF 5,000", "XAF 10,000", "XAF 25,000", "XAF 50,000", "XAF 100,000"];
    const designationOptions = data.donationForm?.designationOptions ?? ["Where It's Needed Most", "Student Scholarships", "Campus Ministry", "Academic Programs"];
    const paymentMethods = (data.donationForm?.paymentMethods as any[]) ?? [
        { value: "mtn_mobile_money", label: "MTN Mobile Money (CamPay)" },
        { value: "orange_money", label: "Orange Money (CamPay)" },
        { value: "credit_card", label: "Credit Card (CamPay)" },
        { value: "bank_transfer", label: "Bank Payment" },
    ];

    const defaultBlockFeatures = [
        { cardTitle: "Student Scholarships", cardDescription: "Every dollar donated funds scholarships...", icon: "/carbon_gui-management.png" },
        { cardTitle: "Academic Programs", cardDescription: "Support the development of innovative programs...", icon: "/tabler_message-check.png" },
        { cardTitle: "Student Support Services", cardDescription: "Help fund mentoring, tutoring, career counseling...", icon: "/hugeicons_progress-04.png" },
    ];

    const sourceBlockFeatures = data.impact?.blockContent && data.impact.blockContent.length ? data.impact.blockContent : defaultBlockFeatures;
    const blockFeatures = sourceBlockFeatures.map((item, idx) => ({
        cardTitle: item.cardTitle ?? defaultBlockFeatures[idx].cardTitle,
        cardDescription: item.cardDescription ?? defaultBlockFeatures[idx].cardDescription,
        icon: item.icon ?? defaultBlockFeatures[idx].icon,
    }));

    const otherWays = data.otherWays?.items ?? ["Mail a check to St. Austin University, Office of Advancement", "Donate stock, securities, or cryptocurrency", "Include St. Austin in your estate plans", "Set up a donor-advised fund gift"];

    // If DB sections are present use them
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

                        case "DonationFormSection": {
                            const df = (content as any) ?? { oneTimeAmounts, designationOptions, paymentMethods };
                            return (
                                <section className="py-15 md:py-25" key={idx}>
                                    <div className="container">
                                        <div className="grid gap-[70px] md:gap-[140px] xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,420px)]">
                                            <div>
                                                <DonationsFormClient oneTimeAmounts={df.oneTimeAmounts ?? oneTimeAmounts} designationOptions={df.designationOptions ?? designationOptions} paymentMethods={df.paymentMethods ?? paymentMethods} />
                                            </div>
                                            <div className="space-y-6">
                                                {/* If the DB provided a WhyGiveSection later, it will render separately; keep a simple placeholder here if none */}
                                                <div className="rounded-[10px] bg-[#EFF6FD] py-8 md:py-10 px-6 md:px-5">
                                                    <FaHeart className="mb-5 text-[30px] text-[#1E73BE]" />
                                                    <h5 className="mb-3 text-[22px] font-semibold leading-tight">Why Give?</h5>
                                                    <p className="max-w-[470px] text-[#333333]">{data.whyGive?.description ?? "Your generosity directly impacts students' lives."}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            );
                        }

                        case "WhyGiveSection": {
                            const w = (content as any) ?? { description: data.whyGive?.description, stats: data.whyGive?.stats };
                            return (
                                <div className="py-8 md:py-10 px-6 md:px-5" key={idx}>
                                    <div className="container">
                                        <div className="rounded-[10px] bg-[#EFF6FD] py-8 md:py-10 px-6 md:px-5">
                                            <FaHeart className="mb-5 text-[30px] text-[#1E73BE]" />
                                            <h5 className="mb-3 text-[22px] font-semibold leading-tight">Why Give?</h5>
                                            <p className="max-w-[470px] text-[#333333]">{w.description ?? "Your generosity directly impacts students' lives."}</p>

                                            <div className="mt-10 grid grid-cols-2 gap-5">
                                                <div>
                                                    <p className="text-[35px] md:text-[50px] font-semibold text-[#1E73BE] leading-[1em]">{w.stats?.raised ?? data.whyGive?.stats?.raised ?? "$2.4M"}</p>
                                                    <p className="mt-2 text-md font-medium text-[#1E73BE]">Raised Last Year</p>
                                                </div>
                                                <div>
                                                    <p className="text-[35px] md:text-[50px] font-semibold text-[#1E73BE] leading-[1em]">{w.stats?.students ?? data.whyGive?.stats?.students ?? "1,200+"}</p>
                                                    <p className="mt-2 text-md font-medium text-[#1E73BE]">Students Helped</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        case "OtherWaysSection": {
                            const o = (content as any) ?? { items: otherWays };
                            return (
                                <div className="py-8 md:py-10 px-6 md:px-5" key={idx}>
                                    <div className="container">
                                        <div className="rounded-[10px] bg-[#EFF6FD] py-8 md:py-10 px-6 md:px-5">
                                            <FaGift className="mb-5 text-[30px] text-[#1E73BE]" />
                                            <h5 className="mb-3 text-[22px] font-semibold leading-tight">Other Ways to Give</h5>
                                            <div className="space-y-3">
                                                {(o.items ?? []).map((item: string) => (
                                                    <div key={item} className="flex items-start gap-3">
                                                        <IoIosCheckmarkCircleOutline className="mt-0.5 shrink-0 text-[22px] text-[#1E73BE] " />
                                                        <p className="text-[#333333] ">{item}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <button className="mt-10 w-full underline">Contact Advancement Office →</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        case "Accreditation": {
                            return <Accreditation key={idx} blockContent={blockFeatures} title={data.impact?.title ?? "Your Impact"} description={data.whyGive?.description ?? undefined} />;
                        }

                        case "MatchingGiftSection": {
                            return <MatchingGiftSection key={idx} />;
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
            <BannerSection {...banner} />

            <section className="py-15 md:py-25">
                <div className="container">
                    <div className="grid gap-[70px] md:gap-[140px] xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,420px)]">
                        <div>
                            <DonationsFormClient oneTimeAmounts={oneTimeAmounts} designationOptions={designationOptions} paymentMethods={paymentMethods} />
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-[10px] bg-[#EFF6FD] py-8 md:py-10 px-6 md:px-5">
                                <FaHeart className="mb-5 text-[30px] text-[#1E73BE]" />
                                <h5 className="mb-3 text-[22px] font-semibold leading-tight">Why Give?</h5>
                                <p className="max-w-[470px] text-[#333333]">{data.whyGive?.description ?? "Your generosity directly impacts students' lives."}</p>

                                <div className="mt-10 grid grid-cols-2 gap-5">
                                    <div>
                                        <p className="text-[35px] md:text-[50px] font-semibold text-[#1E73BE] leading-[1em]">{data.whyGive?.stats?.raised ?? "$2.4M"}</p>
                                        <p className="mt-2 text-md font-medium text-[#1E73BE]">Raised Last Year</p>
                                    </div>
                                    <div>
                                        <p className="text-[35px] md:text-[50px] font-semibold text-[#1E73BE] leading-[1em]">{data.whyGive?.stats?.students ?? "1,200+"}</p>
                                        <p className="mt-2 text-md font-medium text-[#1E73BE]">Students Helped</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-[10px] bg-[#EFF6FD] py-8 md:py-10 px-6 md:px-5">
                                <FaGift className="mb-5 text-[30px] text-[#1E73BE]" />
                                <h5 className="mb-3 text-[22px] font-semibold leading-tight">Other Ways to Give</h5>

                                <div className="space-y-3">
                                    {otherWays.map((item) => (
                                        <div key={item} className="flex items-start gap-3">
                                            <IoIosCheckmarkCircleOutline className="mt-0.5 shrink-0 text-[22px] text-[#1E73BE] " />
                                            <p className="text-[#333333] ">{item}</p>
                                        </div>
                                    ))}
                                </div>

                                <button className="mt-10 w-full underline">Contact Advancement Office →</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Accreditation blockContent={blockFeatures} title={data.impact?.title ?? "Your Impact"} description={data.whyGive?.description ?? undefined} />

            <MatchingGiftSection />

            <CtaSection title={data.cta?.title} desc={data.cta?.desc} />
        </>
    );
}
