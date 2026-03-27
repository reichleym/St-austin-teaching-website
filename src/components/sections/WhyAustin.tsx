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

export default function WhyAustin({ whiteCards = cardItems, secTitle = "Why Choose St. Austin?", whyAustinDesc, button }: { whiteCards?: { icon: string; title: string; description: string; }[]; secTitle?: string; whyAustinDesc?: React.ReactNode | string | null; button?: React.ReactNode }) {
    return (
        <div className="bg-[#1E73BE] py-12">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="text-white">
                        <h2 className="text-4xl font-bold mb-2.5">{secTitle}</h2>
                        {whyAustinDesc && <p className="mb-7">Discover the St. Austin difference with our commitment to excellence, flexibility, and career success.</p>}
                        {button && <Link href='/about'><Button variant="white">Learn More</Button></Link>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 col-span-2">
                        {whiteCards.map((item, index) => (
                            <div className="bg-white p-4 rounded-[10px]" key={index}>
                                <div className="flex items-center mb-2.5">
                                    <div className="text-4xl mr-2.5">
                                        <img src={item.icon} alt={item.title} />
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