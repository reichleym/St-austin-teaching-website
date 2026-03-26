"use client";
import { useState } from "react";
import { FaAngleUp } from "react-icons/fa6";
import { FaAngleDown } from "react-icons/fa6";

export default function Accordions({ className, accordionsContent }: { className?: string; accordionsContent: { title: string; description: string; }[] }) {

    const[activeAccordion, setActiveAccordion] = useState<number | null>(null);

    function handleAccordionClick(index: number) {
        setActiveAccordion((prev) => prev === index ? null : index);
    }

    return (
        <div className={`space-y-5 ${className || ''}`}>
            {accordionsContent.map((accordion, index) => (
                <div key={index} className={`p-7 bg-white rounded-[10px] border border-[#33333340] ${activeAccordion === index ? 'open' : ''}`} onClick={() => handleAccordionClick(index)}>
                    <div className="cursor-pointer text-[16px] font-semibold flex items-center gap-5 justify-between">{accordion.title} {activeAccordion === index ? <FaAngleUp size={20} /> : <FaAngleDown size={20} />}</div>
                    <p className={`mt-7 pt-4 border-t border-[#33333340] ${activeAccordion === index ? 'block' : 'hidden'}`} >{accordion.description}</p>
                </div>
            ))}
        </div>
    );
}