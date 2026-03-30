export default function LearnSomething() {
    const valueCards = [
        {
            value: "15,000+",
            title: "Graduates"
        },
        {
            value: "92%",
            title: "Placement Rate"
        },
        {
            value: "50+",
            title: "Programs"
        },
        {
            value: "4.8/5",
            title: "Graduates"
        }
    ];
    return (
        <div className="bg-[#F9F9F9] md:py-25 py-15">
            <div className="container">
                <div className="">
                    <div className="">
                        <h2 className="md:text-[50px] text-4xl font-bold mb-2.5 leading-tight">Learn Something New With St. Austin</h2>
                        <p className="mb-7">St. Austin helps learners around the world grow their skills and careers. Join our learning community today!</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 mt-10 md:gap-6 gap-4">
                        {valueCards.map((card, index) => (
                            <div className="text-center px-2 py-8 bg-white rounded-[10px] border-b-6 border-[#1E73BE]" key={index}>
                                <div className="lg:text-6xl text-4xl text-[#1E73BE] font-semibold mb-4 italic">{card.value}</div>
                                <p className="text-xl font-medium">{card.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}   