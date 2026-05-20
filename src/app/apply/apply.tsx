'use client';

import { useEffect, useMemo, useState } from "react";
import {
    Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { useTranslations } from "@/lib/useTranslations";
import { cn } from "@/lib/utils";

type StepId =
    | "dashboard"
    | "program"
    | "batchStart"
    | "studentType"
    | "studentInfo"
    | "review"
    | "submitted";

type StudentType = "national" | "international";
type ApplicationStatus = "not_started" | "under_review";
type SubmissionSummary = {
    confirmationEmail: string;
    instructionProgram: string;
    instructionChecklist: string[];
};

type GovernmentBenefitState = {
    isGovernmentEmployee: boolean;
    governmentEmployeeGroup: string | null;
    governmentEmployeeId: string | null;
    governmentVerificationStatus: "not_submitted" | "pending_review" | "approved" | "rejected";
    governmentDiscountPercent: number;
};

type SessionUserSnapshot = {
    id: number;
    fullName: string;
    email: string;
};

type ApplyPageContentProps = {
    initialApplicationStatus?: ApplicationStatus;
    programOptions?: string[];
    initialSessionUser?: SessionUserSnapshot | null;
    initialGovernmentBenefit?: GovernmentBenefitState;
};

type ApplicationForm = {
    program: string;
    batchStart: string;
    studentType: StudentType;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    highestEducation: string;
    interestLevel: string;
    interestArea: string;
};

const fullApplicationSteps: Exclude<StepId, "dashboard" | "submitted">[] = [
    "program",
    "batchStart",
    "studentType",
    "studentInfo",
    "review",
];

const stepMeta = {
    program: { label: "apply.step3Title" },
    batchStart: { label: "apply.startDate" },
    studentType: { label: "apply.studyPreference" },
    studentInfo: { label: "apply.step1Title" },
    review: { label: "apply.step4Title" },
} as const;

const batchStartOptions = [
    { value: "September", labelKey: "apply.intake.september" },
    { value: "January", labelKey: "apply.intake.january" },
    { value: "May", labelKey: "apply.intake.may" },
] as const;
const highestEducationOptions = [
    { value: "High School Diploma", labelKey: "apply.education.highSchoolDiploma" },
    { value: "Associate Degree", labelKey: "apply.education.associateDegree" },
    { value: "Bachelor's Degree", labelKey: "apply.education.bachelorsDegree" },
    { value: "Master's Degree", labelKey: "apply.education.mastersDegree" },
    { value: "Doctorate", labelKey: "apply.education.doctorate" },
    { value: "Other", labelKey: "apply.education.other" },
] as const;
const interestLevelOptions = [
    { value: "Exploring options", labelKey: "apply.interest.exploringOptions" },
    { value: "Interested", labelKey: "apply.interest.interested" },
    { value: "Very interested", labelKey: "apply.interest.veryInterested" },
    { value: "Ready to apply", labelKey: "apply.interest.readyToApply" },
] as const;
const defaultProgramOptions = ["Data Science", "Business Administration", "Public Health"];

const initialForm: ApplicationForm = {
    program: "",
    batchStart: "September",
    studentType: "national",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    highestEducation: "",
    interestLevel: "",
    interestArea: "",
};

function splitFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) {
        return { firstName: "", lastName: "" };
    }

    if (parts.length === 1) {
        return { firstName: parts[0], lastName: "" };
    }

    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
    };
}

function getInstructionChecklistForProgram(program: string): string[] {
    const normalizedProgram = program.trim().toLowerCase();

    if (normalizedProgram.includes("data")) {
        return [
            "apply.checklist.transcript",
            "apply.checklist.resume",
            "apply.checklist.learningGoalsStatement",
            "apply.checklist.identityProof",
        ];
    }

    if (normalizedProgram.includes("business")) {
        return [
            "apply.checklist.transcript",
            "apply.checklist.resume",
            "apply.checklist.personalStatement",
            "apply.checklist.identityProof",
        ];
    }

    if (normalizedProgram.includes("public")) {
        return [
            "apply.checklist.transcript",
            "apply.checklist.resume",
            "apply.checklist.statementOfPurpose",
            "apply.checklist.identityProof",
        ];
    }

    return [
        "apply.checklist.transcript",
        "apply.checklist.resume",
        "apply.checklist.personalStatement",
        "apply.checklist.identityProof",
    ];
}

