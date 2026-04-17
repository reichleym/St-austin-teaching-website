'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { useTranslations } from "@/lib/useTranslations";
import {
    GOVERNMENT_EMPLOYEE_GROUPS,
    GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT,
    type GovernmentEmployeeGroup,
    type GovernmentVerificationStatus,
} from "@/lib/government-benefits";

type GovernmentBenefitState = {
    isGovernmentEmployee: boolean;
    governmentEmployeeGroup: GovernmentEmployeeGroup | null;
    governmentEmployeeId: string | null;
    governmentVerificationStatus: GovernmentVerificationStatus;
    governmentDiscountPercent: number;
};

type GovernmentEmployeeDiscountCardProps = {
    isLoggedIn: boolean;
    initialBenefit: GovernmentBenefitState;
};

function getSafeDefaultGroup(value: GovernmentEmployeeGroup | null): GovernmentEmployeeGroup {
    return value ?? GOVERNMENT_EMPLOYEE_GROUPS[0];
}

const GOVERNMENT_SUPPORT_EMAIL = "govtservices@staustin.edu";

const groupLabelKeys: Record<GovernmentEmployeeGroup, string> = {
    "Civil Service Employees": "governmentEmployeeDiscount.group.civilServiceEmployees",
    "Veterans and Active-Duty Personnel": "governmentEmployeeDiscount.group.veteransAndActiveDuty",
    "Public Safety Personnel": "governmentEmployeeDiscount.group.publicSafetyPersonnel",
    "Public Health and Education Workers": "governmentEmployeeDiscount.group.publicHealthAndEducationWorkers",
};

function formatTranslation(
    t: (key: string) => string,
    key: string,
    vars?: Record<string, string | number>
) {
    let text = t(key);
    if (!vars) {
        return text;
    }

    return Object.entries(vars).reduce((result, [varName, value]) => {
        return result.replace(`{${varName}}`, String(value));
    }, text);
}

function getStatusLabel(t: (key: string) => string, benefit: GovernmentBenefitState): string {
    if (!benefit.isGovernmentEmployee) {
        return t("governmentEmployeeDiscount.status.notClaimed");
    }

    if (benefit.governmentVerificationStatus === "pending_review") {
        return t("governmentEmployeeDiscount.status.pendingReview");
    }

    if (benefit.governmentVerificationStatus === "rejected") {
        return t("governmentEmployeeDiscount.status.rejected");
    }

    const activeDiscount = benefit.governmentDiscountPercent || GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT;
    return formatTranslation(t, "governmentEmployeeDiscount.status.approved", { discount: activeDiscount });
}

function getGroupLabel(t: (key: string) => string, group: GovernmentEmployeeGroup) {
    return t(groupLabelKeys[group]);
}

