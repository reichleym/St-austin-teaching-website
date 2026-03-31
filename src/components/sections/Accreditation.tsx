export default function Accreditation({ blockContent, title, description, className, classNameCard }: { blockContent: { cardTitle: string; cardDescription: string; icon: string; }[]; title: string; className?: string; classNameCard?: string; description?: string }) {
    return (
        <section className={`py-25 ${className || ''}`}>
            <div className="container">
                <div className="flex flex-col items-center text-center mb-[50px]">
                    <h2 className="text-3xl font-bold">{title}</h2>
                    {description && (
                        <p className="mt-3 text-gray-600 max-w-[600px]">
                            {description}
                        </p>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
                    {blockContent.map((block, index) =>
                        <div className={`flex flex-col rounded-[8px] ${classNameCard || 'border border-[#33333340] p-[30px]'}`} key={index}>
                            <img src={block.icon} alt={block.cardTitle} className="bg-[#1E73BE] mb-2 rounded-[4px] w-[60px] p-[10px]" />
                            <h3 className="text-xl font-bold mt-[20px] mb-[10px]">{block.cardTitle}</h3>
                            <p className="text-gray-600">{block.cardDescription}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
