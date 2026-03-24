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
        <div className="bg-[#F9F9F9] py-25">
            <div className="container">
                <div className="">
                    <div className="">
                        <h2 className="text-4xl font-bold mb-2.5">Learn Something New With St. Austin</h2>
                        <p className="mb-7">St. Austin helps learners around the world grow their skills and careers. Join our learning community today!</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 mt-10 gap-5">
                        {valueCards.map((card, index) => (
                            <div className="text-center px-5 py-10 bg-white rounded-[10px]" key={index}>
                                <h3 className="text-4xl text-[#1E73BE] font-semibold mb-2.5 italic">{card.value}</h3>
                                <p className="font-medium">{card.title}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}   