import { FaFacebookF, FaLinkedin, FaInstagram, FaYoutube} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";



export default function Footer() {
    const campusMenuItems = [
        { label: 'Programs', href: '#' },
        { label: 'Admissions', href: '#' },
        { label: 'Tuition & Aid', href: '#' },
        { label: 'Student Experience', href: '#' },
        { label: 'About', href: '#' },
    ];
       const recordMenuItems = [
        { label: 'Request Info', href: '#' },
        { label: 'Talk to Advisor', href: '#' },
        { label: 'Government Employee', href: '#' },
    ];
    return (
        <>
            <footer className="bg-[#333333] text-white">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-6 md:gap-20 gap-10 items-center md:py-25 py-15">
                        <div className="md:col-span-2">
                            <div className="">
                                <img src="/logo-white.png" width={210} alt="Austin Logo" />
                                <p className="py-10 leading-tight">Empowering careers through accessible, high-quality education. Accredited and recognized for academic excellence.</p>
                                <div className="flex">
                                    <a href="#" className=" hover:opacity-80 transition-colors duration-200 me-4"><FaFacebookF size={24} /></a>
                                    <a href="#" className=" hover:opacity-80 transition-colors duration-200 me-4"><FaInstagram size={24} /></a>
                                    <a href="#" className=" hover:opacity-80 transition-colors duration-200 me-4"><FaLinkedin size={24} /></a>
                                    <a href="#" className=" hover:opacity-80 transition-colors duration-200 me-4"><FaXTwitter size={24} /></a>
                                    <a href="#" className=" hover:opacity-80 transition-colors duration-200 me-4"><FaYoutube size={24} /></a>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <div className="font-semibold text-[22px] leading-tight mb-5 uppercase">Our Campus</div>
                                    <ul className="space-y-1">
                                        {campusMenuItems.map((item) =>
                                            <li><a href={item.href} className="  hover:opacity-80 transition-colors duration-200">{item.label}</a></li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <div className="font-semibold text-[22px] leading-tight mb-5 uppercase">Resources</div>
                                    <ul className="space-y-1">
                                        {recordMenuItems.map((item) =>
                                            <li><a href={item.href} className="  hover:opacity-80 transition-colors duration-200">{item.label}</a></li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <div className="font-semibold text-[22px] leading-tight mb-5 uppercase">Contact Us</div>
                                    <p className=" ">123 University Ave, Austin, TX 78701</p>
                                    <p className=" ">(512) 555-0100</p>
                                    <p className=" ">info@staustin.edu</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="md:flex items-center md:space-y-0 space-y-5 justify-between border-t border-[#FFFFFF80] py-5 text-[16px]">
                        <p className="">Copyright @ 2026. All Rights Reserved by St.Austin's International University</p>
                        <ul className="flex gap-3">
                            <li><a href="#" className="hover:opacity-80 transition-colors duration-200">Privacy Policy</a></li>
                            <span className="">|</span>
                            <li><a href="#" className="hover:opacity-80 transition-colors duration-200">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </>
    );
}