import BannerSection from "@/components/sections/BannerSection";
import Button from "@/components/Button";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa6";
import GovernmentEmployeeDiscountCard from "@/components/government-employee/GovernmentEmployeeDiscountCard";
import { isDatabaseConfigured } from "@/lib/postgres";
import { getCurrentSessionUser } from "@/lib/auth/server";
import {
    GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT,
    type GovernmentEmployeeGroup,
    type GovernmentVerificationStatus,
} from "@/lib/government-benefits";

type EmployeeGroup = {
    title: string;
    summary: string;
    support: string[];
};

type GovernmentBenefitState = {
    isGovernmentEmployee: boolean;
    governmentEmployeeGroup: GovernmentEmployeeGroup | null;
    governmentEmployeeId: string | null;
    governmentVerificationStatus: GovernmentVerificationStatus;
    governmentDiscountPercent: number;
};

export default async function GovernmentEmployeesPage() {
    let isLoggedIn = false;
    let initialBenefit: GovernmentBenefitState = {
        isGovernmentEmployee: false,
        governmentEmployeeGroup: null,
        governmentEmployeeId: null,
        governmentVerificationStatus: "not_submitted",
        governmentDiscountPercent: 0,
    };

    if (isDatabaseConfigured) {
        try {
            const sessionUser = await getCurrentSessionUser();
            if (sessionUser) {
                isLoggedIn = true;
                initialBenefit = {
                    isGovernmentEmployee: sessionUser.isGovernmentEmployee,
                    governmentEmployeeGroup: sessionUser.governmentEmployeeGroup,
                    governmentEmployeeId: sessionUser.governmentEmployeeId,
                    governmentVerificationStatus: sessionUser.governmentVerificationStatus,
                    governmentDiscountPercent: sessionUser.governmentDiscountPercent,
                };
            }
        } catch {
            isLoggedIn = false;
        }
    }

    const bannerContent = {
        title: "Government Employees",
        description:
            "Dedicated support, eligibility tools, and fee discounts for public-sector professionals.",
        bgImg: "/bannerImg.jpg",
    };

    const quickLinks = [
        "Tuition support and sponsorship guidance",
        "Flexible class schedules for shift workers",
        "Academic advising for public-service careers",
        "Credit for prior learning and professional training",
        "Career pathways in administration, IT, and leadership",
        "Veterans transition support services",
    ];

    const employeeGroups: EmployeeGroup[] = [
        {
            title: "Civil Service Employees",
            summary:
                "For ministry, council, and agency staff looking to strengthen management, policy, and digital skills.",
            support: [
                "Public administration pathways",
                "Weekend and evening options",
                "Employer-sponsored study support",
            ],
        },
        {
            title: "Veterans and Active-Duty Personnel",
            summary:
                "For service members and veterans transitioning into civilian careers or advancing their qualifications.",
            support: [
                "Transition-focused advising",
                "Recognition of prior service experience",
                "Career planning and placement support",
            ],
        },
        {
            title: "Public Safety Personnel",
            summary:
                "For police, emergency, and security professionals balancing duty schedules with academic goals.",
            support: [
                "Shift-friendly scheduling",
                "Leadership and operations upskilling",
                "Progress tracking with advisor support",
            ],
        },
        {
            title: "Public Health and Education Workers",
            summary:
                "For government-employed teachers, health workers, and administrators seeking advancement.",
            support: [
                "Program tracks for service delivery roles",
                "Practical, career-aligned curriculum",
                "Support for long-term professional growth",
            ],
        },
    ];

    return (
        <>
            <BannerSection {...bannerContent}>
                <Button className="mt-6" variant="icon" icon={<FaAngleRight />} size="lg">
                    Claim Your Discount
                </Button>
            </BannerSection>

            <section className="py-15 md:py-25">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <aside className="lg:col-span-1 rounded-lg border border-[#1E73BE40] bg-[#1E73BE0D] p-6">
                            <p className="text-sm font-semibold text-[#1E73BE] mb-2">
                                Government Employees Services at St. Austin University
                            </p>
                            <h3 className="text-[28px] font-bold leading-tight mb-5">Quick Links & Resources</h3>
                            <ul className="space-y-3">
                                {quickLinks.map((item) => (
                                    <li key={item} className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8">
                                <p className="font-semibold mb-2">Contact Support</p>
                                <p className="text-sm">Email: govtservices@staustin.edu</p>
                                <p className="text-sm">Phone: +237 670 000 000</p>
                            </div>
                        </aside>

                        <div className="lg:col-span-2">
                            <GovernmentEmployeeDiscountCard isLoggedIn={isLoggedIn} initialBenefit={initialBenefit} />

                            <div className="mt-6 rounded-lg border border-[#33333333] bg-white p-6">
                                <h3 className="text-[28px] font-bold mb-2">How the Discount Works</h3>
                                <ul className="space-y-2 text-[17px] text-[#333333CC]">
                                    <li className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>Sign in, select your category, and submit your government employee ID.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>
                                            Receive <strong>{GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT}% off</strong> the
                                            application fee only after admin approval.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-[#1E73BE] mt-0.5">•</span>
                                        <span>Email your ID details to govtservices@staustin.edu for review before discount activation.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mb-6">
                                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                                    Support by Government Employee Group
                                </h2>
                                <p>
                                    We have grouped public-sector learners so each team gets relevant guidance, benefits,
                                    and academic pathways.
                                </p>
                            </div>

                            <div className="space-y-5">
                                {employeeGroups.map((group) => (
                                    <article key={group.title} className="rounded-lg border border-[#33333333] p-6">
                                        <h3 className="text-[26px] font-bold mb-2">{group.title}</h3>
                                        <p className="mb-4">{group.summary}</p>
                                        <ul className="space-y-2">
                                            {group.support.map((item) => (
                                                <li key={item} className="flex gap-2">
                                                    <span className="text-[#1E73BE] mt-0.5">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                ))}
                            </div>

                            <div className="mt-10 rounded-lg bg-[#1E73BE] text-white p-7">
                                <h3 className="text-[30px] font-bold mb-3">Ready to Begin?</h3>
                                <p className="mb-6">
                                    Apply now and indicate your government employee category so our team can guide your
                                    enrollment and support options.
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    <Link
                                        href="/apply"
                                        className="bg-white text-[#1E73BE] rounded-[5px] px-5 py-2.5 font-medium"
                                    >
                                        Start Application
                                    </Link>
                                    <Link
                                        href="/program"
                                        className="border border-white rounded-[5px] px-5 py-2.5 font-medium"
                                    >
                                        View Programs
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
