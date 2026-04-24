import { cn } from "@/lib/utils";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

export default function CheckList({ className, listContent, classNamecheckboxList }: { className?: string; listContent: string[]; classNamecheckboxList?: string }) {
    return (
        <>
            <div className={cn("", className)}>
                {listContent.map((item, index) => (
                    <div
                        className={cn("flex items-center gap-3 font-medium bg-white rounded", classNamecheckboxList)}
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
