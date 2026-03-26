export default function StepsSection({ stepsContent, title }: { stepsContent: { cardTitle: string; cardDescription: string; stepNum: string; }[]; title: string; }) {
    return (
        <section className="py-25">
            <div className="container">
                <div className="flex flex-col items-center text-center mb-12">
                    <h2 className="text-3xl font-bold">{title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {stepsContent.map((steps, index) =>
                        <div className="text-center flex flex-col items-center gap-[10px]" key={index}>
                            <span className="bg-[#1E73BE] text-white rounded-[6px] w-11 font-semibold h-11 flex items-center justify-center mb-2">{steps.stepNum}</span>
                            <h3 className="text-xl font-bold">{steps.cardTitle}</h3>
                            <p className="text-gray-600">{steps.cardDescription}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}