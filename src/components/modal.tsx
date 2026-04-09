'use client';

import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import { cn } from "@/lib/utils";

export type AuthModalView =
    | "login"
    | "signup"
    | "reset-password"
    | "check-email"
    | "new-password"
    | "password-success";

export type AuthUser = {
    id: number;
    fullName: string;
    email: string;
    isEmailVerified?: boolean;
    isEnrolled: boolean;
};

type ModalProps = {
    isOpen: boolean;
    view: AuthModalView;
    onClose: () => void;
    onViewChange: (view: AuthModalView) => void;
    onAuthSuccess?: (user: AuthUser) => void;
    className?: string;
};

type AuthFormState = {
    fullName: string;
    loginEmail: string;
    signupEmail: string;
    resetEmail: string;
    loginPassword: string;
    signupPassword: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
};

const initialFormState: AuthFormState = {
    fullName: "",
    loginEmail: "",
    signupEmail: "",
    resetEmail: "",
    loginPassword: "",
    signupPassword: "",
    resetToken: "",
    newPassword: "",
    confirmPassword: "",
};

const fieldClassName =
    "h-[44px] rounded-[6px] border-[#8F8F8F] px-4 text-[18px] text-[#333333] placeholder:text-[#A0A0A0]";

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

function IconBadge({
    children,
    tone = "blue",
    plain = false,
}: {
    children: React.ReactNode;
    tone?: "blue" | "green";
    plain?: boolean;
}) {
    return (
        <div
            className={cn(
                "mb-8 flex items-center",
                plain
                    ? "h-auto w-auto rounded-none bg-transparent"
                    : cn(
                        "h-11 w-11 rounded-[12px]",
                        tone === "green" ? "bg-[#E9FCEB] text-[#35DB4A]" : "bg-[#EFF6FD] text-[#1E73BE]"
                    )
            )}
        >
            {children}
        </div>
    );
}

function InlineAction({
    children,
    onClick,
    className,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "cursor-pointer underline underline-offset-4 transition-opacity duration-200 hover:opacity-70 font-semibold",
                className
            )}
        >
            {children}
        </button>
    );
}

