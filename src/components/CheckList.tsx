import { IoIosCheckmarkCircleOutline } from "react-icons/io";

export default function CheckList({ className, listContent }: { className?: string; listContent: string[] }) {
        return (
            <>
            <div className={`space-y-5 ${className || ''}`}>
                {listContent.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-[14px] bg-white">
                        <IoIosCheckmarkCircleOutline className="text-black" size={24} />
                        <p>{item}</p>
                    </div>
                ))}
            </div>
            </>
        );
}