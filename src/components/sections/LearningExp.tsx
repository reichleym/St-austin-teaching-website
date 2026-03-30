import Button from "../Button"

const cardItems = [
    {
        icon: "/assignments.svg",
        title: "Assignments",
        description: "Submit and track assignments with real-time feedback"
    },
    {
        icon: "/group-discussion-meeting.svg",
        title: "Discussions",
        description: "Engage with peers and faculty in topic forums"
    },
    {
        icon: "/live-tv.svg",
        title: "Live Classes",
        description: "Attend interactive sessions from anywhere"
    }
]

export default function LearningExp() {
    return (
        <div className="bg-[#1E73BE] md:flex flex-wrap">
            <div className="flex-1 md:order-2">
                <img src="/learning-exp-img.jpg" className="h-full object-cover" alt="" />
            </div>
            <div className="container md:py-25 py-15 flex-1">
                <div className="max-w-xl mx-auto">
                    <div className="text-white mb-10">
                        <h2 className="md:text-[50px] text-4xl font-bold mb-2.5 leading-tight">Your Learning Experience</h2>
                        <p className="leading-tight">Our integrated learning platform connects you with everything you need — assignments, discussions, messaging, and more.</p>
                    </div>
                    <div className="space-y-5">
                        {cardItems.map((item, index) => (
                            <div className="bg-white p-5 rounded-[10px]" key={index}>
                                <div className="flex items-center">
                                    <div className="text-4xl mr-5">
                                        <img src={item.icon} alt={item.title} />
                                    </div>
                                    <div className="">
                                        <div className="font-semibold text-xl mb-2 leading-tight">{item.title}</div>
                                        <p className="leading-tight">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}