"use client";

import { RxQuote } from "react-icons/rx";

type TestimonialItem = {
  name: string;
  course?: string;
  experience: string;
  profileImage?: string;
};

type Props = {
  title?: string;
  description?: string;
  testimonials?: TestimonialItem[];
};

export default function StudentTestimonial({
  title,
  description,
  testimonials = [],
}: Props) {
  return (
    <section className="md:py-25 text-center py-15">
      <div className="container">
        <div className="mb-12">
          {title && (
            <h2 className="md:text-[50px] text-4xl font-bold mb-2.5 leading-tight">
              {title}
            </h2>
          )}
          {description && <p className="leading-tight">{description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="bg-[#F2F5FA] p-5 rounded-[10px] mb-5 min-h-[340px] flex flex-col justify-between"
            >
              <div>
                <RxQuote size={40} className="mb-5 text-[#1E73BE]" />
                <p className="text-xl leading-tight italic">
                  {item.experience}
                </p>
              </div>

              <div className="flex gap-4 items-center mt-4 border-t border-[#33333340] pt-5">
                <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                  <img
                    src={item.profileImage ?? "/testimonial-img.jpg"}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div>
                  <div className="font-semibold text-lg mb-1 leading-tight">
                    {item.name}
                  </div>
                  {item.course && (
                    <p className="text-[16px]">{item.course}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}