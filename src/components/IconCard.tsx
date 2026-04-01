import { cn } from "@/lib/utils"

export default function IconCard({blockContent, classNameCard, className }: { blockContent: { cardTitle: string; cardDescription: string; icon: string; }[]; classNameCard?: string; className?: string }) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
            {blockContent.map((block, index) =>
                <div className={cn("flex flex-col rounded-lg", classNameCard || "items-center")} key={index}>
                    <img src={block.icon} alt={block.cardTitle} className="bg-[#1E73BE] rounded w-15 p-[10px]" />
                    <h4 className="text-[22px] leading-tight font-semibold mt-[20px] mb-[10px]">{block.cardTitle}</h4>
                    <p className="">{block.cardDescription}</p>
                </div>
            )}
        </div>
    );
}