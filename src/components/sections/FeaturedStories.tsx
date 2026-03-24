const StoriesContent = [
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profile: "Nursing Assistant" },
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profile: "Nursing Assistant" },
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profile: "Nursing Assistant" },
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profile: "Nursing Assistant" },
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profile: "Nursing Assistant" },
    { img: "/Jerome Bell.jpg", name: "Jerome Bell", profile: "Nursing Assistant" }
];


export default function FeaturedStories() {
    return (
        <>
            <section className="py-25 bg-[#F9F9F9]">
                <div className="container-fluid max-w-[2000px]">
                    <div className="mb-10 text-center">
                        <h2 className="font-semibold text-4xl mb-2.5">Featured Stories</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
                        {StoriesContent.map((card, index) => (
                            <div key={index} className="bg-white rounded-[10px] shadow-md relative overflow-hidden h-[340px]">
                                <div className="absolute h-full w-full left-0 top-0" style={{background: 'linear-gradient(180deg, rgba(115, 137, 158, 0) 50%, #73899E 100%);'}}></div>
                                <img src={card.img} alt={card.name} className="w-full h-full object-cover" />
                                <div className="p-5 absolute bottom-0 left-0 w-full text-white">
                                    <h3 className="font-semibold text-md mb-1">{card.name}</h3>
                                    <p className="text-sm">{card.profile}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}