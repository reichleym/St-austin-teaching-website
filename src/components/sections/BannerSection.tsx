import Button from "../Button";

export default function BannerSection({title, description, bgImg, children}: {title: string, description: string, bgImg: string, children?: React.ReactNode}) {
    return (
        <section className="md:py-25 py-15 md:min-h-[500px] min-h-[300px] relative content-center z-10 no-repeat bg-cover bg-center" style={{backgroundImage: `url(${bgImg})`}}>
            <div className="bg-[#33333380] absolute inset-0 -z-1"></div>
            <div className="container">
                <div className="flex flex-col items-center text-center text-white">
                    <h2 className="md:text-[50px] text-4xl font-bold mb-2.5 leading-tight">{title}</h2>
                    <p className="">{description} </p>
                    {children}
                </div>
            </div>
        </section>
    );
}