function PasswordField({
    label,
    name,
    value,
    placeholder,
    visible,
    onChange,
    onToggle,
}: {
    label: string;
    name: string;
    value: string;
    placeholder: string;
    visible: boolean;
    onChange: (value: string) => void;
    onToggle: () => void;
}) {
    return (
        <div className="relative">
            <Input
                type={visible ? "text" : "password"}
                name={name}
                labelText={label}
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={cn(fieldClassName, "pr-12")}
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute bottom-[10px] right-4 z-10 cursor-pointer text-[#7A7A7A]"
                aria-label={visible ? "Hide password" : "Show password"}
            >
                {visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
        </div>
    );
}

export default function Modal({
    isOpen,
    view,
    onClose,
    onViewChange,
    onAuthSuccess,
    className,
}: ModalProps) {
    const [formState, setFormState] = useState<AuthFormState>(initialFormState);
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const [errorMessage, setErrorMessage] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    const updateField = (field: keyof AuthFormState, value: string) => {
        setFormState((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const submittedEmail =
        formState.resetEmail || formState.loginEmail || formState.signupEmail || "email@example.com";

    const closeAndReset = () => {
        setFormState(initialFormState);
        setShowPassword({});
        setErrorMessage("");
        setInfoMessage("");
        setIsSubmitting(false);
        onClose();
    };

    const changeView = (nextView: AuthModalView) => {
        setErrorMessage("");
        setInfoMessage("");
        setIsSubmitting(false);
        onViewChange(nextView);
    };

    const handlePrimaryAction = async () => {
        setErrorMessage("");
        setInfoMessage("");

        if (isSubmitting) {
            return;
        }

        if (view === "login") {
            if (!formState.loginEmail.trim() || !formState.loginPassword.trim()) {
                setErrorMessage("Please enter your email and password.");
                return;
            }

            setIsSubmitting(true);
            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: formState.loginEmail,
                        password: formState.loginPassword,
                    }),
                });

                const payload = await response.json().catch(() => ({}));
                if (!response.ok || !payload?.ok) {
                    setErrorMessage(
                        getFriendlyApiMessage(
                            payload?.error,
                            "Unable to log in right now. Please try again."
                        )
                    );
                    return;
                }

                onAuthSuccess?.(payload.user as AuthUser);
                closeAndReset();
            } catch {
                setErrorMessage("Unable to connect to the server. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        if (view === "signup") {
            if (!formState.fullName.trim() || !formState.signupEmail.trim() || !formState.signupPassword.trim()) {
                setErrorMessage("Please complete all required fields.");
                return;
            }

            setIsSubmitting(true);
            try {
                const response = await fetch("/api/auth/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fullName: formState.fullName,
                        email: formState.signupEmail,
                        password: formState.signupPassword,
                    }),
                });

                const payload = await response.json().catch(() => ({}));
                if (!response.ok || !payload?.ok) {
                    setErrorMessage(
                        getFriendlyApiMessage(
                            payload?.error,
                            "Unable to create your account right now. Please try again."
                        )
                    );
                    return;
                }

                if (typeof payload?.message === "string" && payload.message.trim()) {
                    setInfoMessage(payload.message.trim());
                }
                onAuthSuccess?.(payload.user as AuthUser);
                closeAndReset();
            } catch {
                setErrorMessage("Unable to connect to the server. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        if (view === "reset-password") {
            if (!formState.resetEmail.trim()) {
                setErrorMessage("Please provide your email address.");
                return;
            }

            setIsSubmitting(true);
            try {
                const response = await fetch("/api/auth/password-reset/request", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: formState.resetEmail,
                    }),
                });

                const payload = await response.json().catch(() => ({}));
                if (!response.ok || !payload?.ok) {
                    setErrorMessage(
                        getFriendlyApiMessage(
                            payload?.error,
                            "Unable to process password reset right now. Please try again."
                        )
                    );
                    return;
                }

                if (typeof payload?.message === "string" && payload.message.trim()) {
                    setInfoMessage(payload.message.trim());
                }
                if (typeof payload?.devResetToken === "string" && payload.devResetToken.trim()) {
                    updateField("resetToken", payload.devResetToken);
                    setInfoMessage(
                        "Password reset link sent. Development mode token has been auto-filled."
                    );
                }
            } catch {
                setErrorMessage("Unable to connect to the server. Please try again.");
                return;
            } finally {
                setIsSubmitting(false);
            }

            changeView("check-email");
            return;
        }

        if (view === "check-email") {
            window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
            changeView("new-password");
            return;
        }

        if (view === "new-password") {
            if (!formState.newPassword.trim() || !formState.confirmPassword.trim()) {
                setErrorMessage("Please enter and confirm your new password.");
                return;
            }

            if (formState.newPassword !== formState.confirmPassword) {
                setErrorMessage("Password and confirm password must match.");
                return;
            }

            if (!formState.resetToken.trim()) {
                setErrorMessage("Please enter your reset token.");
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
                        email: formState.resetEmail || formState.loginEmail || formState.signupEmail,
                        token: formState.resetToken,
                        newPassword: formState.newPassword,
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
            } catch {
                setErrorMessage("Unable to connect to the server. Please try again.");
                return;
            } finally {
                setIsSubmitting(false);
            }

            changeView("password-success");
            return;
        }

        if (view === "password-success") {
            changeView("login");
        }
    };

    const cardWidthClass = view === "password-success" ? "max-w-[460px]" : "max-w-[680px]";
    const isCompactCard = view === "check-email" || view === "new-password" || view === "password-success";
    const contentPaddingClass = isCompactCard ? "px-6 py-8 md:px-10 md:py-10" : "px-5 py-8 md:px-[32px] md:py-[40px]";
    const showCloseButton = view === "login" || view === "signup";

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-black/55 px-4 py-6 font-['Teachers',sans-serif] md:py-10"
            onClick={closeAndReset}
        >
            <div className="flex min-h-full items-center justify-center">
                <div
                    className={cn(
                        "relative w-full rounded-[18px] border border-[#1E73BE] bg-white shadow-[0_16px_50px_rgba(0,0,0,0.18)]",
                        cardWidthClass,
                        contentPaddingClass,
                        className
                    )}
                    onClick={(event) => event.stopPropagation()}
                >
                    {showCloseButton && (
                        <button
                            type="button"
                            onClick={closeAndReset}
                            className="absolute right-5 top-5 cursor-pointer text-black transition-opacity duration-200 hover:opacity-70"
                            aria-label="Close modal"
                        >
                            <X className="h-7 w-7" />
                        </button>
                    )}

                    {view !== "new-password" && errorMessage ? (
                        <p className="mb-6 rounded-[6px] bg-[#FDEBEC] px-4 py-3 text-sm text-[#B42318]">{errorMessage}</p>
                    ) : null}
                    {infoMessage ? (
                        <p className="mb-6 rounded-[6px] bg-[#EFF6FD] px-4 py-3 text-sm text-[#1E73BE]">{infoMessage}</p>
                    ) : null}

                    {view === "login" && (
                        <div>
                            <div className="mb-10 pr-10">
                                <h4 className="text-[22px] font-semibold leading-tight text-[#333333] md:text-[26px]">
                                    Log In
                                </h4>
                                <p className="mt-3 text-[18px] leading-[1.4] text-[#333333]">
                                    Continue to St. Austin&apos;s University portal.
                                </p>
                            </div>

                            <form
                                className="space-y-6"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void handlePrimaryAction();
                                }}
                            >
                                <Input
                                    type="email"
                                    name="loginEmail"
                                    labelText="Email Address"
                                    placeholder="email@example.com"
                                    value={formState.loginEmail}
                                    onChange={(event) => updateField("loginEmail", event.target.value)}
                                    className={fieldClassName}
                                />

                                <PasswordField
                                    label="Password"
                                    name="loginPassword"
                                    placeholder="Enter password"
                                    value={formState.loginPassword}
                                    visible={Boolean(showPassword.loginPassword)}
                                    onChange={(value) => updateField("loginPassword", value)}
                                    onToggle={() =>
                                        setShowPassword((current) => ({
                                            ...current,
                                            loginPassword: !current.loginPassword,
                                        }))
                                    }
                                />

                                <div className="flex justify-end">
                                        <InlineAction
                                            className="text-[18px] text-[#9A9A9A]"
                                            onClick={() => changeView("reset-password")}
                                        >
                                            Forgot Password?
                                        </InlineAction>
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="h-[44px] w-full rounded-[7px] text-[20px]">
                                    {isSubmitting ? "Signing in..." : "Log In"}
                                </Button>
                            </form>

                            <div className="mt-10 text-center text-[18px] text-[#333333]">
                                <span>Don&apos;t have an account, </span>
                                <InlineAction
                                    className="font-medium text-[#1E73BE]"
                                    onClick={() => changeView("signup")}
                                >
                                    Create an Account
                                </InlineAction>
                            </div>
                        </div>
                    )}

                    {view === "signup" && (
                        <div>
                            <div className="mb-10 pr-10">
                                <h4 className="text-[22px] font-semibold leading-tight text-[#333333] md:text-[26px]">
                                    Sign Up
                                </h4>
                                <p className="mt-3 text-[18px] leading-[1.4] text-[#333333]">
                                    Let&apos;s create an account to continue to St. Austin&apos;s University.
                                </p>
                            </div>

                            <form
                                className="space-y-6"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void handlePrimaryAction();
                                }}
                            >
                                <Input
                                    type="text"
                                    name="fullName"
                                    labelText="Full Name"
                                    placeholder="enter full name"
                                    value={formState.fullName}
                                    onChange={(event) => updateField("fullName", event.target.value)}
                                    className={fieldClassName}
                                />

                                <Input
                                    type="email"
                                    name="signupEmail"
                                    labelText="Email Address"
                                    placeholder="email@example.com"
                                    value={formState.signupEmail}
                                    onChange={(event) => updateField("signupEmail", event.target.value)}
                                    className={fieldClassName}
                                />

                                <PasswordField
                                    label="Password"
                                    name="signupPassword"
                                    placeholder="Enter password"
                                    value={formState.signupPassword}
                                    visible={Boolean(showPassword.signupPassword)}
                                    onChange={(value) => updateField("signupPassword", value)}
                                    onToggle={() =>
                                        setShowPassword((current) => ({
                                            ...current,
                                            signupPassword: !current.signupPassword,
                                        }))
                                    }
                                />

                                <Button type="submit" disabled={isSubmitting} className="h-[44px] w-full rounded-[7px] text-[20px]">
                                    {isSubmitting ? "Creating account..." : "Sign up"}
                                </Button>
                            </form>

                            <div className="mt-10 text-center text-[18px] text-[#333333]">
                                <span>Already have an account, </span>
                                <InlineAction
                                    className="font-medium text-[#1E73BE]"
                                    onClick={() => changeView("login")}
                                >
                                    Log In Here
                                </InlineAction>
                            </div>
                        </div>
                    )}

                    {view === "reset-password" && (
                        <div>
                            <div className="mb-10 max-w-[520px] pr-10">
                                <h4 className="text-[22px] font-semibold leading-tight text-[#333333] md:text-[26px]">
                                    Reset Password
                                </h4>
                                <p className="mt-3 text-[18px] leading-[1.4] text-[#333333]">
                                    Enter your registered email address to receive a password reset link.
                                </p>
                            </div>

                            <form
                                className="space-y-8"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void handlePrimaryAction();
                                }}
                            >
                                <Input
                                    type="email"
                                    name="resetEmail"
                                    labelText="Email Address"
                                    placeholder="email@example.com"
                                    value={formState.resetEmail}
                                    onChange={(event) => updateField("resetEmail", event.target.value)}
                                    className={fieldClassName}
                                />

                                <Button type="submit" disabled={isSubmitting} className="h-[44px] w-full rounded-[7px] text-[20px]">
                                    {isSubmitting ? "Sending..." : "Send Password Reset Link"}
                                </Button>
                            </form>

                            <div className="mt-10 text-center">
                                <InlineAction
                                    className="text-[18px] text-[#333333] font-semibold"
                                    onClick={() => changeView("login")}
                                >
                                    ← Back to login
                                </InlineAction>
                            </div>
                        </div>
                    )}

                    {view === "check-email" && (
                        <div>
                            <IconBadge plain>
                                <svg xmlns="http://www.w3.org/2000/svg" width="33" height="27" viewBox="0 0 34 27" fill="none" aria-hidden="true">
                                    <path d="M30 0H3.33333C1.5 0 0.0166667 1.5 0.0166667 3.33333L0 23.3333C0 25.1667 1.5 26.6667 3.33333 26.6667H30C31.8333 26.6667 33.3333 25.1667 33.3333 23.3333V3.33333C33.3333 1.5 31.8333 0 30 0ZM30 6.66667L16.6667 15L3.33333 6.66667V3.33333L16.6667 11.6667L30 3.33333V6.66667Z" fill="#1E73BE"/>
                                </svg>
                            </IconBadge>

                            <div className="max-w-[560px]">
                                <h4 className="text-[22px] font-semibold leading-tight text-[#333333] md:text-[26px]">
                                    Check your Email
                                </h4>
                                <p className="mt-4 text-[18px] leading-[1.4] text-[#333333]">
                                    We have sent a password reset link to your registered email address :
                                    <span className="font-semibold"> {submittedEmail}</span>
                                </p>
                            </div>

                            <Button
                                type="button"
                                disabled={isSubmitting}
                                className="mt-10 h-[44px] w-full rounded-[7px] text-[20px]"
                                onClick={() => {
                                    void handlePrimaryAction();
                                }}
                            >
                                Open Gmail App
                            </Button>

                            <div className="mt-10 text-center">
                                <InlineAction
                                    className="text-[18px] text-[#333333]"
                                    onClick={() => changeView("login")}
                                >
                                    ← Back to login
                                </InlineAction>
                            </div>
                        </div>
                    )}

                    {view === "new-password" && (
                        <div>
                            <IconBadge plain>
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="35" viewBox="0 0 30 35" fill="none" aria-hidden="true">
                                    <path d="M9.29571 3.40714C7.25473 3.96925 5.22771 4.58085 3.21643 5.24142C3.03264 5.30069 2.86925 5.41051 2.74495 5.5583C2.62065 5.7061 2.54047 5.8859 2.51358 6.07713C1.32644 14.985 4.06929 21.4842 7.34143 25.7657C8.72621 27.597 10.3782 29.21 12.2421 30.5507C12.9836 31.0735 13.6393 31.4507 14.1557 31.6928C14.4128 31.8142 14.6221 31.8985 14.7836 31.9457C14.8547 31.9673 14.927 31.9851 15 31.9992C15.0723 31.9851 15.1438 31.9672 15.2143 31.9457C15.3771 31.8971 15.5871 31.8128 15.8443 31.6928C16.3586 31.4507 17.0164 31.0714 17.7578 30.5507C19.6218 29.21 21.2738 27.597 22.6585 25.7657C25.9307 21.4864 28.6735 14.985 27.4864 6.07713C27.4595 5.8859 27.3793 5.7061 27.255 5.5583C27.1307 5.41051 26.9673 5.30069 26.7835 5.24142C25.3885 4.78499 23.0335 4.04142 20.7043 3.40928C18.3257 2.76428 16.1378 2.28642 15 2.28642C13.8643 2.28642 11.6743 2.76214 9.29571 3.40714ZM8.72571 1.2C11.0507 0.567856 13.5214 0 15 0C16.4786 0 18.9493 0.567856 21.2743 1.2C23.6528 1.84285 26.0507 2.60357 27.4607 3.06428C28.0502 3.25896 28.5728 3.61599 28.9686 4.09435C29.3643 4.57271 29.6171 5.15301 29.6978 5.76856C30.975 15.3621 28.0114 22.4721 24.4157 27.1757C22.8903 29.1872 21.0723 30.959 19.0221 32.4321C18.314 32.943 17.5625 33.3912 16.7764 33.7714C16.1764 34.0542 15.5314 34.2857 15 34.2857C14.4686 34.2857 13.8257 34.0542 13.2236 33.7714C12.4374 33.3912 11.686 32.943 10.9779 32.4321C8.92768 30.959 7.10966 29.1872 5.58429 27.1757C1.98858 22.4721 -0.974987 15.3621 0.302154 5.76856C0.382912 5.15301 0.635674 4.57271 1.0314 4.09435C1.42713 3.61599 1.94978 3.25896 2.53929 3.06428C4.58626 2.39359 6.64899 1.77198 8.72571 1.2Z" fill="#1E73BE"/>
                                    <path d="M18.2142 13.9285C18.2146 14.5935 18.0086 15.2422 17.6249 15.7853C17.2411 16.3284 16.6983 16.739 16.0714 16.9607L16.8964 21.225C16.9264 21.3801 16.9217 21.5399 16.8827 21.693C16.8437 21.846 16.7714 21.9886 16.6708 22.1105C16.5703 22.2323 16.444 22.3304 16.3011 22.3977C16.1582 22.4651 16.0022 22.5 15.8442 22.5H14.1556C13.9978 22.4997 13.8421 22.4645 13.6994 22.3971C13.5568 22.3296 13.4308 22.2314 13.3305 22.1096C13.2302 21.9878 13.158 21.8454 13.1191 21.6924C13.0803 21.5395 13.0757 21.3799 13.1056 21.225L13.9285 16.9607C13.373 16.7643 12.8821 16.419 12.5096 15.9625C12.1371 15.506 11.8972 14.9558 11.8162 14.3722C11.7352 13.7886 11.8161 13.194 12.0502 12.6533C12.2843 12.1125 12.6625 11.6466 13.1435 11.3063C13.6245 10.966 14.1898 10.7644 14.7776 10.7236C15.3654 10.6829 15.953 10.8045 16.4764 11.0751C16.9998 11.3458 17.4387 11.7551 17.7452 12.2583C18.0516 12.7615 18.2139 13.3393 18.2142 13.9285Z" fill="#1E73BE"/>
                                </svg>
                            </IconBadge>

                            <div className="mb-8 max-w-[560px]">
                                <h4 className="text-[22px] font-semibold leading-tight text-[#333333] md:text-[26px]">
                                    Set New Password
                                </h4>
                                <p className="mt-4 text-[18px] leading-[1.4] text-[#333333]">
                                    Set a new password and write it down in your notes to remember it.
                                </p>
                            </div>

                            <form
                                className="space-y-6"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void handlePrimaryAction();
                                }}
                            >
                                <PasswordField
                                    label="Password"
                                    name="newPassword"
                                    placeholder="Enter new password"
                                    value={formState.newPassword}
                                    visible={Boolean(showPassword.newPassword)}
                                    onChange={(value) => updateField("newPassword", value)}
                                    onToggle={() =>
                                        setShowPassword((current) => ({
                                            ...current,
                                            newPassword: !current.newPassword,
                                        }))
                                    }
                                />

                                <PasswordField
                                    label="Confirm Password"
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={formState.confirmPassword}
                                    visible={Boolean(showPassword.confirmPassword)}
                                    onChange={(value) => updateField("confirmPassword", value)}
                                    onToggle={() =>
                                        setShowPassword((current) => ({
                                            ...current,
                                            confirmPassword: !current.confirmPassword,
                                        }))
                                    }
                                />

                                <Input
                                    type="text"
                                    name="resetToken"
                                    labelText="Reset Token"
                                    placeholder="Paste reset token"
                                    value={formState.resetToken}
                                    onChange={(event) => updateField("resetToken", event.target.value)}
                                    className={fieldClassName}
                                />

                                {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

                                <Button type="submit" disabled={isSubmitting} className="h-[44px] w-full rounded-[7px] text-[20px]">
                                    {isSubmitting ? "Resetting..." : "Reset Password"}
                                </Button>
                            </form>

                            <div className="mt-10 text-center">
                                <InlineAction
                                    className="text-[18px] text-[#333333]"
                                    onClick={() => changeView("login")}
                                >
                                    ← Back to login
                                </InlineAction>
                            </div>
                        </div>
                    )}

                    {view === "password-success" && (
                        <div>
                            <IconBadge plain>
                                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none" aria-hidden="true">
                                    <circle cx="25" cy="25" r="25" fill="#EBF8EC"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M8 25C8 20.4913 9.79107 16.1673 12.9792 12.9792C16.1673 9.79107 20.4913 8 25 8C29.5087 8 33.8327 9.79107 37.0208 12.9792C40.2089 16.1673 42 20.4913 42 25C42 29.5087 40.2089 33.8327 37.0208 37.0208C33.8327 40.2089 29.5087 42 25 42C20.4913 42 16.1673 40.2089 12.9792 37.0208C9.79107 33.8327 8 29.5087 8 25ZM24.0299 32.276L33.8173 20.0405L32.0493 18.6261L23.7035 29.0551L17.792 24.1296L16.3413 25.8704L24.0299 32.276Z" fill="#31EE3E"/>
                                </svg>
                            </IconBadge>

                            <div className="max-w-[340px]">
                                <h4 className="text-[22px] font-semibold leading-tight text-[#333333]">
                                    Password Reset Successful
                                </h4>
                                <p className="mt-3 text-[18px] leading-[1.4] text-[#333333]">
                                    Your password has been successfully reset
                                </p>
                            </div>

                            <Button
                                type="button"
                                className="mt-8 h-[44px] w-full rounded-[7px] text-[20px]"
                                onClick={() => {
                                    void handlePrimaryAction();
                                }}
                            >
                                ← Back to login
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
