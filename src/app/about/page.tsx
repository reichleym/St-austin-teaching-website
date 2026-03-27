
import BannerSection from "@/components/sections/BannerSection";
import CtaSection from "@/components/CtaSection";
import Accreditation from "@/components/sections/Accreditation";
export default function AboutPage() {
    const bannerContent = {
        title: "About St. Austin",
        description: "A legacy of academic excellence, innovation, and commitment to student success since 1985.",
        bgImg: "/bannerImg.jpg"
    }


    const blockContent = [
        {
            cardTitle: "National Board of Higher Education",
            cardDescription: "National Board of Higher Education",
            icon: "/awards-icon.png"
        },
        {
            cardTitle: "Business Programs",
            cardDescription: "International accreditation for business programs",
            icon: "/business-icon.png"
        },
        {
            cardTitle: "Nursing Programs",
            cardDescription: "Commission on Collegiate Nursing Education",
            icon: "/nursing-icon.png"
        },
    ]

    const teamMembers = [
  {
    name: "Dr. Margaret Chen",
    role: "President",
    image: "/team1.jpg",
    description:
      "Dr. Chen brings over 25 years of academic leadership experience and a vision for accessible, career-oriented education.",
  },
  {
    name: "Dr. Robert Williams",
    role: "Provost & VP of Academic Affairs",
    image: "/team1.jpg",
    description: "A distinguished scholar in educational innovation, Dr. Williams oversees curriculum development and academic quality.",
  },
  {
    name: "Dr. Amara Osei",
    role: "Dean of Student Affairs",
    image: "/team1.jpg",
    description: "Dr. Osei is passionate about student success and leads initiatives in mentorship, career services, and community building.",
  },
  {
    name: "Prof. David Nakamura",
    role: "Dean of Technology",
    image: "/team1.jpg",
    description: "Prof. Nakamura drives the university's technology programs and digital learning infrastructure with industry expertise.",
  },
];


    return (
        <>
            <BannerSection {...bannerContent} >
            </BannerSection>
            <section className="py-25">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-10 items-center">
                        <div className="md:col-span-1">
                            <h2 className="text-3xl font-bold mb-[10px]">Our History</h2>
                            <p className="text-lg">Founded in 1985, St. Austin University began as a small college dedicated to business education. Over four decades, we have grown into a comprehensive university offering over 50 programs across multiple disciplines.
                                <br></br>Our commitment to flexibility and innovation led us to become one of the first institutions to offer fully online degree programs, making quality education accessible to students worldwide.</p>
                        </div>
                        <div className="md:col-span-1">
                            <img src="cta-img.png" className="max-w-[500px] ml-auto h-full max-h-[400px] object-cover rounded-[8px]" alt="" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-25 bg-[#F5F5F5]">
                <div className="container">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="md:col-span-1">
                            <h2 className="text-3xl font-bold mb-[10px]">Our Mission</h2>
                            <p className="text-lg">To provide accessible, career-focused education that empowers individuals to achieve professional excellence and contribute meaningfully to their communities. We are committed to innovative teaching, rigorous scholarship, and inclusive learning.</p>
                        </div>
                        <div className="md:col-span-1">
                            <h2 className="text-3xl font-bold mb-[10px]">Our Vision</h2>
                            <p className="text-lg">To be a leading institution recognized for transforming lives through education, fostering innovation, and preparing graduates who drive positive change in the global workforce.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Accreditation blockContent={blockContent} title="Accreditation" classNameCard="border border-[#33333340] p-[30px]" />

            <section className="pb-25">
                <div className="container">
                     <div className="flex flex-col items-center text-center mb-[50px]">
                        <h2 className="text-3xl font-bold">Leadership Team</h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {teamMembers.map((member, index) => (
                            <div
                                key={index}
                                className="card rounded-lg border border-[#F5F5F5] bg-[#F5F5F5] overflow-hidden"
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-[322px] h-[322px] object-cover"
                                />
                                <div className="p-5 bg-[#F5F5F5]">
                                    <h4 className="font-semibold mb-[5px] text-[22px]">
                                        {member.name}
                                    </h4>
                                    <h5 className="text-lg font-medium mb-[10px] text-[#1E73BE]">
                                        {member.role}
                                    </h5>
                                    <p className="text-lg">{member.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <CtaSection />
        </>
    );
}