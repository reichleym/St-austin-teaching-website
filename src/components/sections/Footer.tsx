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
            <section className="bg-[#F2F5FA]">
                <div className="container">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-20 items-center py-25">
                        <div className="md:col-span-2">
                            <div className="">
                                <img src="/austin-logo.png" width={210} alt="Austin Logo" />
                                <p className="text-[15px] mt-5 mb-7">Empowering careers through accessible, high-quality education. Accredited and recognized for academic excellence.</p>
                                <div className="flex">
                                    <a href="#" className="text-[#1E73BE] hover:text-blue-600 transition-colors duration-200 me-4"><FaFacebookF size={24} /></a>
                                    <a href="#" className="text-[#1E73BE] hover:text-blue-600 transition-colors duration-200 me-4"><FaInstagram size={24} /></a>
                                    <a href="#" className="text-[#1E73BE] hover:text-blue-600 transition-colors duration-200 me-4"><FaLinkedin size={24} /></a>
                                    <a href="#" className="text-[#1E73BE] hover:text-blue-600 transition-colors duration-200 me-4"><FaXTwitter size={24} /></a>
                                    <a href="#" className="text-[#1E73BE] hover:text-blue-600 transition-colors duration-200 me-4"><FaYoutube size={24} /></a>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2 text-[#1E73BE] uppercase">Our Campus</h3>
                                    <ul className="space-y-1">
                                        {campusMenuItems.map((item) =>
                                            <li><a href={item.href} className="text-gray-700 text-[15px] hover:text-blue-600 transition-colors duration-200">{item.label}</a></li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2 text-[#1E73BE] uppercase">Resources</h3>
                                    <ul className="space-y-1">
                                        {recordMenuItems.map((item) =>
                                            <li><a href={item.href} className="text-gray-700 text-[15px] hover:text-blue-600 transition-colors duration-200">{item.label}</a></li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2 text-[#1E73BE] uppercase">Contact Us</h3>
                                    <p className="text-gray-700 text-[15px]">123 University Ave, Austin, TX 78701</p>
                                    <p className="text-gray-700 text-[15px]">(512) 555-0100</p>
                                    <p className="text-gray-700 text-[15px]">info@staustin.edu</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#33333340] py-5">
                        <p className="text-sm text-[#33333380]">Copyright @ 2026. All Rights Reserved by St.Austin's International University</p>
                        <ul className="flex gap-3">
                            <li><a href="#" className="text-[#33333380] hover:text-blue-600 transition-colors duration-200">Privacy Policy</a></li>
                            <span className="text-[#33333380]">|</span>
                            <li><a href="#" className="text-[#33333380] hover:text-blue-600 transition-colors duration-200">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
    );
}