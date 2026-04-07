'use client';

import { useMemo, useRef, useState } from "react";
import {
    Check,
    FileSearch,
    FileText,
    Upload,
} from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { cn } from "@/lib/utils";

type StepId =
    | "dashboard"
    | "program"
    | "term"
    | "studentType"
    | "contactInfo"
    | "transcript"
    | "review"
    | "fees"
    | "submitted";

type PaymentMethod = "card" | "bank" | "mobile" | "";
type StudentType = "national" | "international";

type ApplicationForm = {
    program: string;
    term: string;
    studentType: StudentType;
    email: string;
    phoneCode: string;
    phoneNumber: string;
    transcriptFileName: string;
    paymentMethod: PaymentMethod;
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
};

const applicationSteps: Exclude<StepId, "dashboard" | "submitted">[] = [
    "program",
    "term",
    "studentType",
    "contactInfo",
    "transcript",
    "review",
    "fees",
];

const stepMeta = {
    program: { label: "Program" },
    term: { label: "Term" },
    studentType: { label: "Student Type" },
    contactInfo: { label: "Contact Info" },
    transcript: { label: "Transcript" },
    review: { label: "Review" },
    fees: { label: "Application Fees" },
} as const;

const termOptions = ["September 2026", "January 2027", "September 2027", "January 2028"];

