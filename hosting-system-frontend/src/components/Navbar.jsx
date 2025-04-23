import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Button } from './ui/button'
import { Menu, X, User, Server, LogOut } from 'lucide-react'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <Server className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">HostingSystem</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <NavLink to="/hosting">Hosting</NavLink>
                        <NavLink to="/about">O nas</NavLink>
                        <NavLink to="/blog">Blog</NavLink>
                        <NavLink to="/contact">Kontakt</NavLink>
                    </nav>

                    {/* Auth Buttons or User Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/user">
                                    <Button variant="outline" className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>Panel klienta</span>
                                    </Button>
                                </Link>
                                <Button variant="ghost" onClick={handleLogout} className="flex items-center space-x-2">
                                    <LogOut className="h-4 w-4" />
                                    <span>Wyloguj</span>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="outline">Zaloguj się</Button>
                                </Link>
                                <Link to="/register">
                                    <Button>Zarejestruj się</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
                        <MobileNavLink to="/hosting" onClick={toggleMenu}>Hosting</MobileNavLink>
                        <MobileNavLink to="/about" onClick={toggleMenu}>O nas</MobileNavLink>
                        <MobileNavLink to="/blog" onClick={toggleMenu}>Blog</MobileNavLink>
                        <MobileNavLink to="/contact" onClick={toggleMenu}>Kontakt</MobileNavLink>

                        {user ? (
                            <>
                                <MobileNavLink to="/user" onClick={toggleMenu}>Panel klienta</MobileNavLink>
                                <button
                                    className="w-full text-left block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                                    onClick={() => {
                                        handleLogout()
                                        toggleMenu()
                                    }}
                                >
                                    Wyloguj się
                                </button>
                            </>
                        ) : (
                            <>
                                <MobileNavLink to="/login" onClick={toggleMenu}>Zaloguj się</MobileNavLink>
                                <MobileNavLink to="/register" onClick={toggleMenu}>Zarejestruj się</MobileNavLink>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

const NavLink = ({ to, children }) => (
    <Link to={to} className="text-gray-700 hover:text-blue-600 font-medium">
        {children}
    </Link>
)

const MobileNavLink = ({ to, onClick, children }) => (
    <Link
        to={to}
        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
        onClick={onClick}
    >
        {children}
    </Link>
)

export default Navbar