import { cn } from "@/lib/utils"
import IconCard from "../IconCard";


export default function Accreditation({ title, description, className, blockContent, classNameCard }: { title: string; description?: string; className?: string;classNameCard?: string; blockContent: { cardTitle: string; cardDescription: string; icon: string; }[] }) {
    return (
        <section className={cn("md:py-25 py-15", className || '')}>
            <div className="container">
                <div className="flex flex-col items-center text-center mb-[50px]">
                    <h2 className="text-3xl md:text-[50px] font-bold">{title}</h2>
                    {description && (
                        <p className="mt-3">
                            {description}
                        </p>
                    )}
                </div>
                <IconCard blockContent={blockContent} className={cn("items-center text-center md:gap-y-12 md:gap-x-20", classNameCard)} />
            </div>
        </section>
    );
}