function SectionHeading({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-[4px] bg-[#2F79BE] px-6 py-6 text-white md:px-8 md:py-8">
            <h1 className="text-[28px] font-semibold leading-none md:text-[40px]" style={{ fontFamily: '"EB Garamond", serif' }}>
                {title}
            </h1>
            <p className="mt-3 text-[18px] leading-[1.2] text-white/95">{description}</p>
        </div>
    );
}

function Stepper({
    activeStep,
    steps,
    allCompleted = false,
}: {
    activeStep: Exclude<StepId, "dashboard" | "submitted">;
    steps: Exclude<StepId, "dashboard" | "submitted">[];
    allCompleted?: boolean;
}) {
    const { t } = useTranslations();
    const activeIndex = steps.indexOf(activeStep);

    return (
        <div className="overflow-x-auto">
            <div className="mx-auto my-8 flex min-w-max items-start justify-center px-4 md:my-13">
                {steps.map((step, index) => {
                    const isActive = step === activeStep;
                    const isComplete = allCompleted || index < activeIndex;
                    const connectorClass = allCompleted || index <= activeIndex ? "bg-[#1E73BE]" : "bg-[#D9D9D9]";
                    const circleClass = isActive
                        ? allCompleted ? "bg-[#FAAE14] text-white" : "bg-[#2F79BE] text-white"
                        : isComplete
                            ? "bg-[#FAAE14] text-white"
                            : "bg-[#DFE2E7] text-[#8B8B8B]";
                    const labelClass = isActive ? "text-[#2F79BE]" : isComplete ? "text-[#2F79BE]" : "text-[#8B8B8B]";

                    return (
                        <div key={step} className="flex items-start">
                            <div className="flex w-[86px] flex-col items-center text-center">
                                <div className={cn("flex h-[60px] w-[60px] items-center justify-center rounded-full", circleClass)}>
                                    <StepIcon step={step} state={isActive ? "active" : isComplete ? "complete" : "idle"} />
                                </div>
                                <p
                                    className={cn(
                                        "mt-2 text-[15px] font-medium leading-[1.05]",
                                        labelClass
                                    )}
                                >
                                    {t(stepMeta[step].label)}
                                </p>
                            </div>
                            {index < steps.length - 1 ? (
                                <div className={cn("mt-[26px] h-px w-[34px]", connectorClass)} />
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StepIcon({
    step,
    state,
}: {
    step: Exclude<StepId, "dashboard" | "submitted">;
    state: "active" | "complete" | "idle";
}) {
    const stroke = state === "idle" ? "#333333" : "#FFFFFF";
    const strokeOpacity = state === "idle" ? "0.5" : undefined;
    const fill = state === "idle" ? "#333333" : "#FFFFFF";
    const fillOpacity = state === "idle" ? "0.5" : undefined;

    if (step === "program") {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M25.3333 6.6665L15.9999 2.6665L6.66659 6.6665L11.3333 8.6665V11.3332M25.3333 6.6665L20.6666 8.6665V11.3332M25.3333 6.6665V11.9998M11.3333 11.3332C11.3333 11.3332 12.8893 10.6665 15.9999 10.6665C19.1106 10.6665 20.6666 11.3332 20.6666 11.3332M11.3333 11.3332V12.6665C11.3333 13.2793 11.454 13.8862 11.6885 14.4524C11.923 15.0185 12.2667 15.533 12.7001 15.9663C13.1334 16.3997 13.6479 16.7434 14.2141 16.9779C14.7802 17.2125 15.3871 17.3332 15.9999 17.3332C16.6128 17.3332 17.2196 17.2125 17.7858 16.9779C18.352 16.7434 18.8664 16.3997 19.2997 15.9663C19.7331 15.533 20.0768 15.0185 20.3114 14.4524C20.5459 13.8862 20.6666 13.2793 20.6666 12.6665V11.3332M10.3773 22.2705C8.91058 23.1838 5.06259 25.0465 7.40525 27.3785C8.55058 28.5198 9.82658 29.3332 11.4279 29.3332H20.5719C22.1746 29.3332 23.4492 28.5185 24.5946 27.3785C26.9372 25.0465 23.0906 23.1838 21.6226 22.2718C19.9347 21.223 17.9871 20.6672 15.9999 20.6672C14.0127 20.6672 12.0651 21.223 10.3773 22.2718" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        );
    }

    if (step === "batchStart") {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="29" viewBox="0 0 26 29" fill="none" aria-hidden="true">
                <path d="M18.0833 0.75V6.08333M7.41667 0.75V6.08333M24.75 14.0833C24.75 9.05533 24.75 6.54067 23.1873 4.97933C21.6247 3.418 19.1113 3.41667 14.0833 3.41667H11.4167C6.38867 3.41667 3.874 3.41667 2.31267 4.97933C0.751333 6.542 0.75 9.05533 0.75 14.0833V16.75C0.75 21.778 0.75 24.2927 2.31267 25.854C3.87533 27.4153 6.38867 27.4167 11.4167 27.4167M0.75 11.4167H24.75" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21.1062 23.018L19.4168 22.0833V19.7727M24.7502 22.0833C24.7502 23.4978 24.1883 24.8544 23.1881 25.8546C22.1879 26.8548 20.8313 27.4167 19.4168 27.4167C18.0023 27.4167 16.6458 26.8548 15.6456 25.8546C14.6454 24.8544 14.0835 23.4978 14.0835 22.0833C14.0835 20.6688 14.6454 19.3123 15.6456 18.3121C16.6458 17.3119 18.0023 16.75 19.4168 16.75C20.8313 16.75 22.1879 17.3119 23.1881 18.3121C24.1883 19.3123 24.7502 20.6688 24.7502 22.0833Z" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        );
    }

    if (step === "studentType") {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M16 28C15.7756 28.0004 15.5514 27.9857 15.329 27.956C13.2745 24.6626 12.1367 20.8803 12.033 17H29.95C29.974 16.669 30 16.337 30 16C30 13.2311 29.1789 10.5243 27.6406 8.22202C26.1022 5.91973 23.9157 4.12532 21.3576 3.06569C18.7994 2.00607 15.9845 1.72882 13.2687 2.26901C10.553 2.80921 8.05845 4.14258 6.10051 6.10051C4.14258 8.05845 2.80921 10.553 2.26901 13.2687C1.72882 15.9845 2.00607 18.7994 3.06569 21.3576C4.12532 23.9157 5.91973 26.1022 8.22202 27.6406C10.5243 29.1789 13.2311 30 16 30V28ZM27.95 15H21.963C21.8563 11.3202 20.915 7.71274 19.21 4.45001C21.5686 5.10788 23.6697 6.47096 25.2318 8.35657C26.7939 10.2422 27.7424 12.5602 27.95 15ZM16.67 4.04401C18.7248 7.33733 19.863 11.1196 19.967 15H12.033C12.137 11.1196 13.2752 7.33733 15.33 4.04401C15.7755 3.98604 16.2266 3.98604 16.672 4.04401M12.791 4.44901C11.0856 7.71196 10.1438 11.3198 10.037 15H4.05001C4.25764 12.5602 5.20607 10.2422 6.76817 8.35657C8.33028 6.47096 10.4314 5.10788 12.79 4.45001M4.05001 17H10.037C10.1437 20.6798 11.085 24.2873 12.79 27.55C10.4314 26.8921 8.33028 25.5291 6.76817 23.6434C5.20607 21.7578 4.25764 19.4398 4.05001 17Z" fill={fill} fillOpacity={fillOpacity}/>
                <path fillRule="evenodd" clipRule="evenodd" d="M25 25L30 27V25L25 22.5V20C25 19.7348 24.8946 19.4804 24.7071 19.2929C24.5196 19.1054 24.2652 19 24 19C23.7348 19 23.4804 19.1054 23.2929 19.2929C23.1054 19.4804 23 19.7348 23 20V22.5L18 25V27L23 25V28.5L21 30V31L24 30L27 31V30L25 28.5V25Z" fill={fill} fillOpacity={fillOpacity}/>
            </svg>
        );
    }

    if (step === "studentInfo") {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="22" viewBox="0 0 28 22" fill="none" aria-hidden="true">
                <path d="M0.75 5.03533L10.0567 11.2407C11.3407 12.0953 11.982 12.5233 12.6753 12.69C13.2887 12.8367 13.9273 12.8367 14.5393 12.69C15.2327 12.5233 15.874 12.0953 17.158 11.2407L26.4647 5.03533M7.15 20.75H20.0647C22.3047 20.75 23.4247 20.75 24.2807 20.314C25.0328 19.9303 25.6442 19.3184 26.0273 18.566C26.4647 17.71 26.4647 16.59 26.4647 14.35V7.15C26.4647 4.91 26.4647 3.79 26.0287 2.934C25.6452 2.18139 25.0333 1.56949 24.2807 1.186C23.4247 0.75 22.3047 0.75 20.0647 0.75H7.15C4.91 0.75 3.79 0.75 2.934 1.186C2.18188 1.56971 1.57047 2.18159 1.18733 2.934C0.75 3.79 0.75 4.91 0.75 7.15V14.35C0.75 16.59 0.75 17.71 1.186 18.566C1.56949 19.3186 2.18138 19.9305 2.934 20.314C3.79 20.75 4.91 20.75 7.15 20.75Z" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        );
    }

    if (step === "review") {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M22.9918 9.99706C23.0109 9.85854 22.9965 9.71747 22.9498 9.58567L22.9271 9.47538C22.8626 9.20715 22.7563 8.95076 22.612 8.71563C22.4509 8.45304 22.2234 8.22547 21.7682 7.77031L17.2345 3.23455C16.7811 2.7794 16.5535 2.55182 16.2892 2.38902C16.0223 2.22554 15.7282 2.11112 15.421 2.05116C15.2892 2.00449 15.1481 1.99009 15.0096 2.00914C14.8153 2.00389 14.579 2.00389 14.2657 2.00389H10.3971C7.45627 2.00389 5.98586 2.00389 4.86555 2.57633C3.8798 3.08162 3.07767 3.8838 2.57241 4.8696C2 5.99347 2 7.45871 2 10.3997V21.6034C2 24.5444 2 26.0149 2.57241 27.1353C3.07767 28.1211 3.8798 28.9233 4.86555 29.4285C5.98936 30.001 7.45627 30.001 10.3971 30.001H14.6385C15.3405 30.001 15.6923 29.0854 15.2459 28.5445C15.1732 28.454 15.0813 28.3807 14.9769 28.3298C14.8725 28.279 14.7581 28.2519 14.642 28.2504H10.3883C8.88816 28.2504 7.86763 28.2486 7.07991 28.1839C6.3132 28.1208 5.91934 28.0088 5.64626 27.8688C4.98754 27.5331 4.45198 26.9975 4.11634 26.3388C3.9763 26.0657 3.86252 25.6735 3.80125 24.905C3.73823 24.1173 3.73648 23.1019 3.73648 21.5964V10.3927C3.73648 8.89244 3.73648 7.87185 3.80125 7.08408C3.86427 6.31733 3.97805 5.92345 4.11634 5.65036C4.45243 4.99214 4.98808 4.45646 5.64626 4.12035C5.91934 3.9803 6.3132 3.86651 7.08166 3.80524C7.86763 3.74222 8.88291 3.74222 10.3883 3.74222H14.2394V9.86926C14.2394 10.1014 14.3316 10.324 14.4958 10.4882C14.6599 10.6523 14.8825 10.7446 15.1146 10.7446H21.2413V11.7021C21.2413 12.1398 21.6037 12.4899 22.0396 12.5302C22.5385 12.5739 22.9901 12.201 22.9901 11.7004V10.7323C22.9901 10.4207 22.9901 10.1844 22.9813 9.9883L22.9918 9.99706ZM15.9899 4.46521L20.5236 8.99922H15.9899V4.46521Z" fill={fill} fillOpacity={fillOpacity}/>
                <path fillRule="evenodd" clipRule="evenodd" d="M21.1105 28.2257C22.5934 28.2257 23.9732 27.7724 25.1111 26.9972L27.7249 29.6107C27.9748 29.8606 28.3138 30.001 28.6673 30.001C29.0207 30.001 29.3597 29.8606 29.6097 29.6107C29.8596 29.3608 30 29.0218 30 28.6684C30 28.315 29.8596 27.976 29.6097 27.7261L26.9959 25.1127C27.7711 23.973 28.2245 22.6059 28.2245 21.1125C28.2245 17.1834 25.0418 14.001 21.1123 14.001C17.1827 14.001 14 17.1834 14 21.1125C14 25.0415 17.1827 28.2239 21.1123 28.2239L21.1105 28.2257ZM21.1105 26.4478C24.0621 26.4478 26.4447 24.0655 26.4447 21.1142C26.4447 18.163 24.0621 15.7806 21.1105 15.7806C18.1589 15.7806 15.7763 18.163 15.7763 21.1142C15.7763 24.0655 18.1589 26.4478 21.1105 26.4478Z" fill={fill} fillOpacity={fillOpacity}/>
            </svg>
        );
    }

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="29" viewBox="0 0 28 29" fill="none" aria-hidden="true">
            <path d="M1.70833 1.94467L16.2923 6.09C17.2804 6.41474 18.1434 7.03798 18.7624 7.87379C19.3814 8.70961 19.7258 9.71685 19.7483 10.7567V24.77C19.7899 25.2124 19.7231 25.6583 19.5537 26.0691C19.3843 26.4799 19.1174 26.8433 18.776 27.1278C18.4347 27.4123 18.0292 27.6094 17.5946 27.702C17.16 27.7946 16.7093 27.78 16.2817 27.6593L4.21767 24.3793C3.22933 24.0718 2.36275 23.4612 1.7406 22.634C1.11845 21.8068 0.772245 20.8049 0.750999 19.77V4.50067C0.728398 3.53196 1.09016 2.59369 1.75723 1.8909C2.4243 1.1881 3.34243 0.777925 4.311 0.75H22.7483C23.8092 0.75 24.8266 1.17143 25.5768 1.92157C26.3269 2.67172 26.7483 3.68913 26.7483 4.75V16.6873C26.7438 17.2267 26.6328 17.7598 26.4218 18.2561C26.2108 18.7525 25.9039 19.2023 25.5186 19.5797C25.1333 19.9572 24.6774 20.2548 24.1768 20.4557C23.6762 20.6565 23.141 20.7565 22.6017 20.75H19.7483" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14.2485 16.75C14.1159 16.75 13.9887 16.6973 13.895 16.6036C13.8012 16.5098 13.7485 16.3826 13.7485 16.25C13.7485 16.1174 13.8012 15.9902 13.895 15.8964C13.9887 15.8027 14.1159 15.75 14.2485 15.75M14.2485 16.75C14.3811 16.75 14.5083 16.6973 14.6021 16.6036C14.6959 16.5098 14.7485 16.3826 14.7485 16.25C14.7485 16.1174 14.6959 15.9902 14.6021 15.8964C14.5083 15.8027 14.3811 15.75 14.2485 15.75" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth="1.5"/>
            <path d="M26.7485 10.75H19.7485" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function FormCard({ children }: { children: React.ReactNode }) {
    return (
        <div
            className={cn(
                "mx-auto  max-w-[668px] border border-[#33333326] bg-[#fafafa] p-6 md:p-7"
            )}
        >
            {children}
        </div>
    );
}

function FieldLabel({
    children,
    className,
    sizeClass = "text-[18px]",
    weightClass = "font-semibold",
    spacingClass = "mb-1",
}: {
    children: React.ReactNode;
    className?: string;
    sizeClass?: string;
    weightClass?: string;
    spacingClass?: string;
}) {
    return <label className={cn("block text-[#333333]", spacingClass, sizeClass, weightClass, className)}>{children}</label>;
}

function RadioOption({
    checked,
    title,
    description,
    onClick,
}: {
    checked: boolean;
    title: string;
    description?: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full cursor-pointer items-center gap-4 rounded-[4px] border px-4 py-3 text-left transition-colors duration-200",
                checked ? "border-[#1E73BE]" : "border-[#BEBEBE]"
            )}
        >
            <span
                className={cn(
                    "mt-[4px] flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border",
                    checked ? "border-[#2F79BE]" : "border-[#B7B7B7]"
                )}
            >
                {checked ? <span className="h-[8px] w-[8px] rounded-full bg-[#2F79BE]" /> : null}
            </span>
            <span>
                <span className="block text-[18px] font-medium text-[#333333]">{title}</span>
                {description ? <span className="mt-1 block text-[18px] leading-[1.35] text-[#33333380]">{description}</span> : null}
            </span>
        </button>
    );
}

function ActionRow({
    backLabel,
    nextLabel,
    onBack,
    onNext,
    errorMessage,
}: {
    backLabel: string;
    nextLabel: string;
    onBack: () => void;
    onNext: () => void;
    errorMessage?: string;
}) {
    return (
        <div className="mt-15">
            <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
                <button
                    type="button"
                    onClick={onBack}
                    className="min-w-[155px] min-h-[40px] cursor-pointer rounded-[5px] border border-[#D1D1D1] bg-white px-5 py-[5px] text-[18px] font-medium text-[#3B3B3B] transition-opacity duration-200 hover:opacity-80"
                >
                    {backLabel}
                </button>
                <Button type="button" onClick={onNext} className="min-w-[155px] min-h-[40px] px-5 py-[5px] text-[14px]">
                    {nextLabel}
                </Button>
            </div>
            {errorMessage ? (
                <p className="mt-4 text-sm font-medium text-[#B92A2A]">{errorMessage}</p>
            ) : null}
        </div>
    );
}

export default function ApplyPageContent({
    initialApplicationStatus = "not_started",
    programOptions = defaultProgramOptions,
    initialSessionUser = null,
    initialGovernmentBenefit: _initialGovernmentBenefit = {
        isGovernmentEmployee: false,
        governmentEmployeeGroup: null,
        governmentEmployeeId: null,
        governmentVerificationStatus: "not_submitted",
        governmentDiscountPercent: 0,
    },
}: ApplyPageContentProps) {
    const { t } = useTranslations();
    void _initialGovernmentBenefit;
    const format = (key: string, vars?: Record<string, string | number>) => {
        const text = t(key);
        if (!vars) return text;
        return Object.entries(vars).reduce(
            (value, [varName, replacement]) => value.replace(`{${varName}}`, String(replacement)),
            text
        );
    };
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const userNameParts = useMemo(
        () => splitFullName(initialSessionUser?.fullName || ""),
        [initialSessionUser?.fullName]
    );
    const hasSessionEmail = Boolean(initialSessionUser?.email?.trim());
    const welcomeName = userNameParts.firstName || t("apply.studentFallback");
    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>(initialApplicationStatus);
    const [currentStep, setCurrentStep] = useState<StepId>(
        initialApplicationStatus === "under_review" ? "submitted" : "dashboard"
    );
    const [form, setForm] = useState<ApplicationForm>(() => ({
        ...initialForm,
        firstName: userNameParts.firstName,
        lastName: userNameParts.lastName,
        email: initialSessionUser?.email?.trim() || "",
    }));
    const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [validationError, setValidationError] = useState("");
    const [submissionSummary, setSubmissionSummary] = useState<SubmissionSummary | null>(null);

    useEffect(() => {
        setValidationError("");
    }, [currentStep]);

    const flowSteps = fullApplicationSteps;

    const currentStepIndex = useMemo(
        () => flowSteps.indexOf(currentStep as Exclude<StepId, "dashboard" | "submitted">),
        [currentStep, flowSteps]
    );
    const availableProgramOptions = useMemo(() => {
        const uniqueOptions = Array.from(
            new Set(
                programOptions
                    .map((option) => option.trim())
                    .filter((option) => option.length > 0)
            )
        );
        return uniqueOptions.length > 0 ? uniqueOptions : defaultProgramOptions;
    }, [programOptions]);

    const intakeCommaList = useMemo(
        () => batchStartOptions.map((option) => t(option.labelKey)).join(", "),
        [t]
    );

    const intakeBulletList = useMemo(
        () => batchStartOptions.map((option) => t(option.labelKey)).join(" • "),
        [t]
    );

    const getBatchStartLabel = (value: string) => {
        const matched = batchStartOptions.find((option) => option.value === value);
        return matched ? t(matched.labelKey) : value;
    };

    const getHighestEducationLabel = (value: string) => {
        const matched = highestEducationOptions.find((option) => option.value === value);
        return matched ? t(matched.labelKey) : value;
    };

    const getInterestLevelLabel = (value: string) => {
        const matched = interestLevelOptions.find((option) => option.value === value);
        return matched ? t(matched.labelKey) : value;
    };

    const updateForm = <K extends keyof ApplicationForm,>(key: K, value: ApplicationForm[K]) => {
        setValidationError("");
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const buildApplicationPayload = () => ({
        program: form.program.trim(),
        batchStart: form.batchStart.trim(),
        studentType: form.studentType,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: (initialSessionUser?.email?.trim() || form.email.trim()).toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        highestEducation: form.highestEducation.trim(),
        interestLevel: form.interestLevel.trim(),
        interestArea: form.interestArea.trim(),
    });

    const getStepValidationError = (): string | null => {
        if (currentStep === "program" && !form.program.trim()) {
            return t("apply.validation.selectProgram");
        }

        if (currentStep === "batchStart" && !form.batchStart.trim()) {
            return t("apply.validation.selectIntakeBatch");
        }

        if (currentStep === "studentInfo") {
            if (!form.firstName.trim()) {
                return t("apply.validation.firstNameRequired");
            }

            if (!form.lastName.trim()) {
                return t("apply.validation.lastNameRequired");
            }

            const email = form.email.trim();
            const phone = form.phoneNumber.trim();

            if (!email) {
                return t("apply.validation.emailRequired");
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return t("apply.invalidEmail");
            }

            if (!phone) {
                return t("apply.validation.phoneRequired");
            }

            if (!form.highestEducation.trim()) {
                return t("apply.validation.highestEducationRequired");
            }

            if (!form.interestLevel.trim()) {
                return t("apply.validation.interestLevelRequired");
            }

            if (!form.interestArea.trim()) {
                return t("apply.validation.interestAreaRequired");
            }
        }

        return null;
    };

    const submitApplication = async () => {
        if (isSubmittingApplication) {
            return;
        }

        setSubmitError("");
        setIsSubmittingApplication(true);
        try {
            const application = buildApplicationPayload();
            const response = await fetch("/api/apply/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...application,
                }),
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok || !payload?.ok) {
                setSubmitError(payload?.error || t("apply.errors.submitFailed"));
                return;
            }
            setApplicationStatus("under_review");
            setSubmissionSummary({
                confirmationEmail: application.email,
                instructionProgram: application.program,
                instructionChecklist: getInstructionChecklistForProgram(application.program),
            });
            setCurrentStep("submitted");
        } catch {
            setSubmitError(t("apply.errors.submitFailed"));
        } finally {
            setIsSubmittingApplication(false);
        }
    };

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } catch {
            // Clear client navigation even if request fails.
        } finally {
            setIsLoggingOut(false);
            router.push("/apply?auth=login&redirect=/apply");
            router.refresh();
        }
    };

    const goToNextStep = async () => {
        const stepError = getStepValidationError();
        if (stepError) {
            setValidationError(stepError);
            return;
        }

        setValidationError("");

        if (currentStep === "dashboard") {
            if (applicationStatus === "under_review") {
                setCurrentStep("submitted");
                return;
            }
            setCurrentStep("program");
            return;
        }

        if (currentStep === "review") {
            await submitApplication();
            return;
        }

        const nextStep = flowSteps[currentStepIndex + 1];
        if (nextStep) {
            setCurrentStep(nextStep);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep === "program") {
            setCurrentStep("dashboard");
            return;
        }

        if (currentStep === "submitted") {
            setCurrentStep("dashboard");
            return;
        }

        const previousStep = flowSteps[currentStepIndex - 1];
        if (previousStep) {
            setCurrentStep(previousStep);
        }
    };

    const renderDashboard = () => (
        <div className="mx-auto max-w-[1130px]">
            <div className="rounded-[8px] border border-[#EEEEEE] bg-white p-5 md:p-5">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h2 className="text-[32px] font-semibold leading-none text-[#2F2F2F]" style={{ fontFamily: '"EB Garamond", serif' }}>
                            {format("apply.dashboard.greeting", { name: welcomeName })}
                        </h2>
                    </div>
                    <Button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="min-w-[84px] self-start px-4 py-[10px] text-[14px]"
                    >
                        {isLoggingOut ? t("apply.dashboard.loggingOut") : t("apply.dashboard.logout")}
                    </Button>
                </div>

                <div className="mt-11 grid gap-6 text-[#2F2F2F] md:grid-cols-3">
                    <div>
                        <p className="text-[20px] font-semibold">{t("apply.dashboard.emailLabel")}</p>
                        <p className="mt-1 text-[18px]">{initialSessionUser?.email || form.email || "--"}</p>
                    </div>
                    <div>
                        <p className="text-[20px] font-semibold">{t("apply.dashboard.phoneLabel")}</p>
                        <p className="mt-1 text-[18px] text-[#9C9C9C]">{form.phoneNumber || "--"}</p>
                    </div>
                    <div>
                        <p className="text-[20px] font-semibold">{t("apply.dashboard.userSinceLabel")}</p>
                        <p className="mt-1 text-[18px] text-[#9C9C9C]">{t("apply.dashboard.userSinceValue")}</p>
                    </div>
                </div>
            </div>

            <div className="mt-10 rounded-[8px] bg-[#2F79BE] px-8 py-8 text-white md:px-15">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-[40px] font-semibold leading-[0.95]" style={{ fontFamily: '"EB Garamond", serif' }}>
                            {t("apply.dashboard.admissionsOpen")}
                        </p>
                        <p className="mt-2 text-[55px] font-semibold leading-[0.95]">{intakeCommaList}</p>
                    </div>

                    <div className="rounded-[6px] bg-white px-4 py-2 text-[#2F2F2F]">
                        <div className="grid grid-cols-1 gap-2">
                            <div>
                                <p className="text-[13px] font-medium text-[#33333380]">{t("apply.dashboard.availableBatchesLabel")}</p>
                                <p className="text-[15px] font-semibold">{intakeBulletList}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={goToNextStep}
                        className="flex min-h-[52px] min-w-[180px] cursor-pointer items-center justify-center gap-2 rounded-[4px] bg-white px-8 transition-opacity duration-200 hover:opacity-80"
                    >
                        <span className="text-[18px] font-medium text-[#1E73BE]">{t("apply.dashboard.applyNow")}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M10 1L19 10M19 10L10 19M19 10L1 10" stroke="#1E73BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderProgramStep = () => (
        <FormCard>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                {t("apply.program.heading")}
            </h2>

            <div className="mt-5">
                <FieldLabel sizeClass="text-[14px]">{t("apply.program.selectLabel")}</FieldLabel>
                <Select
                    value={form.program}
                    onChange={(event) => updateForm("program", event.target.value)}
                    className="h-[40px] rounded-[3px] border-[#A7A7A7] px-3 text-[14px] text-[#8E8E8E]"
                >
                    <option value="">{t("apply.program.selectPlaceholder")}</option>
                    {availableProgramOptions.map((programOption) => (
                        <option key={programOption} value={programOption}>
                            {programOption}
                        </option>
                    ))}
                </Select>
            </div>

            <ActionRow
                backLabel={t("apply.backToPortal")}
                nextLabel={t("apply.saveAndNext")}
                onBack={goToPreviousStep}
                onNext={goToNextStep}
                errorMessage={validationError}
            />
        </FormCard>
    );

    const renderBatchStartStep = () => (
        <FormCard>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                {t("apply.batchStart.heading")}
            </h2>

            <div className="mt-7">
                <FieldLabel spacingClass="mb-5">{t("apply.batchStart.question")}</FieldLabel>
                <div className="space-y-4">
                    {batchStartOptions.map((batchStartOption) => (
                        <RadioOption
                            key={batchStartOption.value}
                            checked={form.batchStart === batchStartOption.value}
                            title={t(batchStartOption.labelKey)}
                            onClick={() => updateForm("batchStart", batchStartOption.value)}
                        />
                    ))}
                </div>
            </div>

            <ActionRow
                backLabel={t("apply.back")}
                nextLabel={t("apply.saveAndNext")}
                onBack={goToPreviousStep}
                onNext={goToNextStep}
                errorMessage={validationError}
            />
        </FormCard>
    );

    const renderStudentTypeStep = () => (
        <FormCard>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                {t("apply.studentType.heading")}
            </h2>

            <div className="mt-6">
                <FieldLabel spacingClass="mb-5">{t("apply.studentType.question")}</FieldLabel>
                <div className="space-y-4">
                    <RadioOption
                        checked={form.studentType === "national"}
                        title={t("apply.studentType.localTitle")}
                        description={t("apply.studentType.localDescription")}
                        onClick={() => updateForm("studentType", "national")}
                    />
                    <RadioOption
                        checked={form.studentType === "international"}
                        title={t("apply.studentType.internationalTitle")}
                        description={t("apply.studentType.internationalDescription")}
                        onClick={() => updateForm("studentType", "international")}
                    />
                </div>
            </div>

            <ActionRow
                backLabel={t("apply.back")}
                nextLabel={t("apply.saveAndNext")}
                onBack={goToPreviousStep}
                onNext={goToNextStep}
                errorMessage={validationError}
            />
        </FormCard>
    );

    const renderStudentInfoStep = () => (
        <FormCard>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                {t("apply.studentInfo.heading")}
            </h2>

            <div className="mt-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <Input
                        labelText={t("apply.firstName")}
                        type="text"
                        value={form.firstName}
                        onChange={(event) => updateForm("firstName", event.target.value)}
                        placeholder={t("apply.placeholders.firstName")}
                        className="h-[40px] rounded-[3px] border-[#A7A7A7] text-[14px] text-[#8E8E8E]"
                    />
                    <Input
                        labelText={t("apply.lastName")}
                        type="text"
                        value={form.lastName}
                        onChange={(event) => updateForm("lastName", event.target.value)}
                        placeholder={t("apply.placeholders.lastName")}
                        className="h-[40px] rounded-[3px] border-[#A7A7A7] text-[14px] text-[#8E8E8E]"
                    />
                </div>

                <div className="mt-4">
                    <Input
                        labelText={t("apply.email")}
                        type="email"
                        value={form.email}
                        onChange={(event) => updateForm("email", event.target.value)}
                        readOnly={hasSessionEmail}
                        placeholder={t("apply.placeholders.email")}
                        className={cn(
                            "h-[40px] rounded-[3px] border-[#A7A7A7] text-[14px] text-[#8E8E8E]",
                            hasSessionEmail ? "bg-[#F2F5FA] text-[#5F5F5F]" : ""
                        )}
                    />
                    {hasSessionEmail ? (
                        <p className="mt-2 text-[13px] text-[#1E73BE]">
                            {t("apply.emailSyncedNotice")}
                        </p>
                    ) : null}
                </div>

                <div className="mt-4">
                    <Input
                        labelText={t("apply.cellPhone")}
                        type="text"
                        value={form.phoneNumber}
                        onChange={(event) => updateForm("phoneNumber", event.target.value)}
                        prependText="📞"
                        placeholder={t("apply.placeholders.phone")}
                        className="h-[40px] rounded-[3px] border-[#A7A7A7] text-[14px] text-[#8E8E8E]"
                    />
                </div>

                <div className="mt-4">
                    <FieldLabel sizeClass="text-[14px]" weightClass="font-medium">{t("apply.highestEducationLabel")}</FieldLabel>
                    <Select
                        value={form.highestEducation}
                        onChange={(event) => updateForm("highestEducation", event.target.value)}
                        className="h-[40px] rounded-[3px] border-[#A7A7A7] px-3 text-[14px] text-[#6F6F6F]"
                    >
                        <option value="">{t("apply.highestEducationPlaceholder")}</option>
                        {highestEducationOptions.map((educationOption) => (
                            <option key={educationOption.value} value={educationOption.value}>
                                {t(educationOption.labelKey)}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="mt-4">
                    <FieldLabel sizeClass="text-[14px]" weightClass="font-medium">{t("apply.interestLevelLabel")}</FieldLabel>
                    <Select
                        value={form.interestLevel}
                        onChange={(event) => updateForm("interestLevel", event.target.value)}
                        className="h-[40px] rounded-[3px] border-[#A7A7A7] px-3 text-[14px] text-[#6F6F6F]"
                    >
                        <option value="">{t("apply.interestLevelPlaceholder")}</option>
                        {interestLevelOptions.map((interestLevelOption) => (
                            <option key={interestLevelOption.value} value={interestLevelOption.value}>
                                {t(interestLevelOption.labelKey)}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="mt-4">
                    <Input
                        labelText={t("apply.interestAreaLabel")}
                        type="text"
                        value={form.interestArea}
                        onChange={(event) => updateForm("interestArea", event.target.value)}
                        placeholder={t("apply.placeholders.interestArea")}
                        className="h-[40px] rounded-[3px] border-[#A7A7A7] text-[14px] text-[#8E8E8E]"
                    />
                </div>
            </div>

            <ActionRow
                backLabel={t("apply.back")}
                nextLabel={t("apply.saveAndNext")}
                onBack={goToPreviousStep}
                onNext={goToNextStep}
                errorMessage={validationError}
            />
        </FormCard>
    );

    const renderReviewStep = () => (
        <FormCard>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                {t("apply.review.heading")}
            </h2>
            <p className="mt-5 text-[18px] font-medium text-[#333333]">
                {t("apply.review.description")}
            </p>

            <div className="mt-4 overflow-hidden rounded-[4px] border border-[#33333340]">
                {[
                    ["apply.review.fields.program", form.program || availableProgramOptions[0] || t("apply.notAvailable")],
                    ["apply.review.fields.batchStart", getBatchStartLabel(form.batchStart)],
                    [
                        "apply.review.fields.studentType",
                        form.studentType === "international"
                            ? t("apply.studentType.internationalShort")
                            : t("apply.studentType.localShort"),
                    ],
                    ["apply.review.fields.firstName", form.firstName || t("apply.notAvailable")],
                    ["apply.review.fields.lastName", form.lastName || t("apply.notAvailable")],
                    ["apply.review.fields.email", form.email || t("apply.notAvailable")],
                    ["apply.review.fields.phone", form.phoneNumber || t("apply.notAvailable")],
                    [
                        "apply.review.fields.highestEducation",
                        form.highestEducation ? getHighestEducationLabel(form.highestEducation) : t("apply.notAvailable"),
                    ],
                    [
                        "apply.review.fields.interestLevel",
                        form.interestLevel ? getInterestLevelLabel(form.interestLevel) : t("apply.notAvailable"),
                    ],
                    ["apply.review.fields.interestArea", form.interestArea || t("apply.notAvailable")],
                ].map(([label, value]) => (
                    <div
                        key={label}
                        className={cn(
                            "grid grid-cols-[1fr_auto] gap-4 border-b border-[#33333340] px-4 py-4 last:border-b-0",
                            (label === "apply.review.fields.batchStart" ||
                                label === "apply.review.fields.email" ||
                                label === "apply.review.fields.highestEducation" ||
                                label === "apply.review.fields.interestArea")
                                ? "bg-[#FAFAFA]"
                                : "bg-[#FFFFFF]"
                        )}
                    >
                        <p className="text-[18px] font-medium text-[#333333]">{t(label)}</p>
                        <p className="text-[18px] text-[#33333380]">{value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-15 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
                <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="min-w-[155px] min-h-[40px] cursor-pointer rounded-[5px] border border-[#D1D1D1] bg-white px-5 py-[5px] text-[18px] font-medium text-[#3B3B3B] transition-opacity duration-200 hover:opacity-80"
                >
                    {t("apply.back")}
                </button>
                <Button type="button" onClick={goToNextStep} className="min-w-[128px] px-5 py-[11px] text-[14px]">
                    {t("apply.submit")}
                </Button>
            </div>
            {validationError ? (
                <p className="mt-4 text-sm font-medium text-[#B92A2A]">{validationError}</p>
            ) : null}
            {!validationError && submitError ? (
                <p className="mt-4 text-sm font-medium text-[#B92A2A]">{submitError}</p>
            ) : null}
        </FormCard>
    );

    const renderSubmittedStep = () => (
        <div className="mx-auto mt-8 max-w-[640px]">
            <div className="rounded-[8px] border border-[#D8D8D8] bg-white p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-[24px] text-[#text-[22px] text-[#333333] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                        {t("apply.submitted.title")}
                    </h2>
                    <span className="inline-flex rounded-full border border-[#1E73BE] bg-[#287DC826] px-4 py-[6px] text-[16px] font-medium text-[#1E73BE]">
                        {t("apply.submitted.statusUnderReview")}
                    </span>
                </div>

                <div className="mt-8 space-y-0">
                    {[
                        {
                            title: t("apply.submitted.timeline.feeSubmitted.title"),
                            // description: t("apply.submitted.timeline.feeSubmitted.description"),
                            meta: format("apply.submitted.timeline.feeSubmitted.meta", {
                                email: submissionSummary?.confirmationEmail ?? form.email,
                            }),
                            active: true,
                        },
                        {
                            title: t("apply.submitted.timeline.underReview.title"),
                            description: format("apply.submitted.timeline.underReview.description", {
                                program: submissionSummary?.instructionProgram ?? form.program,
                            }),
                            meta: t("apply.submitted.timeline.underReview.meta"),
                            active: true,
                        },
                        {
                            title: t("apply.submitted.timeline.documentVerification.title"),
                            description: t("apply.submitted.timeline.documentVerification.description"),
                        },
                        {
                            title: t("apply.submitted.timeline.admissionDecision.title"),
                            description: t("apply.submitted.timeline.admissionDecision.description"),
                        },
                    ].map((item, index) => (
                        <div key={item.title} className="grid grid-cols-[44px_1fr] gap-5 pb-10 last:pb-0 md:grid-cols-[64px_1fr]">
                            <div className="relative flex justify-center items-center">
                                {index < 3 ? <div className="absolute left-1/2 top-[40px] h-[calc(100%+40px)] w-px -translate-x-1/2 bg-[#E2E2E2] md:top-[60px]" /> : null}
                                <div
                                    className={cn(
                                        "relative z-10 flex h-[40px] w-[40px] items-center justify-center rounded-full md:h-[60px] md:w-[60px]",
                                        item.active ? "bg-[#2F79BE] text-white" : "bg-[#E3E3E3] text-[#BEBEBE]"
                                    )}
                                >
                                    {item.active ? <Check className="h-10 w-10" /> : null}
                                </div>
                            </div>
                            <div className="pt-[4px]">
                                <h4 className="text-[18px] font-medium text-[#333333]">{item.title}</h4>
                                <p className="mt-1 max-w-[620px] text-[16px] leading-[1.35] text-[#33333380]">{item.description}</p>
                                {"meta" in item && item.meta ? (
                                    <p className="mt-1 text-[16px] font-medium text-[#FAAE14]">{item.meta}</p>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 rounded-[8px] border border-[#DADADA] bg-white px-6 py-5">
                <p className="text-[18px] font-semibold text-[#333333]">{t("apply.submitted.checklistTitle")}</p>
                <ul className="mt-3 space-y-2 text-[16px] text-[#33333380]">
                    {(submissionSummary?.instructionChecklist ?? getInstructionChecklistForProgram(form.program)).map((item) => (
                        <li key={item} className="flex gap-2">
                            <span className="text-[#1E73BE]">•</span>
                            <span>{item.startsWith("apply.checklist.") ? t(item) : item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-6 rounded-[8px] border border-[#DADADA] bg-white px-6 py-5 text-center text-[16px] text-[#33333380]">
                <span className="inline-block max-w-[528px]">
                    {t("apply.submitted.summaryNotice")}
                </span>
            </div>

            {/* <div className="mt-6 flex justify-center">
                <button
                    type="button"
                    onClick={() => router.push("/portal")}
                    className="h-[40px] w-[155px] cursor-pointer rounded-[5px] border border-[#33333340] bg-white px-5 py-0 text-[18px] font-medium leading-none text-[#333333] transition-opacity duration-200 hover:opacity-80"
                >
                    {t("apply.backToPortal")}
                </button>
            </div> */}
        </div>
    );

    return (
        <main className="min-h-screen bg-[#F2F5FA] px-3 pb-[50px] pt-[50px] md:px-6 ">
            {currentStep === "dashboard" ? (
                renderDashboard()
            ) : (
                <div className="mx-auto max-w-[1000px]">
                    <SectionHeading
                        title={t("apply.pageHeading.title")}
                        description={t("apply.pageHeading.description")}
                    />
                    {currentStep !== "submitted" ? (
                        <Stepper
                            activeStep={currentStep as Exclude<StepId, "dashboard" | "submitted">}
                            steps={flowSteps}
                        />
                    ) : (
                        <Stepper
                            activeStep="review"
                            steps={flowSteps}
                            allCompleted
                        />
                    )}
                    {currentStep === "program" && renderProgramStep()}
                    {currentStep === "batchStart" && renderBatchStartStep()}
                    {currentStep === "studentType" && renderStudentTypeStep()}
                    {currentStep === "studentInfo" && renderStudentInfoStep()}
                    {currentStep === "review" && renderReviewStep()}
                    {currentStep === "submitted" && renderSubmittedStep()}
                </div>
            )}
        </main>
    );
}
