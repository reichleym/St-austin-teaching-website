'use client';

import { useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import Select from "@/components/Select";
import {
    GOVERNMENT_EMPLOYEE_GROUPS,
    GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT,
    type GovernmentEmployeeGroup,
} from "@/lib/government-benefits";

type GovernmentBenefitState = {
    isGovernmentEmployee: boolean;
    governmentEmployeeGroup: GovernmentEmployeeGroup | null;
    governmentDiscountPercent: number;
};

type GovernmentEmployeeDiscountCardProps = {
    isLoggedIn: boolean;
    initialBenefit: GovernmentBenefitState;
};

function getSafeDefaultGroup(value: GovernmentEmployeeGroup | null): GovernmentEmployeeGroup {
    return value ?? GOVERNMENT_EMPLOYEE_GROUPS[0];
}

export default function GovernmentEmployeeDiscountCard({
    isLoggedIn,
    initialBenefit,
}: GovernmentEmployeeDiscountCardProps) {
    const [isGovernmentEmployee, setIsGovernmentEmployee] = useState(initialBenefit.isGovernmentEmployee);
    const [selectedGroup, setSelectedGroup] = useState<GovernmentEmployeeGroup>(
        getSafeDefaultGroup(initialBenefit.governmentEmployeeGroup)
    );
    const [currentBenefit, setCurrentBenefit] = useState(initialBenefit);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const activeDiscount = useMemo(() => {
        if (!currentBenefit.isGovernmentEmployee) {
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
            setErrorMessage("Please select your government employee category.");
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
                }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok || !payload?.ok) {
                setErrorMessage(payload?.error || "Unable to save your discount settings.");
                return;
            }

            const nextBenefit = payload.benefit as GovernmentBenefitState;
            setCurrentBenefit(nextBenefit);
            setIsGovernmentEmployee(nextBenefit.isGovernmentEmployee);
            setSelectedGroup(getSafeDefaultGroup(nextBenefit.governmentEmployeeGroup));
            setSuccessMessage(
                nextBenefit.isGovernmentEmployee
                    ? `Government employee discount activated (${nextBenefit.governmentDiscountPercent}% off application fee).`
                    : "Government employee discount removed."
            );
        } catch {
            setErrorMessage("Unable to connect to the server. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="rounded-lg border border-[#33333333] bg-white p-6">
                <h3 className="text-[28px] font-bold leading-tight text-[#2F2F2F]">Claim Government Employee Discount</h3>
                <p className="mt-3 text-[18px] text-[#333333CC]">
                    Sign in to verify your status and unlock your application fee discount.
                </p>
                <div className="mt-5">
                    <Link
                        href="/portal?auth=login&redirect=/government-employees"
                        className="inline-flex rounded-[5px] bg-[#1E73BE] px-5 py-2.5 font-medium text-white"
                    >
                        Sign In to Claim Discount
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-[#33333333] bg-white p-6">
            <h3 className="text-[28px] font-bold leading-tight text-[#2F2F2F]">Government Employee Discount</h3>
            <p className="mt-3 text-[18px] text-[#333333CC]">
                Eligible government employees receive {GOVERNMENT_EMPLOYEE_DISCOUNT_PERCENT}% off the
                application fee.
            </p>

            <div className="mt-6 rounded-md border border-[#D9E7F8] bg-[#F5F9FF] px-4 py-3">
                <p className="text-[16px] text-[#1E73BE]">
                    Current status:{" "}
                    <span className="font-semibold">
                        {currentBenefit.isGovernmentEmployee ? `Active (${activeDiscount}% discount)` : "Not claimed"}
                    </span>
                </p>
                {currentBenefit.isGovernmentEmployee && currentBenefit.governmentEmployeeGroup ? (
                    <p className="mt-1 text-[14px] text-[#1E73BECC]">
                        Category: {currentBenefit.governmentEmployeeGroup}
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
                    I am a current government employee / public sector staff member.
                </span>
            </label>

            {isGovernmentEmployee ? (
                <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-[#333333]">
                        Select your government employee category
                    </label>
                    <Select
                        value={selectedGroup}
                        onChange={(event) => setSelectedGroup(event.target.value as GovernmentEmployeeGroup)}
                        className="h-[42px] rounded-[4px] border-[#A7A7A7] px-3 text-[14px] text-[#333333]"
                    >
                        {GOVERNMENT_EMPLOYEE_GROUPS.map((group) => (
                            <option key={group} value={group}>
                                {group}
                            </option>
                        ))}
                    </Select>
                </div>
            ) : null}

            <div className="mt-6">
                <Button type="button" onClick={handleSave} disabled={isSubmitting} className="min-w-[170px] px-5 py-[10px]">
                    {isSubmitting ? "Saving..." : "Save Discount Settings"}
                </Button>
            </div>

            {errorMessage ? <p className="mt-3 text-sm font-medium text-[#B92A2A]">{errorMessage}</p> : null}
            {successMessage ? <p className="mt-3 text-sm font-medium text-[#1E73BE]">{successMessage}</p> : null}
        </div>
    );
}
