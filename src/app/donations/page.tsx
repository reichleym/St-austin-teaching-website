import BannerSection from "@/components/sections/BannerSection";
import Accreditation from "@/components/sections/Accreditation";
import MatchingGiftSection from "@/components/sections/EmployerMatchingGift";
import CtaSection from "@/components/CtaSection";
import DonationsFormClient from "@/components/donations/DonationsFormClient";
import { getDonationsPageData } from "@/lib/donations-page";
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
  const { payload } = await getDonationsPageData(lang);
  return {
    title: payload.banner?.title ?? "Donations",
    description: payload.banner?.description ?? "Support our mission",
  };
}

export default async function DonationsPage() {
  const lang = await getServerLanguage();
  const { payload: data, sections } = await getDonationsPageData(lang);
  const translations = translationsMap[lang as Language];
  const fallbackTranslations = translationsMap.en;

  const defaultSectionOrder = [
    "BannerSection",
    "DonationFormSection",
    "WhyGiveSection",
    "OtherWaysSection",
    "Accreditation",
    "MatchingGiftSection",
    "CtaSection",
  ] as const;

  const orderedTypes = sections.length > 0 ? sections.map((s) => s.componentType) : [...defaultSectionOrder];
  const hasType = (type: string) => orderedTypes.includes(type);

  const bannerBgImg = data.banner?.bgImg ?? "/bannerImg.jpg";
  const banner = {
    title: data.banner?.title ?? translate("donations.title", translations, fallbackTranslations),
    description: data.banner?.description ?? translate("donations.desc", translations, fallbackTranslations),
    bgImg: bannerBgImg,
  };

  const donationFormTitle =
    data.donationForm?.title ?? translate("donations.donationAmounts", translations, fallbackTranslations);
  const donationFormDescription = data.donationForm?.description ?? "Support our mission.";
  const oneTimeAmounts =
    data.donationForm?.oneTimeAmounts ?? ["XAF 2,500", "XAF 5,000", "XAF 10,000", "XAF 25,000", "XAF 50,000", "XAF 100,000"];
  const designationOptions =
    data.donationForm?.designationOptions ?? ["Where It's Needed Most", "Student Scholarships", "Campus Ministry", "Academic Programs"];
  const paymentMethods = data.donationForm?.paymentMethods ?? [
    { value: "mtn_mobile_money", label: "MTN Mobile Money (CamPay)" },
    { value: "orange_money", label: "Orange Money (CamPay)" },
    { value: "credit_card", label: "Credit Card (CamPay)" },
    { value: "bank_transfer", label: "Bank Payment" },
  ];

  const whyGiveTitle = data.whyGive?.title ?? "Why Give?";
  const whyGiveDescription = data.whyGive?.description ?? "Your generosity directly impacts students' lives.";
  const whyGiveRaised = data.whyGive?.stats?.raised ?? "$2.4M";
  const whyGiveStudents = data.whyGive?.stats?.students ?? "1,200+";
  const whyGiveRaisedLabel = data.whyGive?.labels?.raised ?? "Raised Last Year";
  const whyGiveStudentsLabel = data.whyGive?.labels?.students ?? "Students Helped";

  const otherWaysTitle = data.otherWays?.title ?? "Other Ways to Give";
  const otherWaysItems = data.otherWays?.items ?? [
    "Mail a check to St. Austin University, Office of Advancement",
    "Donate stock, securities, or cryptocurrency",
    "Include St. Austin in your estate plans",
    "Set up a donor-advised fund gift",
  ];

  const defaultBlockFeatures = [
    { cardTitle: "Student Scholarships", cardDescription: "Every dollar donated funds scholarships...", icon: "/carbon_gui-management.png" },
    { cardTitle: "Academic Programs", cardDescription: "Support the development of innovative programs...", icon: "/tabler_message-check.png" },
    { cardTitle: "Student Support Services", cardDescription: "Help fund mentoring, tutoring, career counseling...", icon: "/hugeicons_progress-04.png" },
  ];

  const sourceBlockFeatures = data.impact?.blockContent?.length ? data.impact.blockContent : defaultBlockFeatures;
  const blockFeatures = sourceBlockFeatures.map((item, idx) => {
    const defaults = defaultBlockFeatures[idx] ?? { cardTitle: "", cardDescription: "", icon: "" };
    return {
      cardTitle: item.cardTitle ?? defaults.cardTitle,
      cardDescription: item.cardDescription ?? defaults.cardDescription,
      icon: item.icon ?? defaults.icon,
    };
  });

  const renderWhyGiveCard = () => (
    <div className="rounded-[10px] bg-[#EFF6FD] py-8 md:py-10 px-6 md:px-5">
      <FaHeart className="mb-5 text-[30px] text-[#1E73BE]" />
      <h5 className="mb-3 text-[22px] font-semibold leading-tight">{whyGiveTitle}</h5>
      <p className="max-w-[470px] text-[#333333]">{whyGiveDescription}</p>

      <div className="mt-10 grid grid-cols-2 gap-5">
        <div>
          <p className="text-[35px] md:text-[50px] font-semibold text-[#1E73BE] leading-[1em]">{whyGiveRaised}</p>
          <p className="mt-2 text-md font-medium text-[#1E73BE]">{whyGiveRaisedLabel}</p>
        </div>
        <div>
          <p className="text-[35px] md:text-[50px] font-semibold text-[#1E73BE] leading-[1em]">{whyGiveStudents}</p>
          <p className="mt-2 text-md font-medium text-[#1E73BE]">{whyGiveStudentsLabel}</p>
        </div>
      </div>
    </div>
  );

  const renderOtherWaysCard = () => (
    <div className="rounded-[10px] bg-[#EFF6FD] py-8 md:py-10 px-6 md:px-5">
      <FaGift className="mb-5 text-[30px] text-[#1E73BE]" />
      <h5 className="mb-3 text-[22px] font-semibold leading-tight">{otherWaysTitle}</h5>

      <div className="space-y-3">
        {otherWaysItems.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <IoIosCheckmarkCircleOutline className="mt-0.5 shrink-0 text-[22px] text-[#1E73BE]" />
            <p className="text-[#333333]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {orderedTypes.map((componentType, idx) => {
        switch (componentType) {
          case "BannerSection":
            return <BannerSection key={`${componentType}-${idx}`} {...banner} />;

          case "DonationFormSection": {
            const showWhyGive = hasType("WhyGiveSection");
            const showOtherWays = hasType("OtherWaysSection");

            return (
              <section className="py-15 md:py-25" key={`${componentType}-${idx}`}>
                <div className="container">
                  <div className="grid gap-[70px] md:gap-[140px] xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,420px)]">
                    <div>
                      <DonationsFormClient
                        title={donationFormTitle}
                        description={donationFormDescription}
                        oneTimeAmounts={oneTimeAmounts}
                        designationOptions={designationOptions}
                        paymentMethods={paymentMethods}
                      />
                    </div>

                    <div className="space-y-6">
                      {showWhyGive ? renderWhyGiveCard() : null}
                      {showOtherWays ? renderOtherWaysCard() : null}
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          case "WhyGiveSection": {
            if (hasType("DonationFormSection")) return null;
            return (
              <section className="py-15 md:py-25" key={`${componentType}-${idx}`}>
                <div className="container">{renderWhyGiveCard()}</div>
              </section>
            );
          }

          case "OtherWaysSection": {
            if (hasType("DonationFormSection")) return null;
            return (
              <section className="py-15 md:py-25" key={`${componentType}-${idx}`}>
                <div className="container">{renderOtherWaysCard()}</div>
              </section>
            );
          }

          case "Accreditation": {
            const title = data.impact?.title ?? translate("donations.impact", translations, fallbackTranslations);
            return (
              <Accreditation
                key={`${componentType}-${idx}`}
                blockContent={blockFeatures as Array<{ cardTitle: string; cardDescription: string; icon: string }>}
                title={title}
              />
            );
          }

          case "MatchingGiftSection":
            return (
              <MatchingGiftSection
                key={`${componentType}-${idx}`}
                title={data.matchingGift?.title}
                description={data.matchingGift?.description}
                searchLabel={data.matchingGift?.searchLabel}
                searchPlaceholder={data.matchingGift?.searchPlaceholder}
                searchButton={data.matchingGift?.searchButton}
              />
            );

          case "CtaSection":
            return <CtaSection key={`${componentType}-${idx}`} title={data.cta?.title} desc={data.cta?.desc} />;

          default:
            return null;
        }
      })}
    </>
  );
}
