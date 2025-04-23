import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/button'
import {
    Server,
    CreditCard,
    BarChart,
    AlertCircle,
    CheckCircle,
    User,
    Clock,
    ChevronRight,
    ArrowRight,
} from 'lucide-react'
import api from '../../lib/axios'

const Dashboard = () => {
    const { user } = useAuthStore()
    const [loading, setLoading] = useState(true)
    const [services, setServices] = useState([])
    const [walletBalance, setWalletBalance] = useState(0)
    const [stats, setStats] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)

                // Fetch services
                const servicesResponse = await api.get('/hosting/services')
                if (servicesResponse.data.success) {
                    setServices(servicesResponse.data.services)
                }

                // Fetch wallet
                const walletResponse = await api.get('/wallet')
                if (walletResponse.data.success) {
                    setWalletBalance(walletResponse.data.wallet.balance)
                }

                // Fetch resource stats
                const statsResponse = await api.get('/statistics/resources')
                if (statsResponse.data.success) {
                    setStats(statsResponse.data)
                }

            } catch (err) {
                console.error('Error fetching dashboard data:', err)
                setError('Nie udało się pobrać danych. Spróbuj odświeżyć stronę.')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Witaj, {user?.name || 'Użytkowniku'}!
                </h1>

                <Button
                    asChild
                    variant="outline"
                    className="hidden sm:flex"
                >
                    <Link to="/user/purchase" className="flex items-center">
                        <Server className="mr-2 h-4 w-4" />
                        Zamów nową usługę
                    </Link>
                </Button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <DashboardCard
                    title="Stan portfela"
                    value={`${walletBalance.toFixed(2)} PLN`}
                    icon={<CreditCard className="h-6 w-6 text-blue-600" />}
                    actionLabel="Doładuj"
                    actionLink="/user/wallet"
                    loading={loading}
                />

                <DashboardCard
                    title="Aktywne usługi"
                    value={services.filter(s => s.status === 'active').length || 0}
                    icon={<Server className="h-6 w-6 text-green-600" />}
                    actionLabel="Zarządzaj"
                    actionLink="/user/services"
                    loading={loading}
                />

                <DashboardCard
                    title="Aktualne zużycie RAM"
                    value={stats ? `${Math.round(stats.current_resources.ram / 1024)} GB` : '0 GB'}
                    icon={<BarChart className="h-6 w-6 text-purple-600" />}
                    actionLabel="Statystyki"
                    actionLink="/user/statistics"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Twoje usługi</h2>
                        <Link to="/user/services" className="text-sm text-blue-600 hover:text-blue-500 flex items-center">
                            Wszystkie <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        ) : services.length > 0 ? (
                            <div className="space-y-4">
                                {services.slice(0, 3).map(service => (
                                    <ServiceItem
                                        key={service.id}
                                        service={service}
                                    />
                                ))}

                                {services.length > 3 && (
                                    <Link
                                        to="/user/services"
                                        className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-500"
                                    >
                                        Pokaż wszystkie ({services.length}) usługi
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Server className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Brak usług</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Nie masz jeszcze żadnych usług hostingowych.
                                </p>
                                <div className="mt-6">
                                    <Button asChild>
                                        <Link to="/user/purchase">
                                            Zamów pierwszą usługę
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Aktywność</h2>
                        <Link to="/user/statistics" className="text-sm text-blue-600 hover:text-blue-500 flex items-center">
                            Szczegóły <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <ActivityItem
                                    title="Autoskalowanie"
                                    message="Zasoby zostały automatycznie zwiększone"
                                    time="2 godziny temu"
                                    icon={<BarChart className="h-5 w-5 text-orange-500" />}
                                />
                                <ActivityItem
                                    title="Kopia zapasowa"
                                    message="Utworzono automatyczną kopię zapasową"
                                    time="wczoraj, 23:00"
                                    icon={<Server className="h-5 w-5 text-green-500" />}
                                />
                                <ActivityItem
                                    title="Płatność"
                                    message="Opłacono odnowienie usługi hostingowej"
                                    time="2 dni temu"
                                    icon={<CreditCard className="h-5 w-5 text-blue-500" />}
                                />

                                <Link
                                    to="/user/statistics"
                                    className="block mt-6 text-sm text-blue-600 hover:text-blue-500 flex items-center justify-center"
                                >
                                    Zobacz pełną historię aktywności <ArrowRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow">
                <div className="px-6 py-5 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-white">Poleć nas znajomym i zyskaj!</h3>
                        <p className="mt-1 text-sm text-blue-100">
                            Za każdą osobę, która zarejestruje się z Twojego polecenia, otrzymasz 50 PLN na portfel.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Button
                            asChild
                            className="bg-white text-blue-700 hover:bg-blue-50"
                        >
                            <Link to="/user/referrals">
                                Program poleceń
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const DashboardCard = ({ title, value, icon, actionLabel, actionLink, loading }) => {
    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        {icon}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd>
                                {loading ? (
                                    <div className="h-7 w-20 bg-gray-200 animate-pulse rounded-md mt-1"></div>
                                ) : (
                                    <div className="text-xl font-semibold text-gray-900">{value}</div>
                                )}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 rounded-b-lg">
                <div className="text-sm">
                    <Link to={actionLink} className="font-medium text-blue-600 hover:text-blue-500">
                        {actionLabel} <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

const ServiceItem = ({ service }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'suspended':
                return 'bg-orange-100 text-orange-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    return (
        <Link
            to={`/user/services/${service.id}`}
            className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Server className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{service.domain}</h3>
                        <p className="text-xs text-gray-500">
                            Plan: {service.hosting_plan?.name || 'Własny'}
                        </p>
                    </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
          {service.status === 'active' && <CheckCircle className="mr-1 h-3 w-3" />}
                    {service.status === 'suspended' && <AlertCircle className="mr-1 h-3 w-3" />}
                    {service.status === 'expired' && <Clock className="mr-1 h-3 w-3" />}
                    {service.status === 'active' ? 'Aktywna' :
                        service.status === 'suspended' ? 'Zawieszona' :
                            service.status === 'expired' ? 'Wygasła' : service.status}
        </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                    <span className="text-gray-500">RAM:</span>{' '}
                    <span className="font-medium">{service.hosting_account?.current_ram || 0} MB</span>
                </div>
                <div>
                    <span className="text-gray-500">CPU:</span>{' '}
                    <span className="font-medium">{service.hosting_account?.current_cpu || 0}%</span>
                </div>
                <div>
                    <span className="text-gray-500">Wygasa:</span>{' '}
                    <span className="font-medium">{formatDate(service.end_date)}</span>
                </div>
                <div>
                    <span className="text-gray-500">Autoskalowanie:</span>{' '}
                    <span className="font-medium">{service.is_autoscaling_enabled ? 'Włączone' : 'Wyłączone'}</span>
                </div>
            </div>
        </Link>
    )
}

const ActivityItem = ({ title, message, time, icon }) => (
    <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-600">{message}</p>
            <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
    </div>
)

export default Dashboard