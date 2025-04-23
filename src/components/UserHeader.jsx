// src/components/UserHeader.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
    Menu,
    X,
    User,
    CreditCard,
    Settings,
    LogOut,
    Bell
} from 'lucide-react'
import { Button } from './ui/button'

const UserHeader = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen)
        if (isNotificationsOpen) setIsNotificationsOpen(false)
    }

    const toggleNotifications = () => {
        setIsNotificationsOpen(!isNotificationsOpen)
        if (isUserMenuOpen) setIsUserMenuOpen(false)
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="flex justify-between items-center h-16 px-4 sm:px-6">
                <div className="flex items-center md:hidden">
                    <button
                        type="button"
                        className="text-gray-500 hover:text-gray-600"
                        onClick={toggleMobileMenu}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                <div className="flex-1 flex justify-end items-center space-x-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/user/purchase')}
                        className="hidden sm:inline-flex"
                    >
                        Zamów nową usługę
                    </Button>

                    <div className="relative">
                        <button
                            type="button"
                            className="p-1 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none"
                            onClick={toggleNotifications}
                        >
                            <span className="sr-only">Powiadomienia</span>
                            <Bell className="h-6 w-6" />
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </button>

                        {isNotificationsOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-2 px-4 border-b border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-900">Powiadomienia</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    <div className="py-2 px-4">
                                        <div className="space-y-4">
                                            <NotificationItem
                                                title="Nowa usługa aktywna"
                                                message="Twoja nowa usługa hostingowa jest teraz aktywna."
                                                time="1 godzinę temu"
                                                isUnread={true}
                                            />
                                            <NotificationItem
                                                title="Autoskalowanie uruchomione"
                                                message="Uruchomiono autoskalowanie dla Twojej usługi."
                                                time="3 godziny temu"
                                                isUnread={true}
                                            />
                                            <NotificationItem
                                                title="Kopie zapasowe"
                                                message="Utworzono automatyczną kopię zapasową Twojego konta."
                                                time="wczoraj"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="py-2 px-4 border-t border-gray-200">
                                    <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                        Zobacz wszystkie powiadomienia
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            className="flex items-center space-x-2 text-sm rounded-full focus:outline-none"
                            onClick={toggleUserMenu}
                        >
                            <span className="sr-only">Otwórz menu użytkownika</span>
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </button>

                        {isUserMenuOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1">

                                    <a href="/user/profile"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                    <User className="mr-3 h-5 w-5 text-gray-500" />
                                    Profil
                                </a>

                                <a href="/user/wallet"
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                <CreditCard className="mr-3 h-5 w-5 text-gray-500" />
                                Portfel
                            </a>

                            <a href="/user/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                            <Settings className="mr-3 h-5 w-5 text-gray-500" />
                            Ustawienia
                            </a>
                            <button
                            onClick={handleLogout}
                         className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-red-500" />
                        Wyloguj się
                    </button>
                </div>
            </div>
            )}
        </div>
</div>
</div>

    {/* Mobile menu */}
    {isMobileMenuOpen && (
        <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">

                <a href="/user"
                className="block px-3 py-2 text-base font-medium text-blue-700 bg-blue-50 rounded-md"
                >
                Dashboard
            </a>

            <a href="/user/profile"
            className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
            Profil
        </a>

        <a href="/user/wallet"
        className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
            Portfel
            </a>

        <a href="/user/services"
        className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
            Usługi
            </a>

        <a href="/user/statistics"
        className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
            Statystyki
            </a>

        <a href="/user/ai-predictions"
        className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
            AI Insights
    </a>

        <a href="/user/backups"
        className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
            Kopie zapasowe
    </a>

        <a href="/user/referrals"
        className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
            Program poleceń
    </a>

        <a href="/user/settings"
        className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
            Ustawienia
            </a>
        <button
            onClick={handleLogout}
            className="w-full text-left block px-3 py-2 text-base font-medium text-red-700 hover:bg-gray-100 rounded-md"
        >
            Wyloguj się
        </button>
    </div>
    </div>
    )}
</header>
)
}

const NotificationItem = ({ title, message, time, isUnread = false }) => (
    <div className={`${isUnread ? 'bg-blue-50' : ''} -m-2 p-2 rounded-md`}>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
    </div>
)

export default UserHeader