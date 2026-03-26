import { IoIosCheckmarkCircleOutline } from "react-icons/io";

export default function CheckList({ className, listContent }: { className?: string; listContent: string[] }) {
        return (
            <>
            <div className={`${className || ''}`}>
                {listContent.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 border border-[#1E73BE] font-medium rounded p-[14px] bg-white">
                        <IoIosCheckmarkCircleOutline className="text-[#1E73BE]" size={24} />
                        <p>{item}</p>
                    </div>
                ))}
            </div>
            </>
        );
}