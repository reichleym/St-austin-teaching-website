import { RxQuote } from "react-icons/rx";


export default function CarouselDemo() {
    const testimonial = [
        {
            name: "John Doe",
            role: "Software Engineer",
            content: '"St. Austin gave me the flexibility to earn my MBA while working full-time. The online platform was seamless, and the faculty were incredibly supportive."',
            img: "/testimonial-img.jpg"
        },
        {
            name: "John Doe",
            role: "Software Engineer",
            content: '"St. Austin gave me the flexibility to earn my MBA while working full-time. The online platform was seamless, and the faculty were incredibly supportive."',
            img: "/testimonial-img.jpg"
        },
        {
            name: "John Doe",
            role: "Software Engineer",
            content: '"St. Austin gave me the flexibility to earn my MBA while working full-time. The online platform was seamless, and the faculty were incredibly supportive."',
            img: "/testimonial-img.jpg"
        },
        {
            name: "John Doe",
            role: "Software Engineer",
            content: '"St. Austin gave me the flexibility to earn my MBA while working full-time. The online platform was seamless, and the faculty were incredibly supportive."',
            img: "/testimonial-img.jpg"
        }
    ];
  return (
    <section className="md:py-25 py-15">
        <div className="container">
            <div className="mb-12">
                <h2 className="md:text-[50px] text-4xl font-bold mb-2.5 leading-tight">See What Learners Are Achieving</h2>
                <p className="leading-tight">See how the right learning path turns ambition into achievement.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {
                    testimonial.map((testimonial, index) => (
                        <div className="bg-[#F2F5FA] p-5 rounded-[10px] mb-5 min-h-[340px] flex flex-col justify-between" key={index}>
                            <div className="">
                                <RxQuote size={40} className="mb-5 text-[#1E73BE]" />
                                <p className="text-xl leading-tight italic">{testimonial.content}</p>
                            </div> 
                            <div className="flex gap-4 items-center mt-4 border-t border-[#33333340] pt-5">
                                <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                                    <img src={testimonial.img} alt={testimonial.name} className="h-full w-full object-cover object-center" />
                                </div>
                                <div className="">
                                    <div className="font-semibold text-lg mb-1 leading-tight">{testimonial.name}</div>
                                    <p className="text-[16px]">{testimonial.role}</p>
                                </div>
                            </div>  
                        </div>
                    ))
                }
            </div>
        </div>
    </section>
  )
}
