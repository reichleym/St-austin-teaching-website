export default function Accreditation({ blockContent, title }: { blockContent: { cardTitle: string; cardDescription: string; icon: string; }[]; title: string; }) {
    return (
        <section className="py-25">
            <div className="container">
                <div className="flex flex-col items-center text-center mb-[50px]">
                    <h2 className="text-3xl font-bold">{title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
                    {blockContent.map((block, index) =>
                        <div className="border border-[#33333340] flex flex-col p-[30px] rounded-[8px]" key={index}>
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
