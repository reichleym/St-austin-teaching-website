import { IoIosCheckmarkCircleOutline } from "react-icons/io";

export default function CheckList({ className, listContent, classNamecheckboxList }: { className?: string; listContent: string[]; classNamecheckboxList?: string }) {
    return (
        <>
            <div className={`space-y-5 ${className || ""}`}>
                {listContent.map((item, index) => (
                    <div
                        className={`flex items-center gap-4 border border-[#1E73BE] font-medium rounded bg-white ${classNamecheckboxList || "p-[14px]"}`}
                        key={`${item}-${index}`}
                    >
                        <IoIosCheckmarkCircleOutline className="text-[#1E73BE]" size={24} />
                        <p>{item}</p>
                    </div>
                ))}
            </div>
        </>
    );
}
