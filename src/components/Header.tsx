'use client';

import { useCallback, useContext, useEffect, useState } from "react";
import { ChevronDown, CircleUserRound, LogOut, Menu, Search, X } from "lucide-react";
import { RxCross2 } from "react-icons/rx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "./Button";
import Modal, { AuthModalView, AuthUser } from "./modal";
import { useTranslations } from "@/lib/useTranslations";
import { LanguageContext } from "@/contexts/LanguageProvider";


function getSafeRedirectPath(value: string | null): string | null {
    if (!value) {
        return null;
    }

    if (!value.startsWith("/") || value.startsWith("//")) {
        return null;
    }

    return value;
}

function getFirstName(value: string): string {
    const parts = value.trim().split(/\s+/);
    return parts[0] || value;
}

type HeaderProps = {
    initialSessionUser?: AuthUser | null;
};

export default function Header({ initialSessionUser = null }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchInput, setIsSearchInput] = useState(false);
    const [activeAuthView, setActiveAuthView] = useState<AuthModalView | null>(null);
    const [sessionUser, setSessionUser] = useState<AuthUser | null>(initialSessionUser);
    const [isSessionLoading, setIsSessionLoading] = useState(false);
    const [postAuthRedirect, setPostAuthRedirect] = useState<string | null>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    const { t } = useTranslations();
    const languageCtx = useContext(LanguageContext)!;
    const { lang, setLang } = languageCtx;



    const canAccessPortal = Boolean(sessionUser?.isEnrolled);
    const firstName = sessionUser ? getFirstName(sessionUser.fullName) : "";

    const loadSession = useCallback(async () => {
        setIsSessionLoading(true);
        try {
            const response = await fetch("/api/auth/session", {
                method: "GET",
                cache: "no-store",
            });
            const payload = await response.json().catch(() => ({}));

            if (response.ok && payload?.ok) {
                if (payload?.user) {
                    setSessionUser(payload.user as AuthUser);
                    return;
                }
                setSessionUser(null);
            }
        } catch {
            // Keep current UI state on transient fetch/network failures.
        } finally {
            setIsSessionLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSession();
    }, [loadSession]);

    useEffect(() => {
        setIsUserMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (pathname !== "/portal") {
            setPostAuthRedirect(null);
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const authView = params.get("auth");
        const redirectPath = getSafeRedirectPath(params.get("redirect"));
        setPostAuthRedirect(redirectPath);

        if (sessionUser) {
            if (redirectPath) {
                router.replace(redirectPath);
                router.refresh();
            }
            return;
        }

        if (authView === "login" || authView === "signup") {
            setActiveAuthView(authView);
        }
    }, [pathname, router, sessionUser]);

    function handleSearchInput() {
        setIsSearchInput((current) => !current);
    }

    const toggleMenu = () => {
        setIsMenuOpen((current) => !current);
    };

    const goToPortal = () => {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
        router.push(canAccessPortal ? "/portal/dashboard" : "/apply");
    };

    const openPortalModal = (view: AuthModalView = "login") => {
        setPostAuthRedirect(null);

        if (sessionUser) {
            goToPortal();
            return;
        }

        setActiveAuthView(view);
        setIsMenuOpen(false);
    };

    const handleAuthSuccess = (user: AuthUser) => {
        setSessionUser(user);
        setActiveAuthView(null);
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);

        const nextPath = postAuthRedirect ?? (user.isEnrolled ? "/portal/dashboard" : "/apply");
        setPostAuthRedirect(null);
        router.push(nextPath);
        router.refresh();
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } catch {
            // Even if logout request fails, clear client-side auth state to avoid stale UI.
        }

        setSessionUser(null);
        setActiveAuthView(null);
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);

        if (pathname?.startsWith("/portal/dashboard")) {
            router.push("/portal");
        }
        router.refresh();
    };

    const menuItems = [
        { label: t('header.menu.programs'), href: "/program" },
        { label: t('header.menu.admissions'), href: "/admissions" },
        { label: t('header.menu.tuition'), href: "/tuition" },
        { label: t('header.menu.studentExperience'), href: "/studentExperience" },
        { label: t('header.menu.about'), href: "/about" },
    ];

    const topMenuItem = [
        { label: t('header.topMenu.governmentEmployees'), href: "/government-employees" },
        { label: t('header.topMenu.requestInfo'), href: "/request-info" },
        { label: t('header.topMenu.donations'), href: "/donations" },
        { label: t('header.topMenu.careers'), href: "/careers" },
    ];


    return (
        <header className="bg-white">
            <div className="bg-[#1E73BE]">
                {/* <div className="container py-2 flex justify-end gap-5 items-center">
                    {topMenuItem.map((topItem) => (
                        <Link
                            key={topItem.label}
                            href={topItem.href}
                            className="text-sm md:text-base font-medium text-white hover:opacity-75 transition-opacity duration-200 leading-6 align-center"
                        >
                            {topItem.label}
                        </Link>
                    ))}
                    <Link href="/apply" className="inline-flex">
                        <Button variant="white" className="px-4">{t('header.applyNow')}</Button>
                    </Link>

                </div> */}
<div className="container py-2 flex justify-end gap-5 items-center">
    {topMenuItem.map((topItem) => (
        <Link
            key={topItem.label}
            href={topItem.href}
            className={`text-sm md:text-base pb-1 font-medium text-white hover:opacity-75 hover:border-b-2 hover:pb-1 transition-opacity duration-200 leading-6 align-center ${
                pathname === topItem.href ? "active border-b-2 pb-1 border-white" : ""
            }`}
        >
            {topItem.label}
        </Link>
    ))}
    <Link href="/apply" className="inline-flex">
        <Button variant="white" className="px-4">{t('header.applyNow')}</Button>
    </Link>
</div>
            </div>

            <nav className="container md:py-5 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <img src="/austin-logo.png" width={210} alt="Austin Logo" />
                        </Link>
                    </div>

                    <div className="flex gap-5 items-center">
                        {/* <div className="hidden lg:block">
                            <div className="ml-10 flex space-x-5">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div> */}
                        <div className="hidden lg:block">
                            <div className="ml-10 flex space-x-5">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={`transition-colors duration-200 font-medium pb-1 ${
                                            pathname === item.href
                                                ? "text-[#1E73BE] border-b-2 border-[#1E73BE] pb-1"
                                                : "text-gray-700 hover:text-[#1E73BE] hover:border-b-2 hover:border-[#1E73BE] hover:pb-1"
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center space-x-3">
                            <div className="flex items-cente border border-[#33333340] rounded-lg justify-content-end">
                            <input
                                type="text"
                                placeholder={t('header.search')}
                                className={`outline-none text-gray-700 placeholder-gray-500 ${searchInput ? "w-full px-2.5 py-2" : "w-0 "}`}
                            />

                                <div className="cursor-pointer px-2.5 py-2" onClick={handleSearchInput}>
                                    {searchInput ? (
                                        <RxCross2 className="w-6 h-6 text-black" />
                                    ) : (
                                        <Search className="w-6 h-6 text-[#1E73BE]" />
                                    )}
                                </div>
                            </div>

                            {/* Language Switch */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsLangMenuOpen((prev) => !prev)}
                                    className="flex items-center gap-2 rounded-lg border border-[#1E73BE4D] bg-white px-3 py-2 text-left transition-colors hover:bg-gray-50"
                                >
                                    <span className="text-sm font-medium">{t(`languages.${lang}`)}</span>
                                    <ChevronDown className={`h-4 w-4 text-[#1E73BE] transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`} />
                                </button>
                                {isLangMenuOpen && (
                                    <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-32 rounded-lg border border-[#E4E4E4] bg-white p-2 shadow-md">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLang('en');
                                                setIsLangMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100"
                                        >
                                            {t('languages.en')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setLang('fr');
                                                setIsLangMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100"
                                        >
                                            {t('languages.fr')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {sessionUser ? (

                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsUserMenuOpen((current) => !current)}
                                        className="flex min-w-[260px] items-center gap-2 rounded-lg border border-[#1E73BE4D] bg-white px-3 py-2 text-left"
                                    >
                                        <CircleUserRound className="h-8 w-8 text-[#1E73BE]" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[14px] font-semibold text-[#1D1D1D]">{firstName}</span>
                                            <span className="block truncate text-[12px] text-[#5F5F5F]">{sessionUser.email}</span>
                                        </span>
                                        <ChevronDown className={`h-4 w-4 text-[#1E73BE] transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {isUserMenuOpen ? (
                                        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[280px] rounded-lg border border-[#E4E4E4] bg-white p-3 shadow-md">
                                            <div className="flex items-center gap-2 rounded-md bg-[#F6F9FD] px-3 py-2">
                                                <CircleUserRound className="h-8 w-8 text-[#1E73BE]" />
                                                <span className="min-w-0">
                                                    <span className="block truncate text-[14px] font-semibold text-[#1D1D1D]">{firstName}</span>
                                                    <span className="block truncate text-[12px] text-[#5F5F5F]">{sessionUser.email}</span>
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={goToPortal}
                                                className="mt-3 w-full rounded-md border border-[#1E73BE] px-3 py-2 text-[14px] font-medium text-[#1E73BE] transition-colors duration-200 hover:bg-[#1E73BE] hover:text-white"
                                            >
                                                {t('header.portal')}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isSessionLoading}
                                                onClick={() => {
                                                    void handleLogout();
                                                }}
                                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-[#1E73BE] px-3 py-2 text-[14px] font-medium text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                {t('header.logOut')}
                                            </button>

                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                        <Button onClick={() => openPortalModal("login")}>{t('header.portal')}</Button>

                            )}
                        </div>
                    </div>

                    <div className="lg:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="lg:hidden pb-4">
                        <div className="flex flex-col space-y-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-4 flex flex-col space-y-3 border-t pt-4">
                            <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
                                <input
                                    type="text"
                                    placeholder={t('header.search')}
                                    className="bg-gray-100 outline-none text-gray-700 placeholder-gray-500 flex-1"
                                />

                            <Search className="w-5 h-5 text-gray-500 ml-2" />
                            </div>

                            {/* Mobile Language Switch */}
                            <div className="relative mt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsLangMenuOpen((prev) => !prev)}
                                    className="flex items-center justify-between w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    <span>{t(`languages.${lang}`)}</span>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`} />
                                </button>
                                {isLangMenuOpen && (
                                    <div className="absolute left-0 top-[calc(100%+4px)] z-20 w-full bg-white border border-gray-200 rounded-lg shadow-md p-2">
                                        <button
                                            onClick={() => {
                                                setLang('en');
                                                setIsLangMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                                        >
                                            {t('languages.en')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setLang('fr');
                                                setIsLangMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                                        >
                                            {t('languages.fr')}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {sessionUser ? (

                                <div className="rounded-lg border border-[#1E73BE40] p-3">
                                    <div className="flex items-center gap-2">
                                        <CircleUserRound className="h-8 w-8 text-[#1E73BE]" />
                                        <div className="min-w-0">
                                            <p className="truncate text-[14px] font-semibold text-[#1D1D1D]">{firstName}</p>
                                            <p className="truncate text-[12px] text-[#5F5F5F]">{sessionUser.email}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 space-y-2">
                                        <button
                                            type="button"
                                            onClick={goToPortal}
                                            className="w-full rounded-lg border border-[#1E73BE] px-4 py-2 text-center text-[14px] font-medium text-[#1E73BE]"
                                        >
                                            {t('header.portal')}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleLogout();
                                            }}
                                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-blue-700"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {t('header.logOut')}
                                        </button>

                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => openPortalModal("login")}
                                    className="w-full cursor-pointer rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
                                >
                                    {t('header.portal')}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <Modal
                isOpen={activeAuthView !== null}
                view={activeAuthView ?? "login"}
                onClose={() => setActiveAuthView(null)}
                onViewChange={setActiveAuthView}
                onAuthSuccess={handleAuthSuccess}
            />
        </header>
    );
}
