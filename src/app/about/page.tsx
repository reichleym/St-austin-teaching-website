import BannerSection from "@/components/sections/BannerSection";
import CtaSection from "@/components/CtaSection";
import IconCard from "@/components/IconCard";
import { getAboutPageContent } from "@/lib/about-page";
import { getStudentExperienceContent } from "@/lib/student-experience-page";
import { getServerLanguage } from "@/lib/i18n/server";
import { getNestedValue, translationsMap, type Language } from "@/lib/i18n/catalog";

type TeamMember = {
    name: string;
    role: string;
    image: string;
    description: string;
};

type IconBlock = {
    cardTitle: string;
    cardDescription: string;
    icon: string;
};

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

export async function generateMetadata() {
    const lang = await getServerLanguage();
    const aboutData = await getAboutPageContent(lang);

    return {
        title: aboutData.banner?.title ?? "About St. Austin's International University",
        description: aboutData.banner?.description ?? "Learn more about St. Austin's International University.",
    };
}

export default async function AboutPage() {
    const lang = await getServerLanguage();
    const [aboutData] = await Promise.all([getAboutPageContent(lang), getStudentExperienceContent(lang)]);
    const translations = translationsMap[lang as Language];
    const fallbackTranslations = translationsMap.en;

    const bannerContent = {
        title: aboutData.banner?.title ?? translate("about.title", translations, fallbackTranslations),
        description: aboutData.banner?.description ?? translate("about.mission", translations, fallbackTranslations),
        bgImg: aboutData.banner?.bgImg ?? "/bannerImg.jpg",
    };

    const historyContent = {
        title: aboutData.history?.title ?? translate("about.history", translations, fallbackTranslations),
        description: aboutData.history?.description ?? translate("about.historyDesc", translations, fallbackTranslations),
        image: aboutData.history?.image ?? "/cta-img.png",
    };

    const missionTitle =
        aboutData.missionVision?.mission?.title ??
        aboutData.missionVision?.missionTitle ??
        aboutData.missionVision?.title ??
        translate("about.mission", translations, fallbackTranslations);

    const missionDescription =
        aboutData.missionVision?.mission?.desc ??
        aboutData.missionVision?.missionDesc ??
        aboutData.missionVision?.description ??
        translate("about.missionDesc", translations, fallbackTranslations);

    const visionTitle =
        aboutData.missionVision?.vision?.title ??
        aboutData.missionVision?.visionTitle ??
        translate("about.vision", translations, fallbackTranslations);

    const visionDescription =
        aboutData.missionVision?.vision?.desc ??
        aboutData.missionVision?.visionDesc ??
        translate("about.visionDesc", translations, fallbackTranslations);

    const blockContent: IconBlock[] = aboutData.iconCard?.blockContent ?? [
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

    const teamMembers: TeamMember[] = aboutData.teamGrid?.teamMembers ?? [
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
                            <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-[10px]">{historyContent.title}</h2>
                            <p>{historyContent.description}</p>
                        </div>
                        <div className="md:col-span-1 h-full">
                            <img src={historyContent.image} className="h-full object-cover rounded-lg w-full" alt="About history" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="md:py-25 py-15 bg-[#F5F5F5]">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="md:col-span-1">
                            <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-[10px]">{missionTitle}</h2>
                            <p className="text-lg">{missionDescription}</p>
                        </div>
                        <div className="md:col-span-1">
                            <h2 className="text-4xl md:text-[50px] leading-tight font-bold mb-[10px]">{visionTitle}</h2>
                            <p className="text-lg">{visionDescription}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="md:py-25 py-15">
                <div className="container">
                    <div className="mb-[50px] text-center">
                        <h2 className="text-4xl md:text-[50px] leading-tight font-bold">{aboutData.iconCard?.title ?? translate("about.accreditation", translations, fallbackTranslations)}</h2>
                    </div>
                    <IconCard blockContent={blockContent} classNameCard="border border-[#33333340] p-[30px]" />
                </div>
            </section>

            <section className="pb-25">
                <div className="container">
                    <div className="flex flex-col items-center text-center mb-[50px]">
                        <h2 className="text-4xl md:text-[50px] leading-tight font-bold">{aboutData.teamGrid?.title ?? translate("about.leadership", translations, fallbackTranslations)}</h2>
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

            <CtaSection title={aboutData.cta?.title} desc={aboutData.cta?.desc} />
        </>
    );
}
