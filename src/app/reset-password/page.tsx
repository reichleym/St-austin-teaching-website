"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
                <h1 className="text-[28px] font-semibold text-[#1D1D1D]">Reset Password</h1>
                <p className="mt-2 text-[15px] text-[#555555]">
                    Set your new portal password below.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="reset-email" className="mb-1 block text-[14px] font-medium text-[#323232]">
                            Email
                        </label>
                        <input
                            id="reset-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="h-[42px] w-full rounded-[6px] border border-[#CFCFCF] px-3 text-[14px] outline-none focus:border-[#1E73BE]"
                            placeholder="email@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="new-password" className="mb-1 block text-[14px] font-medium text-[#323232]">
                            New Password
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            className="h-[42px] w-full rounded-[6px] border border-[#CFCFCF] px-3 text-[14px] outline-none focus:border-[#1E73BE]"
                            placeholder="Enter new password"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirm-password" className="mb-1 block text-[14px] font-medium text-[#323232]">
                            Confirm Password
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            className="h-[42px] w-full rounded-[6px] border border-[#CFCFCF] px-3 text-[14px] outline-none focus:border-[#1E73BE]"
                            placeholder="Confirm password"
                            required
                        />
                    </div>

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
                        {isSubmitting ? "Updating..." : isRedirecting ? "Redirecting..." : "Set New Password"}
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
