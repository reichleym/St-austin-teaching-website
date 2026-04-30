"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/lib/useTranslations";

function getFriendlyApiMessage(input: unknown, fallback: string): string {
    if (typeof input !== "string") {
        return fallback;
    }

    const message = input.trim();
    if (!message) {
        return fallback;
    }

    const looksTechnical =
        /column\s+".+"\s+does not exist/i.test(message) ||
        /relation\s+".+"\s+does not exist/i.test(message) ||
        /postgres|sqlstate|syntax error|constraint/i.test(message);

    return looksTechnical ? fallback : message;
}

function ResetPasswordContent() {
    const { t } = useTranslations();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get("email") || "";
    const tokenFromLink = searchParams.get("token") || "";

    const [email, setEmail] = useState(initialEmail);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const isReady = useMemo(
        () => Boolean(email.trim() && tokenFromLink.trim()),
        [email, tokenFromLink]
    );

    function PasswordField({
        id,
        label,
        value,
        onChange,
        placeholder,
    }: {
        id: string;
        label: string;
        value: string;
        onChange: (v: string) => void;
        placeholder?: string;
    }) {
        const [visible, setVisible] = useState(false);

        return (
            <div>
                <label htmlFor={id} className="mb-1 block text-[14px] font-medium text-[#323232]">
                    {label}
                </label>
                <div className="relative">
                    <input
                        id={id}
                        name={id}
                        type={visible ? "text" : "password"}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-[42px] w-full rounded-[6px] border border-[#CFCFCF] px-3 text-[14px] outline-none focus:border-[#1E73BE]"
                        placeholder={placeholder}
                        autoComplete="new-password"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A7A]"
                        aria-label={visible ? "Hide password" : "Show password"}
                    >
                        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                </div>
            </div>
        );
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!email.trim() || !tokenFromLink.trim()) {
            setErrorMessage("This reset link is invalid or expired. Please request a new one.");
            return;
        }

        if (!newPassword.trim() || !confirmPassword.trim()) {
            setErrorMessage("Please enter and confirm your new password.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Password and confirm password must match.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/auth/password-reset/confirm", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim(),
                    token: tokenFromLink.trim(),
                    newPassword: newPassword.trim(),
                }),
            });

            const payload = await response.json().catch(() => ({}));
            if (!response.ok || !payload?.ok) {
                setErrorMessage(
                    getFriendlyApiMessage(
                        payload?.error,
                        "Unable to reset password right now. Please try again."
                    )
                );
                return;
            }

            setSuccessMessage("Password reset successful. Redirecting to sign in...");
            setIsRedirecting(true);
            setNewPassword("");
            setConfirmPassword("");
            window.setTimeout(() => {
                router.push("/portal?auth=login");
            }, 900);
        } catch {
            setErrorMessage("Unable to connect to the server. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#F5F7FB] px-4 py-12">
            <div className="mx-auto max-w-[520px] rounded-[8px] border border-[#DDDDDD] bg-white p-6 md:p-8">
                <h1 className="text-[28px] font-semibold text-[#1D1D1D]">{t("resetPassword.title")}</h1>
                <p className="mt-2 text-[15px] text-[#555555]">
                    {t("resetPassword.subtitle")}
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete="off">
                    <div>
                        <label htmlFor="reset-email" className="mb-1 block text-[14px] font-medium text-[#323232]">
                            {t("auth.email")}
                        </label>
                        <input
                            id="reset-email"
                            name="reset-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="h-[42px] w-full rounded-[6px] border border-[#CFCFCF] px-3 text-[14px] outline-none focus:border-[#1E73BE]"
                            placeholder="email@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <PasswordField
                        id="new-password"
                        label={t("resetPassword.newPassword")}
                        value={newPassword}
                        onChange={setNewPassword}
                        placeholder="Enter new password"
                    />

                    <PasswordField
                        id="confirm-password"
                        label={t("resetPassword.confirmPassword")}
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="Confirm password"
                    />

                    {errorMessage ? (
                        <p className="text-[14px] font-medium text-[#B92A2A]">{errorMessage}</p>
                    ) : null}

                    {successMessage ? (
                        <p className="text-[14px] font-medium text-[#166534]">{successMessage}</p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSubmitting || isRedirecting || !isReady}
                        className="h-[42px] w-full rounded-[6px] bg-[#1E73BE] px-4 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting ? t("resetPassword.resetting") : isRedirecting ? "Redirecting..." : t("resetPassword.reset")}
                    </button>
                </form>

                <p className="mt-5 text-[14px] text-[#555555]">
                    Back to <Link href="/portal" className="font-medium text-[#1E73BE]">Portal</Link>
                </p>
            </div>
        </main>
    );
}

function ResetPasswordFallback() {
    return (
        <main className="min-h-screen bg-[#F5F7FB] px-4 py-12">
            <div className="mx-auto max-w-[520px] rounded-[8px] border border-[#DDDDDD] bg-white p-6 md:p-8">
                <h1 className="text-[28px] font-semibold text-[#1D1D1D]">Reset Password</h1>
                <p className="mt-2 text-[15px] text-[#555555]">Loading reset form...</p>
            </div>
        </main>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordFallback />}>
            <ResetPasswordContent />
        </Suspense>
    );
}
