import Link from "next/link";
import Button from "../Button"

const cardItems = [
    {
        icon: "/wedding-certificate.svg",
        title: "Accredited & Recognized",
        description: "Nationally accredited institution with programs recognized by industry leaders."
    },
    {
        icon: "/global-learning.svg",
        title: "Flexible Learning Options",
        description: "Study online or on-campus with schedules designed for working professionals."
    },
    {
        icon: "/workspace-premium.svg",
        title: "Career-Focused",
        description: "92% placement rate with dedicated career services and industry partnerships."
    },
    {
        icon: "/award-trophy.svg",
        title: "Expert Faculty",
        description: "Learn from industry practitioners and accomplished researchers."
    }
]

export default function WhyAustin({ whiteCards = cardItems, secTitle = "Why St. Austin?", whyAustinDesc, button }: { whiteCards?: { icon: string; title: string; description: string; }[]; secTitle?: string; whyAustinDesc?: React.ReactNode | string | null; button?: React.ReactNode }) {
    return (
        <div className="bg-[#1E73BE] md:py-25 py-15">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 items-center">
                    <div className="text-white lg:col-span-3">
                        <h2 className="text-4xl md:text-[50px] font-bold mb-2.5 leading-tight">{secTitle}</h2>
                        {whyAustinDesc && <p className="mb-7">Discover the St. Austin difference with our commitment to excellence, flexibility, and career success.</p>}
                        {button && <Link href='/about' className="inline-block"><Button variant="white">Learn More</Button></Link>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-5">
                        {whiteCards.map((item, index) => (
                            <div className="bg-white p-5 rounded-[10px]" key={index}>
                                <div className="flex items-center mb-2.5">
                                    <div className="text-4xl mr-2.5">
                                        <img src={item.icon} alt={item.title} width={60} />
                                    </div>
                                    <div className="text-xl font-semibold">{item.title}</div>
                                </div>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}