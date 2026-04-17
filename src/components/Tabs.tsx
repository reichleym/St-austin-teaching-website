"use client";

import { useMemo, useState } from "react";

interface Tab {
    id: string;
    label: string;
    content: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    defaultActiveTab?: string;
}

export default function Tabs({ tabs, defaultActiveTab }: TabsProps) {
    const tabIds = useMemo(() => tabs.map((tab) => tab.id), [tabs]);
    const defaultTabId = defaultActiveTab && tabIds.includes(defaultActiveTab) ? defaultActiveTab : tabIds[0] ?? "";
    const [activeTabId, setActiveTabId] = useState(defaultTabId);
    const resolvedActiveTabId = tabIds.includes(activeTabId) ? activeTabId : defaultTabId;

    if (!tabs || tabs.length === 0) {
        return null;
    }

    return (
        <>
            <ul className="flex border-b border-[#33333340] mb-5">
                {tabs.map((tab) =>
                    <li key={tab.id} className="mb-[-2px]">
                        <button
                            className={`font-medium py-2.5 md:px-4 px-2 leading-tight border-b-3 transition-colors duration-200 cursor-pointer ${
                                resolvedActiveTabId === tab.id
                                    ? 'text-black border-black'
                                    : 'text-gray-600 hover:text-gray-800 hover:border-black border-transparent'
                            }`}
                            onClick={() => setActiveTabId(tab.id)}
                        >
                            {tab.label}
                        </button>
                    </li>
                )}
            </ul>
            <div className="relative">
                {tabs.map((tab) => (
                    <div key={tab.id} className={`transition-opacity duration-400 ${resolvedActiveTabId === tab.id ? 'opacity-100' : 'opacity-0 absolute top-0 left-0 w-full -z-10'}`}>
                        {tab.content}
                    </div>
                ))}
            </div>
        </>
    );
}   
