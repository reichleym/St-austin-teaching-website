"use client";

import { useState } from "react";

interface Tab {
    label: string;
    content: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    defaultActiveTab?: string;
}

export default function Tabs({ tabs, defaultActiveTab }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultActiveTab || (tabs && tabs.length > 0 ? tabs[0].label : ''));

    if (!tabs || tabs.length === 0) {
        return null;
    }

    return (
        <>
            <ul className="flex border-b border-[#33333340] mb-5">
                {tabs.map((tab) =>
                    <li key={tab.label} className="mb-[-2px]">
                        <button
                            className={`font-medium py-2.5 md:px-4 px-2 leading-tight border-b-3 transition-colors duration-200 cursor-pointer ${
                                activeTab === tab.label
                                    ? 'text-black border-black'
                                    : 'text-gray-600 hover:text-gray-800 hover:border-black border-transparent'
                            }`}
                            onClick={() => setActiveTab(tab.label)}
                        >
                            {tab.label}
                        </button>
                    </li>
                )}
            </ul>
            <div className="relative">
                {tabs.map((tab) => (
                    <div key={tab.label} className={`transition-opacity duration-400 ${activeTab === tab.label ? 'opacity-100' : 'opacity-0 absolute top-0 left-0 w-full -z-10'}`}>
                        {tab.content}
                    </div>
                ))}
            </div>
        </>
    );
}   