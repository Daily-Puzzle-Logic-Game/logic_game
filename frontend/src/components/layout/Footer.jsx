import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Linkedin, Youtube, MessageCircle, ChevronRight, ShieldCheck, ChevronUp } from 'lucide-react';

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className="bg-[#f8f9fa] border-t border-gray-200 pt-16 pb-8 dark:bg-[#15171e] dark:border-gray-800">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Column 1: Company Info */}
                    <div>
                        <h3 className="text-xl font-bold text-[#142850] dark:text-white mb-4">Bluestock Fintech</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Bluestock™ Fintech & Platforms</p>

                        <div className="text-[13px] text-gray-600 dark:text-gray-400 space-y-2">
                            <p><strong className="text-gray-900 dark:text-gray-200">Phone:</strong> +91 7038202440</p>
                            <p><strong className="text-gray-900 dark:text-gray-200">Email:</strong> hello@bluestock.in</p>
                            <div className="pt-2">
                                <p><strong className="text-gray-900 dark:text-gray-200">NISM (SEBI) Registration No:</strong></p>
                                <p>NISM-202400180448</p>
                                <p>Investor Certification Exam</p>
                            </div>
                            <div className="pt-2">
                                <p><strong className="text-gray-900 dark:text-gray-200">Registration</strong></p>
                                <p>UDYAM-MH-01-0138001</p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Useful Links */}
                    <div>
                        <h4 className="text-[15px] font-bold text-[#142850] dark:text-white mb-6">Useful Links</h4>
                        <ul className="space-y-3">
                            {[
                                { name: 'Home', url: 'https://bluestock.in/' },
                                { name: 'Careers', url: 'https://bluestock.in/careers/' },
                                { name: 'Market', url: 'https://bluestock.in/market/' },
                                { name: 'Screener', url: 'https://bluestock.in/screener/' },
                                { name: 'Bluestock Blog', url: 'https://blog.bluestock.in/' },
                                { name: 'Trading View', url: 'https://www.tradingview.com/' },
                                { name: 'e-Voting NSDL', url: 'https://www.evoting.nsdl.com/' },
                                { name: 'NSE Holidays', url: 'https://www.nseindia.com/resources/exchange-communication-holidays' }
                            ].map((link) => (
                                <li key={link.name}>
                                    <a 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-gray-500 hover:text-[#414BEA] dark:text-gray-400 flex items-center gap-2 transition-colors"
                                    >
                                        <ChevronRight size={14} className="text-gray-400" />
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Our Services */}
                    <div>
                        <h4 className="text-[15px] font-bold text-[#142850] dark:text-white mb-6">Our Services</h4>
                        <ul className="space-y-3">
                            {['Developers', 'Trust & Security', 'API', 'Sitemap', 'Disclaimer', 'Content Disclaimer', 'Privacy Policy', 'Terms & Conditions'].map((link) => (
                                <li key={link}>
                                    <Link to="#" className="text-sm text-gray-500 hover:text-[#414BEA] dark:text-gray-400 flex items-center gap-2 transition-colors">
                                        <ChevronRight size={14} className="text-gray-400" />
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Follow Us & Badges */}
                    <div>
                        <h4 className="text-[15px] font-bold text-[#142850] dark:text-white mb-6">Follow Us</h4>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            Unlock the future of finance with Bluestock Fintech - follow us for exclusive insights and updates!
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {[Twitter, Facebook, Instagram, Linkedin, Youtube, MessageCircle].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-9 h-9 flex items-center justify-center rounded border border-gray-200 text-[#414BEA] hover:bg-[#414BEA] hover:text-white hover:border-[#414BEA] transition-colors dark:border-gray-700">
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                                <ShieldCheck size={16} className="text-emerald-500" />
                                <span>All services are online</span>
                            </div>

                            <div className="text-[13px] text-gray-600 dark:text-gray-400">
                                <p>Your IP Address</p>
                                <p className="font-medium">122.185.181.210</p>
                            </div>

                            <div className="inline-flex items-center bg-[#1e293b] text-white text-xs font-semibold px-2 py-1 rounded">
                                <span className="text-[#38bdf8] mr-1">DMCA</span> PROTECTED
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Designed by <span className="text-[#142850] dark:text-gray-300 font-medium">BootstrapMade</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 text-center md:text-right">
                        © Copyright & Trademark Registered in India <span className="text-[#414BEA] font-medium">Bluestock</span> All Rights Reserved | Fintech Platforms for a Growing India. <span className="font-bold">IN</span>
                    </p>
                </div>
            </div>
            {/* Scroll to top button */}
            {isVisible && (
                <button 
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 w-10 h-10 bg-[#414BEA] text-white rounded flex items-center justify-center hover:bg-[#343fc4] transition-all duration-300 shadow-lg z-[60] animate-bounce-short"
                    aria-label="Scroll to top"
                >
                    <ChevronUp size={20} />
                </button>
            )}
        </footer>
    );
};

export default Footer;
