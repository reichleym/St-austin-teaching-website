import { IoIosCheckmarkCircleOutline } from "react-icons/io";

export default function CheckList({ className, listContent, classNamecheckboxList }: { className?: string; listContent: string[]; classNamecheckboxList?: string }) {
        return (
            <>
            <div className={`space-y-5 ${className || ''}`}>
                {listContent.map((item, index) => (
                        <div className={`flex items-center gap-2 bg-white ${classNamecheckboxList || ''}`} key={index}>
                        <IoIosCheckmarkCircleOutline className="text-black" size={24} />
                        <p>{item}</p>
                    </div>
                ))}
            </div>
            </>
        );
}