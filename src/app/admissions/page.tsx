import Button from "@/components/Button";
import { FaAngleRight } from "react-icons/fa6";
import BannerSection from "@/components/sections/BannerSection";
import StepsSection from "@/components/sections/StepsSection";
import CheckList from "@/components/CheckList";
import CtaSection from "@/components/CtaSection";
import Accordions from "@/components/Accordions";

export default function AdmissionsPage() {
    const bannerContent = {
        title: "Admissions",
        description: "Your journey to a brighter future starts here. Learn about our application process, requirements, and deadlines.",
        bgImg: "/bannerImg.jpg",
    };

    const stepsContent = [
        {
            cardTitle: "Choose Your Program",
            cardDescription: "Browse our catalog and select the program that aligns with your goals.",
            stepNum: "01",
        },
        {
            cardTitle: "Submit Your Application",
            cardDescription: "Complete the online application form with your personal and academic details.",
            stepNum: "02",
        },
        {
            cardTitle: "Provide Documents",
            cardDescription: "Upload transcripts, test scores, and any required supporting documents.",
            stepNum: "03",
        },
        {
            cardTitle: "Receive Your Decision",
            cardDescription: "Our admissions team will review and notify you within 2-3 weeks.",
            stepNum: "04",
        },
    ];

    const listContent = [
        "Completed online application form",
        "Official transcripts from all previous institutions",
        "Standardized test scores (if applicable)",
        "Letters of recommendation",
        "Personal statement or essay",
        "Application fee payment",
    ];

    const deadlineItem = [
        {
            title: "Fall 2026",
            headingOne: "Early Decision",
            headingTwo: "Regular",
            dateOne: "March 1, 2026",
            dateTwo: "June 15, 2026",
        },

        {
            title: "Spring 2027",
            headingOne: "Early Decision",
            headingTwo: "Regular",
            dateOne: "August 1, 2026",
            dateTwo: "November 15, 2026",
        },
    ];

    const accordionsContent = [
        {
            title: "Can I apply to multiple programs?",
            description: "The application deadlines vary by program. Please refer to our admissions page for specific dates and details.",
        },
        {
            title: "Is there an application fee?",
            description: "Typically, we require transcripts, standardized test scores, letters of recommendation, and a personal statement. Please check the specific requirements for your chosen program.",
        },
        {
            title: "How long does the review process take?",
            description: "Yes, there is a non-refundable application fee. The amount may vary depending on the program. Fee waivers are available for eligible applicants.",
        },
        {
            title: "Can I defer my admission?",
            description: "Yes, there is a non-refundable application fee. The amount may vary depending on the program. Fee waivers are available for eligible applicants.",
        },
    ];

    return (
        <>
            <BannerSection {...bannerContent}>
                <Button className="mt-6" variant="icon" icon={<FaAngleRight />} size="lg">Explore Programs</Button>
            </BannerSection>
            <StepsSection stepsContent={stepsContent} title="How to Apply" />
            <section className="bg-[#F9F9F9] py-25">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="md:col-span-1">
                            <h2 className="text-3xl font-bold mb-10">Requirements</h2>
                            <CheckList listContent={listContent} className="max-w-[500px]" />
                        </div>
                        <div className="md:col-span-1">
                            <img src="/cta-img.png" className="max-w-[500px] ml-auto h-full object-cover" alt="" />
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-25">
                <div className="container">
                    <div className="flex flex-col items-center text-center mb-12">
                        <h2 className="text-3xl font-bold">Important Deadlines</h2>
                    </div>
                    <div className="mx-auto max-w-[840px] space-y-5">
                        {deadlineItem.map((item, index) => (
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
            <section className="pb-25">
                <div className="container">
                    <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="mx-auto max-w-[840px] space-y-5">
                        <Accordions accordionsContent={accordionsContent} />
                    </div>
                </div>
            </section>
            <CtaSection />
        </>
    );
}
