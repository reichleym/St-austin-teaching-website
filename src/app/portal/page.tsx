import BannerSection from "@/components/sections/BannerSection";
import Accreditation from "@/components/sections/Accreditation";
import Button from "@/components/Button";
import IconCard from "@/components/IconCard";
import Link from "next/link";
import ProgramCard from "@/components/ProgramCard";
import { getServerTranslations } from "@/lib/i18n/server";
import { getCourses, type CourseCardItem } from "@/lib/course-catalog";
import { isDatabaseConfigured } from "@/lib/postgres";



export default async function PortalPage() {
    const { t, lang } = await getServerTranslations();
    const bannerContent = {
        title: t('portal.accessTitle'),
        description: t('portal.accessDescription'),
        bgImg: "/bannerImg.jpg"
    }

    let dynamicPrograms: CourseCardItem[] = [];

    if (isDatabaseConfigured) {
        try {
            const courses = await getCourses({ language: lang });
            dynamicPrograms = courses.slice(0, 4);
        } catch (error) {
            console.error("Failed to load dynamic programs for portal page:", error);
        }
    }

const blockContent = [
        {
            cardTitle: t('portal.users.students.title'),
            cardDescription: t('portal.users.students.description'),
            icon: "/awards-icon.png"
        },
        {
            cardTitle: t('portal.users.faculty.title'),
            cardDescription: t('portal.users.faculty.description'),
            icon: "/business-icon.png"
        },
        {
            cardTitle: t('portal.users.administrators.title'),
            cardDescription: t('portal.users.administrators.description'),
            icon: "/business-icon.png"
        },
    ]

     const blockFeatures = [
        {
            cardTitle: t('portal.platformFeatures.courseManagement.title'),
            cardDescription: t('portal.platformFeatures.courseManagement.description'),
            icon: "/awards-icon.png"
        },
        {
            cardTitle: t('portal.platformFeatures.realTimeMessaging.title'),
            cardDescription: t('portal.platformFeatures.realTimeMessaging.description'),
            icon: "/business-icon.png"
        },
        {
            cardTitle: t('portal.platformFeatures.progressTracking.title'),
            cardDescription: t('portal.platformFeatures.progressTracking.description'),
            icon: "/nursing-icon.png"
        },
        {
            cardTitle: t('portal.platformFeatures.assignmentSystem.title'),
            cardDescription: t('portal.platformFeatures.assignmentSystem.description'),
            icon: "/awards-icon.png"
        },
        {
            cardTitle: t('portal.platformFeatures.virtualClassrooms.title'),
            cardDescription: t('portal.platformFeatures.virtualClassrooms.description'),
            icon: "/business-icon.png"
        },
        {
            cardTitle: t('portal.platformFeatures.collaboration.title'),
            cardDescription: t('portal.platformFeatures.collaboration.description'),
            icon: "/nursing-icon.png"
        },
    ]

    return (
        <>
            <BannerSection {...bannerContent} >
            </BannerSection> 
            <section className="md:py-25 py-15">
                <div className="container-fluid max-w-[950px]">
                    <IconCard blockContent={blockContent} classNameCard="border border-[#33333340] p-[20px] items-center text-center" className="" />
                </div>
            </section>

            <Accreditation blockContent={blockFeatures} title={t('portal.platformFeatures.title')} description={t('portal.platformFeatures.description')} className="bg-[#F5F5F5] py-25" classNameCard="items-center text-center md:gap-x-15" />

            <section className="py-25">
                <div className="container">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold">{t('portal.programsSection.title')}</h2>
                        <p className="mt-2 text-lg text-[#333333CC]">{t('portal.programsSection.subtitle')}</p>
                    </div>
                    <ProgramCard programCardContent={dynamicPrograms.length > 0 ? dynamicPrograms : undefined} />
                </div>
            </section>
            
            <section className="py-25">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div className="md:col-span-1">
                            <h2 className="text-3xl font-bold mb-[10px]">Intuitive Portal</h2>
                            <p className="text-lg">Navigate your academic journey with ease. Our portal puts everything at your fingertips — from upcoming assignments to live class schedules.</p>
                            <Link href="/portal/dashboard" className="inline-flex">
                                <Button className="mt-6" variant="primary">Go to Portal</Button>
                            </Link>
                        </div>
                        <div className="md:col-span-1">
                            <img src="cta-img.png" className="max-w-[500px] ml-auto h-full max-h-[400px] object-cover rounded-[8px]" alt="" />
                        </div>
                    </div>
                </div>
            </section>

        </>
    );
}
