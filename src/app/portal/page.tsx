import BannerSection from "@/components/sections/BannerSection";
import Accreditation from "@/components/sections/Accreditation";
import Button from "@/components/Button";
import IconCard from "@/components/IconCard";
import Link from "next/link";
import ProgramCard from "@/components/ProgramCard";
import { getCourses, type CourseCardItem } from "@/lib/course-catalog";
import { isDatabaseConfigured } from "@/lib/postgres";



export default async function portalPage() {
    const bannerContent = {
        title: "Access Your Learning Portal",
        description: "Your portal to courses, assignments, discussions, and everything you need to succeed.",
        bgImg: "/bannerImg.jpg"
    }

    let dynamicPrograms: CourseCardItem[] = [];

    if (isDatabaseConfigured) {
        try {
            const courses = await getCourses({});
            dynamicPrograms = courses.slice(0, 4);
        } catch (error) {
            console.error("Failed to load dynamic programs for portal page:", error);
        }
    }

const blockContent = [
        {
            cardTitle: "Students",
            cardDescription: "Access courses, submit assignments, join discussions, track grades, and message instructors.",
            icon: "/awards-icon.png"
        },
        {
            cardTitle: "Faculty",
            cardDescription: "Manage courses, grade assignments, create discussions, and communicate with students.",
            icon: "/business-icon.png"
        },
        {
            cardTitle: "Administrators",
            cardDescription: "Manage users, departments, programs, reports, and institutional settings.",
            // icon: <IoSettingsOutline />
            icon: "/business-icon.png"
            

        },
    ]

     const blockFeatures = [
        {
            cardTitle: "Course Management",
            cardDescription: "Blackboard-style learning with organized modules, materials, and quizzes.",
            icon: "/awards-icon.png"
        },
        {
            cardTitle: "Real-Time Messaging",
            cardDescription: "Direct messaging and group discussions with instant notifications.",
            icon: "/business-icon.png"
        },
        {
            cardTitle: "Progress Tracking",
            cardDescription: "Visual dashboards showing grades, attendance, and learning milestones.",
            icon: "/nursing-icon.png"
        },

        {
            cardTitle: "Assignment System",
            cardDescription: "Submit, review, and grade assignments with inline feedback.",
            icon: "/awards-icon.png"
        },
        {
            cardTitle: "Virtual Classrooms",
            cardDescription: "Live sessions with video, screen sharing, and interactive tools.",
            icon: "/business-icon.png"
        },
        {
            cardTitle: "Collaboration",
            cardDescription: "Group projects, peer review, and collaborative document editing.",
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

            <Accreditation blockContent={blockFeatures} title="Platform Features" description="Everything you need for a seamless learning experience" className="bg-[#F5F5F5] py-25" classNameCard="items-center text-center md:gap-x-15" />

            <section className="py-25">
                <div className="container">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold">Programs You Can Explore</h2>
                        <p className="mt-2 text-lg text-[#333333CC]">These programs are loaded dynamically from the database.</p>
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
