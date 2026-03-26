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
            <div className="container py-17 flex-1">
                <div className="max-w-lg mx-auto">
                    <div className="text-white">
                        <h2 className="text-4xl font-bold mb-2.5">Your Learning Experience</h2>
                        <p className="mb-7">Our integrated learning platform connects you with everything you need — assignments, discussions, messaging, and more.</p>
                    </div>
                    <div className="space-y-4">
                        {cardItems.map((item, index) => (
                            <div className="bg-white p-4 rounded-[10px]" key={index}>
                                <div className="flex items-center">
                                    <div className="text-4xl mr-5">
                                        <img src={item.icon} alt={item.title} />
                                    </div>
                                    <div className="">
                                        <h3 className="font-semibold mb-1">{item.title}</h3>
                                        <p>{item.description}</p>
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