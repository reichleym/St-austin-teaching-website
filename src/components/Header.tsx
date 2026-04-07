'use client';

import { useCallback, useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { RxCross2 } from "react-icons/rx";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Button from "./Button";
import Modal, { AuthModalView, AuthUser } from "./modal";

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchInput, setIsSearchInput] = useState(false);
    const [activeAuthView, setActiveAuthView] = useState<AuthModalView | null>(null);
    const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
    const [isSessionLoading, setIsSessionLoading] = useState(true);

    const loadSession = useCallback(async () => {
        setIsSessionLoading(true);
        try {
            const response = await fetch("/api/auth/session", {
                method: "GET",
                cache: "no-store",
            });
            const payload = await response.json().catch(() => ({}));
            if (response.ok && payload?.ok && payload?.user) {
                setSessionUser(payload.user as AuthUser);
            } else {
                setSessionUser(null);
            }
        } catch {
            setSessionUser(null);
        } finally {
            setIsSessionLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadSession();
    }, [loadSession]);

    function handleSearchInput() {
        setIsSearchInput((current) => !current);
    }

    const toggleMenu = () => {
        setIsMenuOpen((current) => !current);
    };

    const openPortalModal = (view: AuthModalView = "login") => {
        if (sessionUser) {
            setIsMenuOpen(false);
            router.push("/portal/dashboard");
            return;
        }

        setActiveAuthView(view);
        setIsMenuOpen(false);
    };

    const handleAuthSuccess = (user: AuthUser) => {
        setSessionUser(user);
        setActiveAuthView(null);
        setIsMenuOpen(false);
        router.push("/portal/dashboard");
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

        if (pathname?.startsWith("/portal/dashboard")) {
            router.push("/portal");
        }
        router.refresh();
    };

    const menuItems = [
        { label: "Programs", href: "/program" },
        { label: "Admissions", href: "/admissions" },
        { label: "Tuition & Aid", href: "/tuition" },
        { label: "Student Experience", href: "/studentExperience" },
        { label: "About", href: "/about" },
    ];

    const topMenuItem = [
        { label: "Government Employees", href: "/government-employees" },
        { label: "Request Info", href: "#" },
        { label: "Donations", href: "/donations" },
    ];

    return (
        <header className="bg-white">
            <div className="bg-[#1E73BE]">
                <div className="container py-2 flex justify-end gap-5 items-center">
                    {topMenuItem.map((topItem) => (
                        <Link
                            key={topItem.label}
                            href={topItem.href}
                            className="text-sm md:text-base font-medium text-white hover:opacity-75 transition-opacity duration-200 leading-6 align-center"
                        >
                            {topItem.label}
                        </Link>
                    ))}
                    <Button variant="white" className="px-4">Apply Now</Button>
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
                        <div className="hidden lg:block">
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
                        </div>

                        <div className="hidden lg:flex items-center space-x-3">
                            <div className="flex items-cente border border-[#33333340] rounded-lg justify-content-end">
                                <input
                                    type="text"
                                    placeholder="Search..."
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

                            {sessionUser ? (
                                <>
                                    <Link
                                        href="/portal/dashboard"
                                        className="rounded-[5px] border border-[#1E73BE] px-4 py-2 text-[16px] font-medium text-[#1E73BE] transition-colors duration-200 hover:bg-[#1E73BE] hover:text-white"
                                    >
                                        Dashboard
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isSessionLoading}
                                        onClick={() => {
                                            void handleLogout();
                                        }}
                                    >
                                        Log Out
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={() => openPortalModal("login")}>Portal</Button>
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
                                    placeholder="Search..."
                                    className="bg-gray-100 outline-none text-gray-700 placeholder-gray-500 flex-1"
                                />
                                <Search className="w-5 h-5 text-gray-500 ml-2" />
                            </div>

                            {sessionUser ? (
                                <>
                                    <Link
                                        href="/portal/dashboard"
                                        className="w-full rounded-lg border border-[#1E73BE] px-6 py-2 text-center font-medium text-[#1E73BE]"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void handleLogout();
                                        }}
                                        className="w-full cursor-pointer rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
                                    >
                                        Log out
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => openPortalModal("login")}
                                    className="w-full cursor-pointer rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700"
                                >
                                    Portal
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
