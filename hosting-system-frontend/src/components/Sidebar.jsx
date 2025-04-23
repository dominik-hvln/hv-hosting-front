// src/components/Sidebar.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
    Home,
    User,
    Server,
    CreditCard,
    BarChart2,
    Settings,
    Database,
    Users,
    GitBranch,
    Brain,
    LogOut
} from 'lucide-react'

const Sidebar = () => {
    const location = useLocation()
    const { user, logout } = useAuthStore()

    const isActive = (path) => {
        return location.pathname === path || location.pathname.startsWith(`${path}/`)
    }

    const menuItems = [
        {
            path: '/user',
            exact: true,
            icon: <Home className="w-5 h-5" />,
            label: 'Dashboard'
        },
        {
            path: '/user/profile',
            icon: <User className="w-5 h-5" />,
            label: 'Profil'
        },
        {
            path: '/user/wallet',
            icon: <CreditCard className="w-5 h-5" />,
            label: 'Portfel'
        },
        {
            path: '/user/services',
            icon: <Server className="w-5 h-5" />,
            label: 'Usługi'
        },
        {
            path: '/user/statistics',
            icon: <BarChart2 className="w-5 h-5" />,
            label: 'Statystyki'
        },
        {
            path: '/user/ai-predictions',
            icon: <Brain className="w-5 h-5" />,
            label: 'AI Insights'
        },
        {
            path: '/user/backups',
            icon: <Database className="w-5 h-5" />,
            label: 'Kopie zapasowe'
        },
        {
            path: '/user/referrals',
            icon: <Users className="w-5 h-5" />,
            label: 'Program poleceń'
        },
        {
            path: '/user/settings',
            icon: <Settings className="w-5 h-5" />,
            label: 'Ustawienia'
        },
    ]

    return (
        <div className="bg-white border-r border-gray-200 w-64 flex-shrink-0 hidden md:block">
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-center h-16 border-b border-gray-200">
                    <Link to="/" className="flex items-center space-x-2">
                        <Server className="h-6 w-6 text-blue-600" />
                        <span className="text-lg font-bold text-gray-900">HostingSystem</span>
                    </Link>
                </div>

                <div className="overflow-y-auto flex-grow">
                    <nav className="mt-6 px-3 space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                                    isActive(item.path)
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                <span className={`mr-3 ${isActive(item.path) ? 'text-blue-700' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0">
                            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.name || 'Użytkownik'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {user?.email || ''}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-red-500" />
                        Wyloguj się
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Sidebar