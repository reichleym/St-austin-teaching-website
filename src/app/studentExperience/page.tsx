import BannerSection from "@/components/sections/BannerSection";
import CtaSection from "@/components/CtaSection";
import Accreditation from "@/components/sections/Accreditation";
import CheckList from "@/components/CheckList";
import Button from "@/components/Button";
import { getStudentExperienceContent } from "@/lib/student-experience-page";
import { getServerLanguage } from "@/lib/i18n/server";
import {
  getNestedValue,
  translationsMap,
  type Language,
} from "@/lib/i18n/catalog";
import Link from "next/link";
import ExpandableText from "@/components/ExpandableText";

function translate(
  key: string,
  translations: Record<string, unknown>,
  fallbackTranslations: Record<string, unknown>,
) {
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

export async function generateMetadata() {
  const lang = await getServerLanguage();
  const data = await getStudentExperienceContent(lang);

  return {
    title: data.banner?.title ?? "Student Experience",
    description:
      data.banner?.description ?? "Discover student life and support services.",
  };
}

export default async function StudentExperiencePage() {
  const lang = await getServerLanguage();
  const data = await getStudentExperienceContent(lang);
  const translations = translationsMap[lang as Language];
  const fallbackTranslations = translationsMap.en;

  const bannerContent = {
    title:
      data.banner?.title ??
      translate("studentExperience.title", translations, fallbackTranslations),
    description:
      data.banner?.description ??
      translate("studentExperience.desc", translations, fallbackTranslations),
    bgImg: data.banner?.bgImg ?? "/bannerImg.jpg",
  };

  const blockContent = data.iconCard?.blockContent ?? [
    {
      cardTitle: "Flexible Online Learning",
      cardDescription:
        "Study from anywhere with our state-of-the-art virtual classroom and asynchronous course materials.",
      icon: "/awards-icon.png",
    },
    {
      cardTitle: "Collaborative Community",
      cardDescription:
        "Engage with peers through discussion forums, group projects, and networking events.",
      icon: "/business-icon.png",
    },
    {
      cardTitle: "Career Services",
      cardDescription:
        "Resume workshops, mock interviews, job fairs, and direct employer connections for every student.",
      icon: "/nursing-icon.png",
    },
  ];

  const listContent = data.learnSchedule?.list ?? [
    "Academic advising and mentorship",
    "Writing center and tutoring",
    "Disability and accessibility services",
    "Mental health and wellness programs",
    "Library and research support",
    "Technology help desk",
  ];

  const dashboard = data.learningDashboardCta;

  return (
    <>
      <BannerSection {...bannerContent} />
      <Accreditation
        blockContent={blockContent}
        title={
          data.iconCard?.title ??
          translate(
            "studentExperience.howYoullLearn",
            translations,
            fallbackTranslations,
          )
        }
      />
      <section className="md:pb-25 pb-15">
        <div className="container">
          <div className="grid md:grid-cols-2 md:gap-15 gap-10 items-center">
            <div className="md:col-span-1 h-full">
              <img
                src={data.learnSchedule?.image ?? "cta-img.png"}
                className="h-full object-cover rounded-md w-full"
                alt=""
              />
            </div>
            <div className="md:col-span-1">
              <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-[10px]">
                {data.learnSchedule?.title ??
                  translate(
                    "studentExperience.learnOnYourSchedule",
                    translations,
                    fallbackTranslations,
                  )}
              </h2>
              <p className="text-lg">
                {data.learnSchedule?.title
                  ? data.learnSchedule?.title
                  : translate(
                      "studentExperience.learnOnYourScheduleDesc",
                      translations,
                      fallbackTranslations,
                    )}
              </p>
              <CheckList
                listContent={listContent}
                className="max-w-[500px] mt-5"
                classNamecheckboxList="mb-3 p-0 text-[#1E73BE] font-semibold"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="md:pb-25 pb-15">
        <div className="container">
          <div className="grid md:grid-cols-2 md:gap-15 gap-10 items-center">
            <div className="md:col-span-1">
              <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-[10px]">
                {dashboard?.title ??
                  translate(
                    "studentExperience.learningDashboardTitle",
                    translations,
                    fallbackTranslations,
                  )}
              </h2>
              <p className="text-lg">
                {dashboard?.description ??
                  translate(
                    "studentExperience.learningDashboardDesc",
                    translations,
                    fallbackTranslations,
                  )}
              </p>
              <Link href={dashboard?.button?.href ?? "/portal"}>
                <Button className="mt-6" variant="primary">
                  {dashboard?.button?.label ??
                    translate(
                      "studentExperience.accessPortal",
                      translations,
                      fallbackTranslations,
                    )}
                </Button>
              </Link>
            </div>
            <div className="md:col-span-1 h-full">
              <img
                src={dashboard?.image ?? "cta-img.png"}
                className="h-full object-cover rounded-md w-full"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pb-25">
        <div className="container">
          <div className="flex flex-col items-center text-center mb-[50px]">
            <h2 className="text-4xl md:text-[50px] leading-tight font-bold">
              {data?.testimonials?.title ??
                translate(
                  "studentExperience.testimonials",
                  translations,
                  fallbackTranslations,
                )}
            </h2>
            {data?.testimonials?.description && (
              <p className="leading-tight">{data?.testimonials?.description}</p>
            )}
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {data?.testimonials?.testimonials?.map((item) => (
              <div
                key={item?.name}
                className="card rounded-md bg-[#F5F5F5] overflow-hidden"
              >
                <img
                  src={item?.profileImage}
                  alt={item?.name}
                  className="w-full h-[322px] object-cover"
                />
                <div className="p-5">
                  <h4 className="font-semibold mb-[5px] text-[22px] leading-tight">
                    {item?.name}
                  </h4>
                  <h5 className="text-lg font-medium mb-[10px] text-[#1E73BE] leading-tight">
                    {item?.course}
                  </h5>
                  <ExpandableText text={item?.experience} maxLength={180} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaSection title={data?.cta?.title} desc={data?.cta?.desc} />
    </>
  );
}
