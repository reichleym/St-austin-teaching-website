"use client";

import { useState } from "react";
import Button from "@/components/Button";

type DonationFrequency = "one_time";
type PaymentMethod = "credit_card" | "bank_transfer" | "mtn_mobile_money" | "orange_money";

function parseAmountToCents(value: string): number | null {
    const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return Math.round(parsed * 100);
}

type Props = {
    title?: string;
    description?: string;
    oneTimeAmounts: string[];
    designationOptions: string[];
    paymentMethods: Array<{ value: string; label: string }>;
};

export default function DonationsFormClient({ title, description, oneTimeAmounts, designationOptions, paymentMethods }: Props) {
    const [selectedAmount, setSelectedAmount] = useState(oneTimeAmounts?.[1] ?? "");
    const frequency: DonationFrequency = "one_time";
    const [customAmount, setCustomAmount] = useState("");
    const [designation, setDesignation] = useState(designationOptions?.[0] ?? "");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>((paymentMethods?.[0]?.value as PaymentMethod) ?? "mtn_mobile_money");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    async function handleDonationSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        const customAmountValue = customAmount.trim();
        const amountSource = customAmountValue.length > 0 ? customAmountValue : selectedAmount;
        const amountCents = parseAmountToCents(amountSource);
        if (!amountCents) {
            setFormError("Please enter a valid donation amount.");
            return;
        }

        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setFormError("Please fill first name, last name, and email.");
            return;
        }

        if ((paymentMethod === "mtn_mobile_money" || paymentMethod === "orange_money") && !phoneNumber.trim()) {
            setFormError("Phone number is required for mobile money payments.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/donations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, phoneNumber, amountCents, frequency, designation, paymentMethod }),
            });

            const payload = await response.json();
            if (!response.ok || !payload?.ok) {
                setFormError(payload?.error || "Failed to submit donation.");
                return;
            }

            if (payload.checkoutUrl) {
                window.location.href = payload.checkoutUrl;
                return;
            }

            setFormSuccess(payload.message || "Donation submitted successfully.");
        } catch {
            setFormError("Failed to submit donation.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const renderAmountGrid = (amounts: string[]) => (
        <div className="space-y-6 pt-2">
            <div className="grid grid-cols-2 gap-4 md:gap-[6] md:[grid-template-columns:repeat(auto-fit,minmax(150px,200px))]">
                {amounts.map((amount) => {
                    const isActive = selectedAmount === amount;
                    return (
                        <button key={amount} type="button" onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }} className={`min-h-[50px] cursor-pointer border border-[#1E73BE] text-lg font-semibold transition-colors duration-200 ${isActive ? "border-[#1E73BE] bg-[#1E73BE] text-white" : "border-[#8CC2F0] bg-[#1E73BE1A] text-[#333333] hover:border-[#1E73BE]"}`}>
                            {amount}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-4 text-[#8A8A8A] my-8 max-w-[450px] mx-auto">
                <span className="h-px flex-1 bg-[#D9D9D9]" />
                <span className="text-md font-medium tracking-[0.18em] tracking-[0em]">Or</span>
                <span className="h-px flex-1 bg-[#D9D9D9]" />
            </div>
        </div>
    );

    return (
        <div className="rounded-[10px] bg-white">
            <div className="mb-10">
                <h2 className="mb-3 text-3xl font-bold leading-tight md:text-[35px]">{title ?? "Make a Donation"}</h2>
                <p className="text-[#333333]">{description ?? "Support our mission."}</p>
            </div>

            {renderAmountGrid(oneTimeAmounts)}

            <div className="space-y-5 pt-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-[#333333]">Custom Amount</label>
                    <div className="flex items-center rounded-[5px] border border-[#BDBDBD] px-4">
                        <span className="text-lg font-semibold text-[#333333]">XAF</span>
                        <input type="text" placeholder={selectedAmount.replace(/[^0-9.]/g, "")} className="h-12 w-full bg-transparent px-2 outline-none" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-[#333333]">Designate your gift (optional)</label>
                    <select className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 text-[#666666] outline-none" value={designation} onChange={(e) => setDesignation(e.target.value)}>
                        {designationOptions.map((opt) => <option key={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>

            <div className="pt-10">
                <h3 className="mb-8 text-3xl font-bold leading-tight md:text-[35px]">Your Information</h3>
                <form onSubmit={handleDonationSubmit}>
                    <div className="grid gap-[20px] md:gap-[24px] sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#333333]">First Name</label>
                            <input type="text" placeholder="First Name" className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 outline-none" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#333333]">Last Name</label>
                            <input type="text" placeholder="Last Name" className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 outline-none" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        </div>
                    </div>

                    <div className="pt-5">
                        <label className="mb-2 block text-sm font-medium text-[#333333]">Email Address</label>
                        <input type="email" placeholder="email@example.com" className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="pt-5">
                        <label className="mb-2 block text-sm font-medium text-[#333333]">Payment Method</label>
                        <select className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 text-[#666666] outline-none" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                            {paymentMethods.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                    </div>

                    {(paymentMethod === "mtn_mobile_money" || paymentMethod === "orange_money") && (
                        <div className="pt-5">
                            <label className="mb-2 block text-sm font-medium text-[#333333]">Mobile Money Number</label>
                            <input type="text" placeholder="e.g. +2376XXXXXXXX" className="h-12 w-full rounded-[5px] border border-[#BDBDBD] px-4 outline-none" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                        </div>
                    )}

                    {formError ? <p className="mt-5 text-sm text-red-600">{formError}</p> : null}
                    {formSuccess ? <p className="mt-5 text-sm text-green-700">{formSuccess}</p> : null}

                    <Button className="mt-8 w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? "Loading..." : "Donate Now"}</Button>
                </form>
            </div>
        </div>
    );
}
