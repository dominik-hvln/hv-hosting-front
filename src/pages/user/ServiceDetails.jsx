import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
    Server,
    CheckCircle,
    AlertCircle,
    Clock,
    ArrowLeft,
    HardDrive,
    Cpu,
    Database,
    Wifi,
    Calendar,
    ToggleLeft,
    ToggleRight,
    Download,
    UploadCloud,
    Repeat,
    Terminal,
    BarChart2,
    TrendingUp,
    Power,
    Trash2,
    RefreshCw,
    Shield,
    Settings,
    Edit,
    ChevronRight
} from 'lucide-react'
import api from '../../lib/axios'

const ServiceDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [service, setService] = useState(null)
    const [usage, setUsage] = useState(null)
    const [scalingLogs, setScalingLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingUsage, setLoadingUsage] = useState(true)
    const [loadingScalingLogs, setLoadingScalingLogs] = useState(true)
    const [error, setError] = useState(null)
    const [showRenewForm, setShowRenewForm] = useState(false)
    const [renewPeriod, setRenewPeriod] = useState('monthly')
    const [renewPaymentMethod, setRenewPaymentMethod] = useState('wallet')
    const [renewError, setRenewError] = useState(null)
    const [toggleLoading, setToggleLoading] = useState(false)

    // Fetch service details
    useEffect(() => {
        const fetchServiceDetails = async () => {
            try {
                setLoading(true)
                const response = await api.get(`/hosting/services/${id}`)
                if (response.data.success) {
                    setService(response.data.service)
                } else {
                    setError('Nie udało się pobrać szczegółów usługi')
                }
            } catch (err) {
                setError('Wystąpił błąd podczas pobierania szczegółów usługi')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchServiceDetails()
    }, [id])

    // Fetch resource usage
    useEffect(() => {
        const fetchResourceUsage = async () => {
            if (!service) return

            try {
                setLoadingUsage(true)
                const response = await api.get(`/hosting/services/${id}/resource-usage`)
                if (response.data.success) {
                    setUsage(response.data)
                }
            } catch (err) {
                console.error('Error fetching resource usage:', err)
            } finally {
                setLoadingUsage(false)
            }
        }

        fetchResourceUsage()
    }, [id, service])

    // Fetch scaling logs
    useEffect(() => {
        const fetchScalingLogs = async () => {
            if (!service) return

            try {
                setLoadingScalingLogs(true)
                const response = await api.get(`/hosting/services/${id}/scaling-logs`)
                if (response.data.success) {
                    setScalingLogs(response.data.logs.data)
                }
            } catch (err) {
                console.error('Error fetching scaling logs:', err)
            } finally {
                setLoadingScalingLogs(false)
            }
        }

        fetchScalingLogs()
    }, [id, service])

    const handleToggleAutoscaling = async () => {
        if (!service) return

        try {
            setToggleLoading(true)
            const response = await api.put(`/hosting/services/${id}/autoscaling`, {
                enabled: !service.is_autoscaling_enabled
            })

            if (response.data.success) {
                setService(response.data.service)
            } else {
                setError('Nie udało się zmienić ustawień autoskalowania')
            }
        } catch (err) {
            setError('Wystąpił błąd podczas zmiany ustawień autoskalowania')
            console.error(err)
        } finally {
            setToggleLoading(false)
        }
    }

    const handleRenewService = async (e) => {
        e.preventDefault()
        setRenewError(null)

        try {
            const response = await api.post(`/hosting/services/${id}/renew`, {
                period: renewPeriod,
                payment_method: renewPaymentMethod,
                return_url: window.location.href
            })

            if (response.data.success) {
                if (renewPaymentMethod === 'wallet') {
                    // If paid from wallet, refresh service data
                    const serviceResponse = await api.get(`/hosting/services/${id}`)
                    if (serviceResponse.data.success) {
                        setService(serviceResponse.data.service)
                    }
                    setShowRenewForm(false)
                } else {
                    // For external payment methods, redirect to payment page
                    window.location.href = response.data.payment.payment_url
                }
            } else {
                setRenewError(response.data.message || 'Wystąpił błąd podczas odnawiania usługi')
            }
        } catch (err) {
            setRenewError('Wystąpił błąd podczas odnawiania usługi')
            console.error(err)
        }
    }

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
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatStorageSize = (sizeInMB) => {
        if (!sizeInMB && sizeInMB !== 0) return 'N/A';
        if (sizeInMB >= 1024) {
            return `${(sizeInMB / 1024).toFixed(0)} GB`
        }
        return `${sizeInMB} MB`
    }

    const formatBandwidth = (bandwidthInMB) => {
        if (!bandwidthInMB && bandwidthInMB !== 0) return 'N/A';
        if (bandwidthInMB >= 1024 * 1024) {
            return `${(bandwidthInMB / (1024 * 1024)).toFixed(0)} TB`
        }
        if (bandwidthInMB >= 1024) {
            return `${(bandwidthInMB / 1024).toFixed(0)} GB`
        }
        return `${bandwidthInMB} MB`
    }

    const calculateDaysRemaining = (endDate) => {
        if (!endDate) return 0;
        const end = new Date(endDate);
        const now = new Date();
        const diffTime = end - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    const calculateUsagePercentage = (used, total) => {
        if (used === null || used === undefined || total === null || total === undefined || total === 0) {
            return 0;
        }
        return Math.min(100, Math.round((used / total) * 100));
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
            </div>
        )
    }

    if (!service) {
        return (
            <div className="text-center">
                <h2 className="text-lg font-medium text-gray-900">Usługa nie została znaleziona</h2>
                <p className="mt-1 text-gray-500">
                    Usługa o podanym ID nie istnieje lub nie masz do niej dostępu.
                </p>
                <Button
                    asChild
                    className="mt-4"
                >
                    <Link to="/user/services">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Wróć do listy usług
                    </Link>
                </Button>
            </div>
        )
    }

    const daysRemaining = calculateDaysRemaining(service.end_date);
    const isExpiring = daysRemaining <= 7 && service.status === 'active';

    return (
        <div>
            <div className="flex items-center mb-6">
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                >
                    <Link to="/user/services" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Wróć do listy
                    </Link>
                </Button>
                <div className="ml-4">
                    <h1 className="text-2xl font-bold text-gray-900">{service.domain}</h1>
                    <div className="flex items-center mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
              {service.status === 'active' && <CheckCircle className="mr-1 h-3 w-3" />}
                {service.status === 'suspended' && <AlertCircle className="mr-1 h-3 w-3" />}
                {service.status === 'expired' && <Clock className="mr-1 h-3 w-3" />}
                {service.status === 'active' ? 'Aktywna' :
                    service.status === 'suspended' ? 'Zawieszona' :
                        service.status === 'expired' ? 'Wygasła' : service.status}
            </span>
                        <span className="ml-2 text-sm text-gray-500">
              Plan: {service.hosting_plan?.name}
            </span>
                    </div>
                </div>
            </div>

            {isExpiring && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Twoja usługa wkrótce wygaśnie</p>
                        <p className="text-sm">Usługa wygaśnie za {daysRemaining} dni. Odnów ją, aby zachować ciągłość działania.</p>
                        <Button
                            onClick={() => setShowRenewForm(true)}
                            size="sm"
                            className="mt-2"
                        >
                            Odnów teraz
                        </Button>
                    </div>
                </div>
            )}

            {/* Renew form */}
            {showRenewForm && (
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">Odnów usługę</h2>
                    </div>

                    <form onSubmit={handleRenewService} className="p-6">
                        {renewError && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {renewError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="renew-period" className="block text-sm font-medium text-gray-700">
                                    Okres odnowienia
                                </label>
                                <select
                                    id="renew-period"
                                    name="renew-period"
                                    value={renewPeriod}
                                    onChange={(e) => setRenewPeriod(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="monthly">1 miesiąc - {service.hosting_plan.price_monthly.toFixed(2)} PLN</option>
                                    <option value="yearly">1 rok - {service.hosting_plan.price_yearly.toFixed(2)} PLN (oszczędzasz {(service.hosting_plan.price_monthly * 12 - service.hosting_plan.price_yearly).toFixed(2)} PLN)</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700">
                                    Metoda płatności
                                </label>
                                <select
                                    id="payment-method"
                                    name="payment-method"
                                    value={renewPaymentMethod}
                                    onChange={(e) => setRenewPaymentMethod(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="wallet">Portfel</option>
                                    <option value="stripe">Karta płatnicza (Stripe)</option>
                                    <option value="paynow">PayNow</option>
                                    <option value="p24">Przelewy24</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowRenewForm(false)}
                            >
                                Anuluj
                            </Button>
                            <Button type="submit">
                                Odnów usługę
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Service details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Szczegóły usługi</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Nazwa planu</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{service.hosting_plan?.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status === 'active' ? 'Aktywna' :
                          service.status === 'suspended' ? 'Zawieszona' :
                              service.status === 'expired' ? 'Wygasła' : service.status}
                    </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Data aktywacji</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatDate(service.start_date)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Data wygaśnięcia</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatDate(service.end_date)}
                                        {daysRemaining > 0 && service.status === 'active' && (
                                            <span className="ml-2 text-xs text-gray-500">
                        (pozostało {daysRemaining} dni)
                      </span>
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Automatyczne odnowienie</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{service.is_auto_renew ? 'Włączone' : 'Wyłączone'}</dd>
                                </div>
                            </dl>
                        </div>

                        <div>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Nazwa użytkownika</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{service.hosting_account?.username || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Domena</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{service.domain}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Metoda płatności</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {service.payment_method === 'wallet' ? 'Portfel' :
                                            service.payment_method === 'stripe' ? 'Karta płatnicza (Stripe)' :
                                                service.payment_method === 'paynow' ? 'PayNow' :
                                                    service.payment_method === 'p24' ? 'Przelewy24' : service.payment_method}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Autoskalowanie</dt>
                                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                        {service.is_autoscaling_enabled ? (
                                            <>
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Włączone
                        </span>
                                            </>
                                        ) : (
                                            <>
                        <span className="text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Wyłączone
                        </span>
                                            </>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={toggleLoading}
                                            onClick={handleToggleAutoscaling}
                                            className="ml-2"
                                        >
                                            {toggleLoading ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : service.is_autoscaling_enabled ? (
                                                'Wyłącz'
                                            ) : (
                                                'Włącz'
                                            )}
                                        </Button>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Ostatnie logowanie</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {service.hosting_account?.last_login_at ? formatDateTime(service.hosting_account.last_login_at) : 'Brak'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Szybkie akcje</h2>

                    <div className="space-y-3">
                        <Button
                            asChild
                            className="w-full justify-start"
                        >
                            <Link to={`https://${service.domain}/cpanel`} target="_blank" rel="noopener noreferrer">
                                <Terminal className="mr-2 h-4 w-4" />
                                Panel DirectAdmin
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="w-full justify-start"
                        >
                            <Link to={`/user/statistics?service=${service.id}`}>
                                <BarChart2 className="mr-2 h-4 w-4" />
                                Statystyki wykorzystania
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="w-full justify-start"
                        >
                            <Link to={`/user/ai-predictions?service=${service.id}`}>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Prognozy AI
                            </Link>
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="w-full justify-start"
                        >
                            <Link to={`/user/backups?service=${service.id}`}>
                                <Database className="mr-2 h-4 w-4" />
                                Kopie zapasowe
                            </Link>
                        </Button>

                        {service.status === 'active' ? (
                            <Button
                                onClick={() => setShowRenewForm(true)}
                                variant="outline"
                                className="w-full justify-start"
                            >
                                <Repeat className="mr-2 h-4 w-4" />
                                Odnów usługę
                            </Button>
                        ) : service.status === 'expired' ? (
                            <Button
                                onClick={() => setShowRenewForm(true)}
                                variant="default"
                                className="w-full justify-start"
                            >
                                <Power className="mr-2 h-4 w-4" />
                                Aktywuj ponownie
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* Resource usage */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Zasoby</h2>
                </div>

                <div className="p-6">
                    {loadingUsage ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    ) : usage ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <ResourceCard
                                    icon={<HardDrive className="h-6 w-6 text-blue-600" />}
                                    title="RAM"
                                    value={`${formatStorageSize(usage.usage?.ram_usage || 0)} / ${formatStorageSize(service.hosting_account?.current_ram || 0)}`}
                                    percentage={calculateUsagePercentage(usage.usage?.ram_usage, service.hosting_account?.current_ram)}
                                    maxValue={formatStorageSize(service.hosting_plan?.max_ram || 0)}
                                />

                                <ResourceCard
                                    icon={<Cpu className="h-6 w-6 text-green-600" />}
                                    title="CPU"
                                    value={`${usage.usage?.cpu_usage || 0}% / ${service.hosting_account?.current_cpu || 0}%`}
                                    percentage={calculateUsagePercentage(usage.usage?.cpu_usage, service.hosting_account?.current_cpu)}
                                    maxValue={`${service.hosting_plan?.max_cpu || 0}%`}
                                />

                                <ResourceCard
                                    icon={<Database className="h-6 w-6 text-purple-600" />}
                                    title="Przestrzeń dyskowa"
                                    value={`${formatStorageSize(usage.usage?.storage_usage || 0)} / ${formatStorageSize(service.hosting_account?.current_storage || 0)}`}
                                    percentage={calculateUsagePercentage(usage.usage?.storage_usage, service.hosting_account?.current_storage)}
                                />

                                <ResourceCard
                                    icon={<Wifi className="h-6 w-6 text-orange-600" />}
                                    title="Transfer"
                                    value={`${formatBandwidth(usage.usage?.bandwidth_usage || 0)} / ${formatBandwidth(service.hosting_account?.current_bandwidth || 0)}`}
                                    percentage={calculateUsagePercentage(usage.usage?.bandwidth_usage, service.hosting_account?.current_bandwidth)}
                                />
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 flex items-start">
                                <div className="flex-shrink-0">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">Autoskalowanie</h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>
                                            {service.is_autoscaling_enabled ? (
                                                <>Autoskalowanie jest włączone. Twoje zasoby zostaną automatycznie zwiększone, jeśli będzie to konieczne.</>
                                            ) : (
                                                <>Autoskalowanie jest wyłączone. Włącz je, aby automatycznie zwiększać zasoby w razie potrzeby.</>
                                            )}
                                        </p>
                                        <p className="mt-1">
                                            Maksymalny limit: {formatStorageSize(service.hosting_plan?.max_ram || 0)} RAM, {service.hosting_plan?.max_cpu || 0}% CPU
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-500">Nie udało się pobrać danych o wykorzystaniu zasobów.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Scaling history */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Historia skalowania</h2>
                    <Link to={`/user/statistics?service=${service.id}`} className="text-sm text-blue-600 hover:text-blue-500 flex items-center">
                        Wszystkie statystyki <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>

                <div className="p-6">
                    {loadingScalingLogs ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    ) : scalingLogs.length > 0 ? (
                        <div className="space-y-4">
                            {scalingLogs.slice(0, 5).map((log) => (
                                <div key={log.id} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 mt-1">
                                            <TrendingUp className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Autoskalowanie zasobów</p>
                                                    <p className="mt-1 text-xs text-gray-500">{formatDateTime(log.created_at)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {log.cost ? `${log.cost.toFixed(2)} PLN` : 'N/A'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {log.payment_status === 'paid' ? 'Opłacone' :
                                                            log.payment_status === 'pending' ? 'Oczekuje na płatność' :
                                                                log.payment_status === 'failed' ? 'Płatność nie powiodła się' :
                                                                    'Status nieznany'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">RAM:</span>{' '}
                                                    <span className="font-medium">
                            {formatStorageSize(log.previous_ram)} → {formatStorageSize(log.new_ram)}
                                                        {log.scaled_ram > 0 && (
                                                            <span className="text-green-600 ml-1">
                                +{formatStorageSize(log.scaled_ram)}
                              </span>
                                                        )}
                          </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">CPU:</span>{' '}
                                                    <span className="font-medium">
                            {log.previous_cpu}% → {log.new_cpu}%
                                                        {log.scaled_cpu > 0 && (
                                                            <span className="text-green-600 ml-1">
                                +{log.scaled_cpu}%
                              </span>
                                                        )}
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {scalingLogs.length > 5 && (
                                <Link
                                    to={`/user/statistics?service=${service.id}`}
                                    className="block text-center text-sm text-blue-600 hover:text-blue-500 mt-4"
                                >
                                    Zobacz pełną historię skalowania
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <RefreshCw className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Brak historii skalowania</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Ta usługa nie ma jeszcze historii skalowania.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const ResourceCard = ({ icon, title, value, percentage, maxValue }) => {
    let barColor = 'bg-green-500';

    if (percentage > 80) {
        barColor = 'bg-red-500';
    } else if (percentage > 60) {
        barColor = 'bg-yellow-500';
    }

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    {icon}
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                    <p className="text-lg font-semibold">{value}</p>
                </div>
            </div>

            <div className="mt-3">
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
              <span className="text-xs font-semibold inline-block text-gray-600">
                Wykorzystanie: {percentage}%
              </span>
                        </div>
                        {maxValue && (
                            <div className="text-right">
                <span className="text-xs font-semibold inline-block text-gray-500">
                  Maks: {maxValue}
                </span>
                            </div>
                        )}
                    </div>
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                            style={{ width: `${percentage}%` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${barColor}`}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ServiceDetails