export default function GovernmentEmployeeDiscountCard({
    isLoggedIn,
    initialBenefit,
}: GovernmentEmployeeDiscountCardProps) {
    const { t } = useTranslations();
    const [isGovernmentEmployee, setIsGovernmentEmployee] = useState(initialBenefit.isGovernmentEmployee);
    const [selectedGroup, setSelectedGroup] = useState<GovernmentEmployeeGroup>(
        getSafeDefaultGroup(initialBenefit.governmentEmployeeGroup)
    );
    const [governmentEmployeeId, setGovernmentEmployeeId] = useState(initialBenefit.governmentEmployeeId ?? "");
    const [currentBenefit, setCurrentBenefit] = useState(initialBenefit);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const activeDiscount = useMemo(() => {
        if (
            !currentBenefit.isGovernmentEmployee ||
            currentBenefit.governmentVerificationStatus !== "approved"
        ) {
            return 0;
        }
        return currentBenefit.governmentDiscountPercent || GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT;
    }, [currentBenefit]);

    const handleSave = async () => {
        setErrorMessage("");
        setSuccessMessage("");

        if (isSubmitting) {
            return;
        }

        if (isGovernmentEmployee && !selectedGroup) {
            setErrorMessage(t("governmentEmployeeDiscount.validation.selectCategory"));
            return;
        }

        if (isGovernmentEmployee && !governmentEmployeeId.trim()) {
            setErrorMessage(t("governmentEmployeeDiscount.validation.governmentId"));
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/government-employee/discount", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    isGovernmentEmployee,
                    governmentEmployeeGroup: isGovernmentEmployee ? selectedGroup : null,
                    governmentEmployeeId: isGovernmentEmployee ? governmentEmployeeId.trim() : null,
                }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok || !payload?.ok) {
                setErrorMessage(payload?.error || t("governmentEmployeeDiscount.errors.save"));
                return;
            }

            const nextBenefit = payload.benefit as GovernmentBenefitState;
            setCurrentBenefit(nextBenefit);
            setIsGovernmentEmployee(nextBenefit.isGovernmentEmployee);
            setSelectedGroup(getSafeDefaultGroup(nextBenefit.governmentEmployeeGroup));
            setGovernmentEmployeeId(nextBenefit.governmentEmployeeId ?? "");
            setSuccessMessage(
                nextBenefit.isGovernmentEmployee
                    ? nextBenefit.governmentVerificationStatus === "approved"
                        ? formatTranslation(t, "governmentEmployeeDiscount.success.approved", { discount: nextBenefit.governmentDiscountPercent })
                        : formatTranslation(t, "governmentEmployeeDiscount.success.submitted", { email: GOVERNMENT_SUPPORT_EMAIL })
                    : t("governmentEmployeeDiscount.success.removed")
            );
        } catch {
            setErrorMessage(t("governmentEmployeeDiscount.errors.connect"));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="rounded-lg border border-[#33333333] bg-white p-6">
                <h3 className="text-[28px] font-bold leading-tight text-[#2F2F2F]">{t("governmentEmployeeDiscount.claimTitle")}</h3>
                <p className="mt-3 text-[18px] text-[#333333CC]">
                    {t("governmentEmployeeDiscount.claimDescription")}
                </p>
                <div className="mt-5">
                    <Link
                        href="/portal?auth=login&redirect=/government-employees"
                        className="inline-flex rounded-[5px] bg-[#1E73BE] px-5 py-2.5 font-medium text-white"
                    >
                        {t("governmentEmployeeDiscount.signInButton")}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-[#33333333] bg-white p-6">
            <h3 className="text-[28px] font-bold leading-tight text-[#2F2F2F]">{t("governmentEmployeeDiscount.cardTitle")}</h3>
            <p className="mt-3 text-[18px] text-[#333333CC]">
                {formatTranslation(t, "governmentEmployeeDiscount.description", { discount: GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT })}
            </p>

            <div className="mt-6 rounded-md border border-[#D9E7F8] bg-[#F5F9FF] px-4 py-3">
                <p className="text-[16px] text-[#1E73BE]">
                    {t("governmentEmployeeDiscount.currentStatus")} <span className="font-semibold">{getStatusLabel(t, currentBenefit)}</span>
                </p>
                {currentBenefit.isGovernmentEmployee && currentBenefit.governmentEmployeeGroup ? (
                    <p className="mt-1 text-[14px] text-[#1E73BECC]">
                        {t("governmentEmployeeDiscount.categoryLabel")} {getGroupLabel(t, currentBenefit.governmentEmployeeGroup)}
                    </p>
                ) : null}
                {currentBenefit.isGovernmentEmployee && currentBenefit.governmentEmployeeId ? (
                    <p className="mt-1 text-[14px] text-[#1E73BECC]">
                        {t("governmentEmployeeDiscount.governmentIdLabel")} {currentBenefit.governmentEmployeeId}
                    </p>
                ) : null}
                {currentBenefit.isGovernmentEmployee && currentBenefit.governmentVerificationStatus === "pending_review" ? (
                    <p className="mt-1 text-[14px] text-[#1E73BECC]">
                        {formatTranslation(t, "governmentEmployeeDiscount.emailConfirmation", { email: GOVERNMENT_SUPPORT_EMAIL })}
                    </p>
                ) : null}
                {activeDiscount > 0 ? (
                    <p className="mt-1 text-[14px] text-[#1E73BECC]">
                        {formatTranslation(t, "governmentEmployeeDiscount.activeDiscount", { discount: activeDiscount })}
                    </p>
                ) : null}
            </div>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
                <input
                    type="checkbox"
                    checked={isGovernmentEmployee}
                    onChange={(event) => setIsGovernmentEmployee(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#1E73BE]"
                />
                <span className="text-[16px] text-[#333333]">
                    {t("governmentEmployeeDiscount.checkboxLabel")}
                </span>
            </label>

            {isGovernmentEmployee ? (
                <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-[#333333]">
                        {t("governmentEmployeeDiscount.selectCategoryLabel")}
                    </label>
                    <Select
                        value={selectedGroup}
                        onChange={(event) => setSelectedGroup(event.target.value as GovernmentEmployeeGroup)}
                        className="h-[42px] rounded-[4px] border-[#A7A7A7] px-3 text-[14px] text-[#333333]"
                    >
                        {GOVERNMENT_EMPLOYEE_GROUPS.map((group) => (
                            <option key={group} value={group}>
                                {getGroupLabel(t, group)}
                            </option>
                        ))}
                    </Select>
                    <div className="mt-4">
                        <Input
                            type="text"
                            labelText={t("governmentEmployeeDiscount.governmentEmployeeIdLabel")}
                            value={governmentEmployeeId}
                            onChange={(event) => setGovernmentEmployeeId(event.target.value)}
                            placeholder={t("governmentEmployeeDiscount.governmentEmployeeIdPlaceholder")}
                            className="h-[42px] rounded-[4px] border-[#A7A7A7] px-3 text-[14px] text-[#333333]"
                        />
                        <p className="mt-2 text-[13px] text-[#333333B3]">
                            {formatTranslation(t, "governmentEmployeeDiscount.submitIdMessage", { email: GOVERNMENT_SUPPORT_EMAIL })}
                        </p>
                    </div>
                </div>
            ) : null}

            <div className="mt-6">
                <Button type="button" onClick={handleSave} disabled={isSubmitting} className="min-w-[170px] px-5 py-[10px]">
                    {isSubmitting ? t("governmentEmployeeDiscount.saving") : t("governmentEmployeeDiscount.saveButton")}
                </Button>
            </div>

            {errorMessage ? <p className="mt-3 text-sm font-medium text-[#B92A2A]">{errorMessage}</p> : null}
            {successMessage ? <p className="mt-3 text-sm font-medium text-[#1E73BE]">{successMessage}</p> : null}
        </div>
    );
}
