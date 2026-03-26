'use client';

import { useState } from 'react';
import { Menu, X, Search } from 'lucide-react';
import Button from './Button';
import { RxCross2 } from "react-icons/rx";
import Link from 'next/link';


export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchInput, setIsSearchInput] = useState(false);

    function handleSearchInput() {
        setIsSearchInput((searchInput) => !searchInput);
    }

    const toggleMenu = () => {
        setIsMenuOpen((isMenuOpen) => !isMenuOpen);
    };

    const menuItems = [
        { label: 'Programs', href: '/program' },
        { label: 'Admissions', href: '/admissions' },
        { label: 'Tuition & Aid', href: '#' },
        { label: 'Student Experience', href: '#' },
        { label: 'About', href: '#' },
    ];
    const topMenuItem = [
        { label: 'Government Employees', href: '#' },
        { label: 'Request Info', href: '#' },
        { label: 'Visit/Talk to Advisor', href: '#' },
    ];

    return (
        <header className="bg-white">
            <div className="bg-[#1E73BE]">
                <div className="container py-2 flex justify-end gap-5 items-center">
                    {
                        topMenuItem.map((topItem) =>(
                            <Link key={topItem.label} href={topItem.href} className='className="text-sm text-white hover:opacity-75 transition-opacity duration-200 leading-6"'>{topItem.label}</Link>
                        ))
                    }
                    <Button variant="white" className='px-4'>Apply Now</Button>
                </div>
            </div>
            <nav className="container md:py-5 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo - Left Side */}
                    <div className="flex-shrink-0">
                        <a href="/" className="">
                            <img src="/austin-logo.png" width={210} alt="Austin Logo" />
                        </a>
                    </div>


                    <div className="flex gap-5 items-center">
                        {/* Menu - Middle (Hidden on mobile) */}
                        <div className="hidden lg:block">
                            <div className="ml-10 flex space-x-5">
                                {menuItems.map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Search and Portal Button - Right Side (Hidden on mobile) */}
                        <div className="hidden lg:flex items-center space-x-3">
                            <div className="flex items-cente border border-[#33333340] rounded-lg justify-content-end" >
                                <input type="text" placeholder="Search..." className={`outline-none text-gray-700 placeholder-gray-500 ${searchInput ? 'w-full px-2.5 py-2' : 'w-0 '}`} />
                                <div className="cursor-pointer px-2.5 py-2" onClick={handleSearchInput}>
                                    {searchInput ?<><RxCross2 className="w-6 h-6 text-black"/></> : <Search className="w-6 h-6 text-[#1E73BE]"/>}
                                </div>
                            </div>
                            <Button>Portal</Button>
                        </div>
                    </div>

                    {/* Hamburger Menu - Mobile */}
                    <div className="lg:hidden">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden pb-4">
                        <div className="flex flex-col space-y-2">
                            {menuItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    {item.label}
                                </a>
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
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200">
                                Portal
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}