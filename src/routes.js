import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Layouts
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import UserHeader from './components/UserHeader'
import Footer from './components/Footer'

// Public pages
import Home from './pages/public/Home'
import HostingPlans from './pages/public/HostingPlans'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import ForgotPassword from './pages/public/ForgotPassword'
import NotFound from './pages/errors/NotFound'

// User pages
import Dashboard from './pages/user/Dashboard'
import Services from './pages/user/Services'
import ServiceDetails from './pages/user/ServiceDetails'
import Statistics from './pages/user/Statistics'
import Wallet from './pages/user/Wallet'
import Purchase from './pages/user/Purchase'
import Profile from './pages/user/Profile'
import Settings from './pages/user/Settings'
import Backups from './pages/user/Backups'
import Referrals from './pages/user/Referrals'
import AIInsights from './pages/user/AIInsights'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminPlans from './pages/admin/Plans'
import AdminServers from './pages/admin/Servers'
import AdminServices from './pages/admin/Services'
import AdminBilling from './pages/admin/Billing'
import AdminPromoCodes from './pages/admin/PromoCodes'
import AdminSettings from './pages/admin/Settings'
import AdminSystemStatus from './pages/admin/SystemStatus'

// Auth wrapper for protected routes
const RequireAuth = ({ children }) => {
    const location = useLocation()
    const { user, token } = useAuthStore()

    if (!user || !token) {
        // Redirect to login page but save the attempted URL
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

// Admin auth wrapper
const RequireAdmin = ({ children }) => {
    const location = useLocation()
    const { user, token } = useAuthStore()

    if (!user || !token) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check if user has admin role
    if (!user.is_admin) {
        return <Navigate to="/user" replace />
    }

    return children
}

// Public layout wrapper
const PublicLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    )
}

// User layout wrapper
const UserLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-auto">
                <UserHeader />
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

// Admin layout wrapper
const AdminLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            <div className="w-64 bg-gray-900 text-white">
                {/* Admin Sidebar - to be implemented */}
                <div className="p-4 font-bold text-xl">Admin Panel</div>
            </div>
            <div className="flex-1 flex flex-col overflow-auto">
                <div className="bg-white border-b p-4 shadow-sm">
                    {/* Admin Header - to be implemented */}
                    <div className="text-lg font-semibold">System zarządzania hostingiem</div>
                </div>
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

// Define routes configuration
const routes = [
    // Public routes
    {
        path: '/',
        element: <PublicLayout><Home /></PublicLayout>,
    },
    {
        path: '/hosting',
        element: <PublicLayout><HostingPlans /></PublicLayout>,
    },
    {
        path: '/login',
        element: <PublicLayout><Login /></PublicLayout>,
    },
    {
        path: '/register',
        element: <PublicLayout><Register /></PublicLayout>,
    },
    {
        path: '/forgot-password',
        element: <PublicLayout><ForgotPassword /></PublicLayout>,
    },

    // User routes (protected)
    {
        path: '/user',
        element: <RequireAuth><UserLayout><Dashboard /></UserLayout></RequireAuth>,
    },
    {
        path: '/user/services',
        element: <RequireAuth><UserLayout><Services /></UserLayout></RequireAuth>,
    },
    {
        path: '/user/services/:id',
        element: <RequireAuth><UserLayout><ServiceDetails /></UserLayout></RequireAuth>,
    },
    {
        path: '/user/statistics',
        element: <RequireAuth><UserLayout><Statistics /></UserLayout></RequireAuth>,
    },
    {
        path: '/user/wallet',
        element: <RequireAuth><UserLayout><Wallet /></UserLayout></RequireAuth>,
    },
    {
        path: '/user/purchase',
        element: <RequireAuth><UserLayout><Purchase /></UserLayout></RequireAuth>,
    },
    {
        path: '/user/profile',
        element: <RequireAuth><UserLayout><Profile /></UserLayout></RequireAuth>,
    },
    {
        path: '/user/settings',
        element: <RequireAuth><UserLayout><Settings /></UserLayout></RequireAuth>,
    },
    {
        path: '/user/backups',
        element: <RequireAuth><UserLayout><Backups /></UserLayout></RequireAuth>,
    },
    {
        path: '/user/referrals',
        element: <RequireAuth><UserLayout><Referrals /></UserLayout></RequireAuth>,
    },
    {
        path: '/user/ai-predictions',
        element: <RequireAuth><UserLayout><AIInsights /></UserLayout></RequireAuth>,
    },

    // Admin routes (protected + admin role)
    {
        path: '/admin',
        element: <RequireAdmin><AdminLayout><AdminDashboard /></AdminLayout></RequireAdmin>,
    },
    {
        path: '/admin/users',
        element: <RequireAdmin><AdminLayout><AdminUsers /></AdminLayout></RequireAdmin>,
    },
    {
        path: '/admin/plans',
        element: <RequireAdmin><AdminLayout><AdminPlans /></AdminLayout></RequireAdmin>,
    },
    {
        path: '/admin/servers',
        element: <RequireAdmin><AdminLayout><AdminServers /></AdminLayout></RequireAdmin>,
    },
    {
        path: '/admin/services',
        element: <RequireAdmin><AdminLayout><AdminServices /></AdminLayout></RequireAdmin>,
    },
    {
        path: '/admin/billing',
        element: <RequireAdmin><AdminLayout><AdminBilling /></AdminLayout></RequireAdmin>,
    },
    {
        path: '/admin/promo-codes',
        element: <RequireAdmin><AdminLayout><AdminPromoCodes /></AdminLayout></RequireAdmin>,
    },
    {
        path: '/admin/settings',
        element: <RequireAdmin><AdminLayout><AdminSettings /></AdminLayout></RequireAdmin>,
    },
    {
        path: '/admin/system-status',
        element: <RequireAdmin><AdminLayout><AdminSystemStatus /></AdminLayout></RequireAdmin>,
    },

    // Catch-all route for 404
    {
        path: '*',
        element: <PublicLayout><NotFound /></PublicLayout>,
    },
]

export default routes
