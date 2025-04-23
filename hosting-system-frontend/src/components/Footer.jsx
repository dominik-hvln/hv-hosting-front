import React from 'react'
import { Link } from 'react-router-dom'
import { Server, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <Server className="h-8 w-8 text-blue-400" />
                            <span className="text-xl font-bold">HostingSystem</span>
                        </Link>
                        <p className="text-gray-400 mb-4">
                            Nowoczesny system hostingowy z autoskalowaniem, zaprojektowany dla Twojego biznesu.
                        </p>
                        <div className="flex space-x-4">
                            <SocialIcon icon={<Facebook size={20} />} href="https://facebook.com" />
                            <SocialIcon icon={<Twitter size={20} />} href="https://twitter.com" />
                            <SocialIcon icon={<Instagram size={20} />} href="https://instagram.com" />
                            <SocialIcon icon={<Linkedin size={20} />} href="https://linkedin.com" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Usługi</h3>
                        <ul className="space-y-2">
                            <FooterLink to="/hosting">Hosting z autoskalowaniem</FooterLink>
                            <FooterLink to="/hosting">Serwery VPS</FooterLink>
                            <FooterLink to="/hosting">Domeny</FooterLink>
                            <FooterLink to="/hosting">Certyfikaty SSL</FooterLink>
                            <FooterLink to="/hosting">Kopie zapasowe</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Firma</h3>
                        <ul className="space-y-2">
                            <FooterLink to="/about">O nas</FooterLink>
                            <FooterLink to="/blog">Blog</FooterLink>
                            <FooterLink to="/faq">FAQ</FooterLink>
                            <FooterLink to="/contact">Kontakt</FooterLink>
                            <FooterLink to="/terms">Regulamin</FooterLink>
                            <FooterLink to="/privacy">Polityka prywatności</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <MapPin size={20} className="text-blue-400 flex-shrink-0 mt-1" />
                                <span className="text-gray-400">
                  ul. Przykładowa 123<br />
                  00-001 Warszawa
                </span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone size={20} className="text-blue-400" />
                                <span className="text-gray-400">+48 123 456 789</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail size={20} className="text-blue-400" />
                                <span className="text-gray-400">kontakt@hostingsystem.pl</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
                    <p>© {new Date().getFullYear()} HostingSystem. Wszelkie prawa zastrzeżone.</p>
                </div>
            </div>
        </footer>
    )
}

const FooterLink = ({ to, children }) => (
    <li>
        <Link to={to} className="text-gray-400 hover:text-blue-400 transition-colors">
            {children}
        </Link>
    </li>
)

const SocialIcon = ({ icon, href }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition-colors"
    >
        {icon}
    </a>
)

export default Footer