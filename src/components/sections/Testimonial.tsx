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
    <section className="py-20">
        <div className="container">
            <div className="">
                <h2 className="text-4xl font-bold mb-2.5">Learn Something New With St. Austin</h2>
                <p className="mb-7">St. Austin helps learners around the world grow their skills and careers. Join our learning community today!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {
                    testimonial.map((testimonial, index) => (
                        <div className="bg-[#F2F5FA] p-4 rounded-[10px] mb-5 min-h-[340px] flex flex-col justify-between" key={index}>
                            <div className="">
                                <RxQuote size={40} className="mb-4 text-[#1E73BE]" />
                                <p className="text-lg">{testimonial.content}</p>
                            </div> 
                            <div className="flex gap-4 items-center mt-4 border-t border-[#3333331A] pt-4">
                                <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                                    <img src={testimonial.img} alt={testimonial.name} className="h-full w-full object-cover object-center" />
                                </div>
                                <div className="">
                                    <h3 className="font-semibold mb-1">{testimonial.name}</h3>
                                    <p className="text-sm">{testimonial.role}</p>
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
