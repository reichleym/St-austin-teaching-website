
import CtaSection from "@/components/CtaSection";
import ExplorePrograms from "@/components/sections/ExplorePrograms";
import ProgramCard from "@/components/ProgramCard";
import BannerSection from "@/components/sections/BannerSection";
import Button from "@/components/Button";
import CheckList from "@/components/CheckList";
import WhyAustin from "@/components/sections/WhyAustin";
export default function ProgramPage() {
    const bannerContent = {
        title: "Tuition & Financial Aid",
        description: "Investing in your future should be clear and manageable.",
        bgImg: "/bannerImg.jpg"
    }

    const tableHeadings = [ "Program",  "Per Year",  "Per Credit"];
    const tableData = [
        { program: "Undergraduate (Online)", perYear: "$12,500", perCredit: "$12,500" },
        { program: "Computer Science", perYear: "$14,000", perCredit: "$14,000" },
        { program: "Data Science", perYear: "$13,000", perCredit: "$13,000" },
        { program: "Master of Business Administration", perYear: "$20,000", perCredit: "$20,000" }
    ];


    const listContent =[
        "Monthly installment plans with no interest",
        "Military and veteran benefits accepted",
        "Employer tuition reimbursement processing",
        "Federal and state financial aid eligible",
    ]
    const whiteCards = [
        {
            icon: "/wedding-certificate.svg",
            title: "Academic Excellence Award",
            description: "For students with a GPA of 3.5 or higher."
        },
        {
            icon: "/global-learning.svg",
            title: "Flexible Learning Options",
            description: "Study online or on-campus with schedules designed for working professionals."
        },
        {
            icon: "/workspace-premium.svg",
            title: "Career-Focused",
            description: "92% placement rate with dedicated career services and industry partnerships."
        },
        {
            icon: "/award-trophy.svg",
            title: "Expert Faculty",
            description: "Learn from industry practitioners and accomplished researchers."
        }
    ]

    return (

        <>
            <BannerSection {...bannerContent} />
            <section className="py-25">
                <div className="container">
                    <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="max-w-2xl mx-auto">
                        <table className="table w-full text-left border border-[#33333326] border-collapse overflow-hidden">
                            <thead className="bg-[#1E73BE] text-white text-lg font-semibold">
                                <tr>
                                    {tableHeadings.map((heading, index) => (
                                        <th key={index} className="py-3 px-5">{heading}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="">
                                {tableData.map((row, index) => (
                                    <tr key={index} className="odd:bg-[#F9F9F9] border border-[#33333326] border-collapse text-lg">
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
            <WhyAustin whiteCards={whiteCards} secTitle="Scholarships & Grants" whyAustinDesc={null} button={null} />
            <section className="bg-[#F9F9F9] py-25">
                <div className="container">
                    <h2 className="text-3xl font-bold mb-12 text-center">Payment Options</h2>
                    <div className="">
                        <CheckList listContent={listContent} className="grid md:grid-cols-2 gap-6" />
                    </div>
                </div>
            </section>
            <CtaSection className="pt-25" />
        </>
    );
}