const initialForm: ApplicationForm = {
    program: "",
    term: "September 2026",
    studentType: "national",
    email: "",
    phoneCode: "CM +237",
    phoneNumber: "",
    transcriptFileName: "",
    paymentMethod: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
};

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
    allCompleted = false,
}: {
    activeStep: Exclude<StepId, "dashboard" | "submitted">;
    allCompleted?: boolean;
}) {
    const activeIndex = applicationSteps.indexOf(activeStep);

    return (
        <div className="overflow-x-auto">
            <div className="mx-auto my-8 flex min-w-max items-start justify-center px-4 md:my-13">
                {applicationSteps.map((step, index) => {
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
                                    {step === "fees" ? (
                                        <>
                                            Application
                                            <br />
                                            Fees
                                        </>
                                    ) : (
                                        stepMeta[step].label
                                    )}
                                </p>
                            </div>
                            {index < applicationSteps.length - 1 ? (
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

    if (step === "term") {
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

    if (step === "contactInfo") {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="22" viewBox="0 0 28 22" fill="none" aria-hidden="true">
                <path d="M0.75 5.03533L10.0567 11.2407C11.3407 12.0953 11.982 12.5233 12.6753 12.69C13.2887 12.8367 13.9273 12.8367 14.5393 12.69C15.2327 12.5233 15.874 12.0953 17.158 11.2407L26.4647 5.03533M7.15 20.75H20.0647C22.3047 20.75 23.4247 20.75 24.2807 20.314C25.0328 19.9303 25.6442 19.3184 26.0273 18.566C26.4647 17.71 26.4647 16.59 26.4647 14.35V7.15C26.4647 4.91 26.4647 3.79 26.0287 2.934C25.6452 2.18139 25.0333 1.56949 24.2807 1.186C23.4247 0.75 22.3047 0.75 20.0647 0.75H7.15C4.91 0.75 3.79 0.75 2.934 1.186C2.18188 1.56971 1.57047 2.18159 1.18733 2.934C0.75 3.79 0.75 4.91 0.75 7.15V14.35C0.75 16.59 0.75 17.71 1.186 18.566C1.56949 19.3186 2.18138 19.9305 2.934 20.314C3.79 20.75 4.91 20.75 7.15 20.75Z" stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        );
    }

    if (step === "transcript") {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="29" viewBox="0 0 23 29" fill="none" aria-hidden="true">
                <path d="M5.5998 17.6C5.38763 17.6 5.18415 17.5157 5.03412 17.3657C4.88409 17.2157 4.7998 17.0122 4.7998 16.8C4.7998 16.5878 4.88409 16.3843 5.03412 16.2343C5.18415 16.0843 5.38763 16 5.5998 16H16.7998C17.012 16 17.2155 16.0843 17.3655 16.2343C17.5155 16.3843 17.5998 16.5878 17.5998 16.8C17.5998 17.0122 17.5155 17.2157 17.3655 17.3657C17.2155 17.5157 17.012 17.6 16.7998 17.6H5.5998ZM5.5998 22.4C5.38763 22.4 5.18415 22.3157 5.03412 22.1657C4.88409 22.0157 4.7998 21.8122 4.7998 21.6C4.7998 21.3878 4.88409 21.1843 5.03412 21.0343C5.18415 20.8843 5.38763 20.8 5.5998 20.8H16.7998C17.012 20.8 17.2155 20.8843 17.3655 21.0343C17.5155 21.1843 17.5998 21.3878 17.5998 21.6C17.5998 21.8122 17.5155 22.0157 17.3655 22.1657C17.2155 22.3157 17.012 22.4 16.7998 22.4H5.5998Z" fill={fill} fillOpacity={fillOpacity}/>
                <path fillRule="evenodd" clipRule="evenodd" d="M13.096 2.23587e-07H2.4C1.76348 2.23587e-07 1.15303 0.252857 0.702944 0.702944C0.252856 1.15303 0 1.76348 0 2.4V26.4C0 27.0365 0.252856 27.647 0.702944 28.0971C1.15303 28.5471 1.76348 28.8 2.4 28.8H20C20.6365 28.8 21.247 28.5471 21.6971 28.0971C22.1471 27.647 22.4 27.0365 22.4 26.4V9.9232C22.3998 9.32235 22.1743 8.74342 21.768 8.3008L14.8656 0.7776C14.6407 0.532393 14.3672 0.336641 14.0625 0.202775C13.7579 0.06891 13.4288 -0.000143402 13.096 2.23587e-07ZM1.6 2.4C1.6 2.18783 1.68429 1.98434 1.83431 1.83431C1.98434 1.68429 2.18783 1.6 2.4 1.6H13.096C13.207 1.59988 13.3168 1.62286 13.4185 1.66748C13.5201 1.71211 13.6114 1.7774 13.6864 1.8592L20.5888 9.3824C20.7244 9.52986 20.7998 9.72285 20.8 9.9232V26.4C20.8 26.6122 20.7157 26.8157 20.5657 26.9657C20.4157 27.1157 20.2122 27.2 20 27.2H2.4C2.18783 27.2 1.98434 27.1157 1.83431 26.9657C1.68429 26.8157 1.6 26.6122 1.6 26.4V2.4Z" fill={fill} fillOpacity={fillOpacity}/>
                <path d="M12.8002 9.6H21.6002C21.8124 9.6 22.0159 9.68429 22.1659 9.83432C22.3159 9.98434 22.4002 10.1878 22.4002 10.4C22.4002 10.6122 22.3159 10.8157 22.1659 10.9657C22.0159 11.1157 21.8124 11.2 21.6002 11.2H12.0002C11.788 11.2 11.5845 11.1157 11.4345 10.9657C11.2845 10.8157 11.2002 10.6122 11.2002 10.4V0.8C11.2002 0.587827 11.2845 0.384344 11.4345 0.234315C11.5845 0.0842854 11.788 0 12.0002 0C12.2124 0 12.4159 0.0842854 12.5659 0.234315C12.7159 0.384344 12.8002 0.587827 12.8002 0.8V9.6Z" fill={fill} fillOpacity={fillOpacity}/>
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

function FormCard({ children, active }: { children: React.ReactNode; active?: boolean }) {
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
}: {
    backLabel: string;
    nextLabel: string;
    onBack: () => void;
    onNext: () => void;
}) {
    return (
        <div className="mt-15 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
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
    );
}

export default function ApplyPageContent() {
    const [currentStep, setCurrentStep] = useState<StepId>("dashboard");
    const [form, setForm] = useState<ApplicationForm>(initialForm);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentStepIndex = useMemo(
        () => applicationSteps.indexOf(currentStep as Exclude<StepId, "dashboard" | "submitted">),
        [currentStep]
    );

    const updateForm = <K extends keyof ApplicationForm,>(key: K, value: ApplicationForm[K]) => {
        setForm((current) => ({
            ...current,
            [key]: value,
        }));
    };

    const goToNextStep = () => {
        if (currentStep === "dashboard") {
            setCurrentStep("program");
            return;
        }

        if (currentStep === "fees") {
            setCurrentStep("submitted");
            return;
        }

        const nextStep = applicationSteps[currentStepIndex + 1];
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

        const previousStep = applicationSteps[currentStepIndex - 1];
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
                            Hi Welcome Username
                        </h2>
                    </div>
                    <Button type="button" className="min-w-[84px] self-start px-4 py-[10px] text-[14px]">
                        Log Out
                    </Button>
                </div>

                <div className="mt-11 grid gap-6 text-[#2F2F2F] md:grid-cols-3">
                    <div>
                        <p className="text-[20px] font-semibold">Email</p>
                        <p className="mt-1 text-[18px]">Username@gmail.com</p>
                    </div>
                    <div>
                        <p className="text-[20px] font-semibold">Phone Number</p>
                        <p className="mt-1 text-[18px] text-[#9C9C9C]">--</p>
                    </div>
                    <div>
                        <p className="text-[20px] font-semibold">User Since</p>
                        <p className="mt-1 text-[18px] text-[#9C9C9C]">--</p>
                    </div>
                </div>
            </div>

            <div className="mt-10 rounded-[8px] bg-[#2F79BE] px-8 py-8 text-white md:px-15">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-[40px] font-semibold leading-[0.95]" style={{ fontFamily: '"EB Garamond", serif' }}>
                            Admissions Open
                        </p>
                        <p className="mt-2 text-[55px] font-semibold leading-[0.95]">Fall 2026</p>
                    </div>

                    <div className="rounded-[6px] bg-white px-4 py-2 text-[#2F2F2F]">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[13px] font-medium text-[#33333380]">Early Decision</p>
                                <p className="text-[15px] font-semibold">August 1, 2026</p>
                            </div>
                            <div>
                                <p className="text-[13px] font-medium text-[#33333380]">Regular</p>
                                <p className="text-[15px] font-semibold">November 15, 2026</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={goToNextStep}
                        className="flex min-h-[52px] min-w-[154px] cursor-pointer items-center justify-center gap-2 rounded-[4px] bg-white px-8 transition-opacity duration-200 hover:opacity-80"
                    >
                        <span className="text-[18px] font-medium text-[#1E73BE]">Apply Now</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M10 1L19 10M19 10L10 19M19 10L1 10" stroke="#1E73BE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderProgramStep = () => (
        <FormCard active>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                Program
            </h2>

            <div className="mt-5">
                <FieldLabel sizeClass="text-[14px]">Select a Program</FieldLabel>
                <Select
                    value={form.program}
                    onChange={(event) => updateForm("program", event.target.value)}
                    className="h-[40px] rounded-[3px] border-[#A7A7A7] px-3 text-[14px] text-[#8E8E8E]"
                >
                    <option value="">Choose your Program</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Public Health">Public Health</option>
                </Select>
            </div>

            <ActionRow backLabel="Back to Portal" nextLabel="Save and Next" onBack={goToPreviousStep} onNext={goToNextStep} />
        </FormCard>
    );

    const renderTermStep = () => (
        <FormCard>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                Term
            </h2>

            <div className="mt-7">
                <FieldLabel spacingClass="mb-5">Select Your Start Term</FieldLabel>
                <div className="space-y-4">
                    {termOptions.map((term) => (
                        <RadioOption
                            key={term}
                            checked={form.term === term}
                            title={term}
                            onClick={() => updateForm("term", term)}
                        />
                    ))}
                </div>
            </div>

            <ActionRow backLabel="Back" nextLabel="Save and Next" onBack={goToPreviousStep} onNext={goToNextStep} />
        </FormCard>
    );

    const renderStudentTypeStep = () => (
        <FormCard>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                Student Type
            </h2>

            <div className="mt-6">
                <FieldLabel spacingClass="mb-5">Are you a National or International student?</FieldLabel>
                <div className="space-y-4">
                    <RadioOption
                        checked={form.studentType === "national"}
                        title="National Student"
                        description="Cameroonian citizen or permanent resident"
                        onClick={() => updateForm("studentType", "national")}
                    />
                    <RadioOption
                        checked={form.studentType === "international"}
                        title="International Student"
                        description="Applying from outside Cameroon (application fee required)"
                        onClick={() => updateForm("studentType", "international")}
                    />
                </div>
            </div>

            <ActionRow backLabel="Back" nextLabel="Save and Next" onBack={goToPreviousStep} onNext={goToNextStep} />
        </FormCard>
    );

    const renderContactInfoStep = () => (
        <FormCard>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                Contact Info
            </h2>

            <div className="mt-6">
                <FieldLabel spacingClass="mb-5">Are you a National or International student?</FieldLabel>

                <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-[#333333]">Email Address</label>
                    <div className="relative">
                        <span className="absolute left-[1px] top-[1px] flex h-[38px] w-[38px] items-center justify-center rounded-l-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M20.125 19.5H3.875C2.8375 19.5 2 18.6625 2 17.625V6.375C2 5.3375 2.8375 4.5 3.875 4.5H20.125C21.1625 4.5 22 5.3375 22 6.375V17.625C22 18.6625 21.1625 19.5 20.125 19.5ZM3.875 5.75C3.525 5.75 3.25 6.025 3.25 6.375V17.625C3.25 17.975 3.525 18.25 3.875 18.25H20.125C20.475 18.25 20.75 17.975 20.75 17.625V6.375C20.75 6.025 20.475 5.75 20.125 5.75H3.875Z" fill="#333333" fillOpacity="0.5"/>
                                <path d="M12 13.4875C11.1258 13.4875 10.3265 13.1388 9.72704 12.5037L3.17043 5.55421C2.93314 5.30512 2.94563 4.90659 3.19541 4.66996C3.44518 4.43333 3.84482 4.44578 4.08211 4.69487L10.6387 11.6443C11.3506 12.404 12.6494 12.404 13.3613 11.6443L19.9179 4.70732C20.1552 4.45824 20.5548 4.44578 20.8046 4.68241C21.0544 4.91904 21.0669 5.31758 20.8296 5.56666L14.273 12.5161C13.6735 13.1513 12.8742 13.5 12 13.5V13.4875Z" fill="#333333" fillOpacity="0.5"/>
                            </svg>
                        </span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) => updateForm("email", event.target.value)}
                            placeholder="you@example.com"
                            className="h-[40px] w-full rounded-[3px] border border-[#A7A7A7] bg-white pl-12 pr-3 text-[14px] text-[#8E8E8E] outline-none placeholder:text-[18px] placeholder:font-normal placeholder:text-[#33333380]"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <FieldLabel sizeClass="text-[14px]" weightClass="font-medium">Phone Number</FieldLabel>
                    <div className="flex flex-col gap-2 md:flex-row">
                        <Select
                            value={form.phoneCode}
                            onChange={(event) => updateForm("phoneCode", event.target.value)}
                            className="h-[40px] w-full rounded-[3px] border-[#A7A7A7] px-3 text-[14px] text-[#6F6F6F] md:w-[122px]"
                        >
                            <option>CM +237</option>
                            <option>NG +234</option>
                            <option>GH +233</option>
                        </Select>
                        <Input
                            type="text"
                            value={form.phoneNumber}
                            onChange={(event) => updateForm("phoneNumber", event.target.value)}
                            prependText="📞"
                            placeholder="123 456 XXX"
                            className="h-[40px] rounded-[3px] border-[#A7A7A7] text-[14px] text-[#8E8E8E]"
                        />
                    </div>
                </div>
            </div>

            <ActionRow backLabel="Back" nextLabel="Save and Next" onBack={goToPreviousStep} onNext={goToNextStep} />
        </FormCard>
    );

    const renderTranscriptStep = () => (
        <FormCard>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                Transcript
            </h2>

            <div className="mt-8">
                <h3 className="text-[18px] font-semibold text-[#2F2F2F]" style={{ fontFamily: '"Teachers", sans-serif' }}>Upload Unofficial Transcript</h3>
                <p className="mt-3 text-[14px] font-medium text-[#33333380]">Accepted formats: PDF, JPG, PNG (max 10MB)</p>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex min-h-[134px] w-full cursor-pointer flex-col items-center justify-center rounded-[4px] border border-dashed border-[#D2D2D2] px-4 text-center transition-opacity duration-200 hover:opacity-80"
                >
                    <Upload className="h-7 w-7 text-[#33333380]" />
                    <p className="mt-3 text-[18px] font-semibold text-[#2F2F2F]">Click to upload</p>
                    <p className="mt-1 text-[14px] text-[#33333380]">
                        {form.transcriptFileName || "or drag and drop your file here"}
                    </p>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                            updateForm("transcriptFileName", file.name);
                        }
                    }}
                />
            </div>

            <ActionRow backLabel="Back" nextLabel="Save and Next" onBack={goToPreviousStep} onNext={goToNextStep} />
        </FormCard>
    );

    const renderReviewStep = () => (
        <FormCard>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                Review
            </h2>
            <p className="mt-5 text-[18px] font-medium text-[#333333]">
                Please review your application before submitting.
            </p>

            <div className="mt-4 overflow-hidden rounded-[4px] border border-[#33333340]">
                {[
                    ["Program", form.program || "Data Science"],
                    ["Term", form.term],
                    ["Student Type", form.studentType === "international" ? "International" : "National"],
                    ["Email", form.email || "user.@gmail.com"],
                    ["Phone", `${form.phoneCode} ${form.phoneNumber}`],
                    ["Transcript", form.transcriptFileName || "documentall.pdf"],
                ].map(([label, value]) => (
                    <div
                        key={label}
                        className={cn(
                            "grid grid-cols-[1fr_auto] gap-4 border-b border-[#33333340] px-4 py-4 last:border-b-0",
                            (label === "Term" || label === "Email" || label === "Transcript") ? "bg-[#FAFAFA]" : "bg-[#FFFFFF]"
                        )}
                    >
                        <p className="text-[18px] font-medium text-[#333333]">{label}</p>
                        <p className="text-[18px] text-[#33333380]">{value}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-[4px] border border-[#FAAE14] bg-[#FAAE141A] px-4 py-3 text-[16px] text-[#333333] md:text-[18px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 md:mt-0 md:h-6 md:w-6">
                    <path d="M12.0229 13.0564C11.824 13.0564 11.6333 12.9598 11.4926 12.7879C11.352 12.616 11.2729 12.3829 11.2729 12.1398V7.86198C11.2729 7.61886 11.352 7.38571 11.4926 7.2138C11.6333 7.04189 11.824 6.94531 12.0229 6.94531C12.2219 6.94531 12.4126 7.04189 12.5533 7.2138C12.6939 7.38571 12.7729 7.61886 12.7729 7.86198V12.1398C12.7729 12.3829 12.6939 12.616 12.5533 12.7879C12.4126 12.9598 12.2219 13.0564 12.0229 13.0564ZM11.0229 16.7231C11.0229 16.3989 11.1283 16.0881 11.3158 15.8588C11.5034 15.6296 11.7577 15.5009 12.0229 15.5009C12.2882 15.5009 12.5425 15.6296 12.7301 15.8588C12.9176 16.0881 13.0229 16.3989 13.0229 16.7231C13.0229 17.0472 12.9176 17.3581 12.7301 17.5873C12.5425 17.8165 12.2882 17.9453 12.0229 17.9453C11.7577 17.9453 11.5034 17.8165 11.3158 17.5873C11.1283 17.3581 11.0229 17.0472 11.0229 16.7231Z" fill="#FAAE14"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M2.39046 16.4928L8.67832 3.9994C10.0561 1.26062 13.9516 1.26062 15.3294 3.9994L21.6173 16.4928C22.8699 18.9939 21.0712 21.9453 18.2855 21.9453H5.75985C2.97916 21.9453 1.17547 18.9939 2.42803 16.4928H2.39046ZM3.51025 17.0543L9.79811 4.56091C10.7162 2.73506 13.2928 2.73506 14.2071 4.56091L20.495 17.0543C21.3417 18.7426 20.118 20.6935 18.2905 20.6935H5.76486C3.93612 20.6935 2.70861 18.7301 3.56035 17.0543H3.51025Z" fill="#FAAE14"/>
                </svg>
                <p className="min-w-0 leading-[1.45]">International students are required to pay an application fee after submission.</p>
            </div>

            <div className="mt-15 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
                <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="min-w-[155px] min-h-[40px] cursor-pointer rounded-[5px] border border-[#D1D1D1] bg-white px-5 py-[5px] text-[18px] font-medium text-[#3B3B3B] transition-opacity duration-200 hover:opacity-80"
                >
                    Back
                </button>
                <Button type="button" onClick={goToNextStep} className="min-w-[128px] px-5 py-[11px] text-[14px]">
                    Submit Application
                </Button>
            </div>
        </FormCard>
    );

    const renderFeesStep = () => (
        <FormCard>
            <h2 className="text-[24px] text-[#text-[22px] text-[#2F2F2F] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                Pay Application Fee
            </h2>
            <p className="mt-5 text-[18px] font-medium text-[#333333]">A one-time non-refundable fee of $50 USD</p>

            <div className="mt-6 rounded-[4px] border border-[#D8D8D8] px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    <p className="text-[18px] font-medium text-[#333333]">Application Fee</p>
                    <p className="text-[18px] text-[#33333380]">$50.00</p>
                </div>
            </div>

            <div className="mt-6">
                <FieldLabel>Payment Method</FieldLabel>
                <div className="space-y-3">
                    <RadioOption
                        checked={form.paymentMethod === "card"}
                        title="Credit / Debit Card"
                        onClick={() => updateForm("paymentMethod", "card")}
                    />
                    {form.paymentMethod === "card" ? (
                        <div className="rounded-[4px] border border-[#CFCFCF] px-3 py-3">
                            <div>
                                <FieldLabel sizeClass="text-[14px]" weightClass="font-medium">Card Number</FieldLabel>
                                <Input
                                    type="text"
                                    value={form.cardNumber}
                                    onChange={(event) => updateForm("cardNumber", event.target.value)}
                                    placeholder="1234 5678 9012 3456"
                                    className="h-[38px] rounded-[2px] border-[#A7A7A7] text-[13px] text-[#A0A0A0]"
                                />
                            </div>
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <div>
                                    <FieldLabel sizeClass="text-[14px]" weightClass="font-medium">Expiry</FieldLabel>
                                    <Input
                                        type="text"
                                        value={form.cardExpiry}
                                        onChange={(event) => updateForm("cardExpiry", event.target.value)}
                                        placeholder="MM/YY"
                                        className="h-[38px] rounded-[2px] border-[#A7A7A7] text-[13px] text-[#A0A0A0]"
                                    />
                                </div>
                                <div>
                                    <FieldLabel sizeClass="text-[14px]" weightClass="font-medium">CVV</FieldLabel>
                                    <Input
                                        type="text"
                                        value={form.cardCvv}
                                        onChange={(event) => updateForm("cardCvv", event.target.value)}
                                        placeholder="123"
                                        className="h-[38px] rounded-[2px] border-[#A7A7A7] text-[13px] text-[#A0A0A0]"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <RadioOption
                        checked={form.paymentMethod === "bank"}
                        title="Bank Transfer"
                        onClick={() => updateForm("paymentMethod", "bank")}
                    />
                    {form.paymentMethod === "bank" ? (
                        <div className="rounded-[4px] border border-[#CFCFCF] px-3 py-3">
                            <p className="text-[14px] font-medium text-[#333333]">Bank Transfer Details</p>
                            <p className="mt-3 text-[18px]">
                                <span className="font-medium text-[#333333]">Bank:</span>{" "}
                                <span className="font-normal text-[#33333380]">National Bank of Cameroon</span>
                            </p>
                            <p className="text-[18px]">
                                <span className="font-medium text-[#333333]">Account Name:</span>{" "}
                                <span className="font-normal text-[#33333380]">St. Austin University</span>
                            </p>
                            <p className="text-[18px]">
                                <span className="font-medium text-[#333333]">Account Number:</span>{" "}
                                <span className="font-normal text-[#33333380]">0012-3456-7890</span>
                            </p>
                            <p className="text-[18px]">
                                <span className="font-medium text-[#333333]">Reference:</span>{" "}
                                <span className="font-normal text-[#33333380]">APP-2025-INTL</span>
                            </p>
                            <p className="mt-3 text-[14px] font-medium text-[#33333380]">Please use the reference code when making your transfer.</p>
                        </div>
                    ) : null}

                    <RadioOption
                        checked={form.paymentMethod === "mobile"}
                        title="Mobile Money"
                        onClick={() => updateForm("paymentMethod", "mobile")}
                    />
                    {form.paymentMethod === "mobile" ? (
                        <div className="rounded-[4px] border border-[#CFCFCF] px-3 py-3">
                            <p className="text-[14px] font-medium text-[#333333]">Mobile Money Payment</p>
                            <p className="mt-3 text-[18px]">
                                <span className="font-medium text-[#333333]">MTN MoMo:</span>{" "}
                                <span className="font-normal text-[#33333380]">+237 6XX XXX XXX</span>
                            </p>
                            <p className="text-[18px]">
                                <span className="font-medium text-[#333333]">Orange Money:</span>{" "}
                                <span className="font-normal text-[#33333380]">St. Austin University</span>
                            </p>
                            <p className="text-[18px]">
                                <span className="font-medium text-[#333333]">Reference:</span>{" "}
                                <span className="font-normal text-[#33333380]">APP-2025-INTL</span>
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-[4px] border border-[#FAAE14] bg-[#FAAE141A] px-4 py-3 text-[16px] text-[#333333] md:text-[18px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 md:mt-0 md:h-6 md:w-6">
                    <path d="M12.0229 13.0564C11.824 13.0564 11.6333 12.9598 11.4926 12.7879C11.352 12.616 11.2729 12.3829 11.2729 12.1398V7.86198C11.2729 7.61886 11.352 7.38571 11.4926 7.2138C11.6333 7.04189 11.824 6.94531 12.0229 6.94531C12.2219 6.94531 12.4126 7.04189 12.5533 7.2138C12.6939 7.38571 12.7729 7.61886 12.7729 7.86198V12.1398C12.7729 12.3829 12.6939 12.616 12.5533 12.7879C12.4126 12.9598 12.2219 13.0564 12.0229 13.0564ZM11.0229 16.7231C11.0229 16.3989 11.1283 16.0881 11.3158 15.8588C11.5034 15.6296 11.7577 15.5009 12.0229 15.5009C12.2882 15.5009 12.5425 15.6296 12.7301 15.8588C12.9176 16.0881 13.0229 16.3989 13.0229 16.7231C13.0229 17.0472 12.9176 17.3581 12.7301 17.5873C12.5425 17.8165 12.2882 17.9453 12.0229 17.9453C11.7577 17.9453 11.5034 17.8165 11.3158 17.5873C11.1283 17.3581 11.0229 17.0472 11.0229 16.7231Z" fill="#FAAE14"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M2.39046 16.4928L8.67832 3.9994C10.0561 1.26062 13.9516 1.26062 15.3294 3.9994L21.6173 16.4928C22.8699 18.9939 21.0712 21.9453 18.2855 21.9453H5.75985C2.97916 21.9453 1.17547 18.9939 2.42803 16.4928H2.39046ZM3.51025 17.0543L9.79811 4.56091C10.7162 2.73506 13.2928 2.73506 14.2071 4.56091L20.495 17.0543C21.3417 18.7426 20.118 20.6935 18.2905 20.6935H5.76486C3.93612 20.6935 2.70861 18.7301 3.56035 17.0543H3.51025Z" fill="#FAAE14"/>
                </svg>
                <p className="min-w-0 leading-[1.45]">Your payment information is secure and encrypted.</p>
            </div>

            <div className="mt-15 flex flex-col-reverse gap-4 md:flex-row md:items-center md:justify-between">
                <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="min-w-[155px] min-h-[40px] cursor-pointer rounded-[5px] border border-[#D1D1D1] bg-white px-5 py-[5px] text-[18px] font-medium text-[#3B3B3B] transition-opacity duration-200 hover:opacity-80"
                >
                    Back
                </button>
                <Button type="button" onClick={goToNextStep} className="min-w-[126px] px-5 py-[11px] text-[14px]">
                    Pay $50 USD
                </Button>
            </div>
        </FormCard>
    );

    const renderSubmittedStep = () => (
        <div className="mx-auto mt-8 max-w-[640px]">
            <div className="rounded-[8px] border border-[#D8D8D8] bg-white p-5 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-[24px] text-[#text-[22px] text-[#333333] font-semibold" style={{ fontFamily: '"EB Garamond", serif' }}>
                        Your Application
                    </h2>
                    <span className="inline-flex rounded-full border border-[#1E73BE] bg-[#287DC826] px-4 py-[6px] text-[16px] font-medium text-[#1E73BE]">
                        Under Review
                    </span>
                </div>

                <div className="mt-8 space-y-0">
                    {[
                        {
                            title: "Application Submitted",
                            description: "Your application has been received and is pending review.",
                            meta: "Estimated review time: 3-5 business days",
                            active: true,
                        },
                        {
                            title: "Document Verification",
                            description: "Our admissions team is reviewing your documents. This may take 3-5 business days.",
                        },
                        {
                            title: "Admission & Payment",
                            description: "Congratulations! You have been admitted. Complete your tuition payment to enroll.",
                        },
                        {
                            title: "Enrolled",
                            description: "You are officially enrolled! Your student dashboard is now active.",
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

            <div className="mt-6 rounded-[8px] border border-[#DADADA] bg-white px-6 py-5 text-center text-[16px] text-[#33333380]">
                <span className="inline-block max-w-[528px]">Your application is being reviewed. We&apos;ll notify you by email once your documents are verified.</span>
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    type="button"
                    onClick={() => setCurrentStep("dashboard")}
                    className="h-[40px] w-[155px] cursor-pointer rounded-[5px] border border-[#33333340] bg-white px-5 py-0 text-[18px] font-medium leading-none text-[#333333] transition-opacity duration-200 hover:opacity-80"
                >
                    Back to Portal 
                </button>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#F2F5FA] px-3 pb-[50px] pt-[50px] md:px-6 ">
            {currentStep === "dashboard" ? (
                renderDashboard()
            ) : (
                <div className="mx-auto max-w-[1000px]">
                    <SectionHeading
                        title="Apply to St. Austin University"
                        description="Complete your application in a few simple steps."
                    />
                    {currentStep !== "submitted" ? (
                        <Stepper activeStep={currentStep as Exclude<StepId, "dashboard" | "submitted">} />
                    ) : (
                        <Stepper activeStep="fees" allCompleted />
                    )}
                    {currentStep === "program" && renderProgramStep()}
                    {currentStep === "term" && renderTermStep()}
                    {currentStep === "studentType" && renderStudentTypeStep()}
                    {currentStep === "contactInfo" && renderContactInfoStep()}
                    {currentStep === "transcript" && renderTranscriptStep()}
                    {currentStep === "review" && renderReviewStep()}
                    {currentStep === "fees" && renderFeesStep()}
                    {currentStep === "submitted" && renderSubmittedStep()}
                </div>
            )}
        </main>
    );
}
