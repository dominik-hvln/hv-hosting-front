import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
    Server,
    CheckCircle,
    AlertCircle,
    Clock,
    RefreshCw,
    ChevronRight,
    HardDrive,
    Cpu,
    Gauge,
    Calendar,
    ToggleLeft,
    Search,
    Plus,
    Filter
} from 'lucide-react'
import api from '../../lib/axios'

const Services = () => {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true)
                const response = await api.get('/hosting/services')
                if (response.data.success) {
                    setServices(response.data.services)
                } else {
                    setError('Nie udało się pobrać listy usług')
                }
            } catch (err) {
                setError('Wystąpił błąd podczas pobierania usług')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchServices()
    }, [])

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

    const formatStorageSize = (sizeInMB) => {
        if (sizeInMB >= 1024) {
            return `${(sizeInMB / 1024).toFixed(0)} GB`
        }
        return `${sizeInMB} MB`
    }

    const filteredServices = services.filter(service => {
        // Filter by status
        if (statusFilter !== 'all' && service.status !== statusFilter) {
            return false
        }

        // Filter by search query (domain or plan name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            const domain = service.domain?.toLowerCase() || ''
            const planName = service.hosting_plan?.name?.toLowerCase() || ''

            return domain.includes(query) || planName.includes(query)
        }

        return true
    })

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Usługi hostingowe</h1>

                <Button
                    asChild
                    className="mt-4 md:mt-0"
                >
                    <Link to="/user/purchase" className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Zamów nową usługę
                    </Link>
                </Button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Szukaj domeny lub planu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <div className="flex space-x-2">
                                <button
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                        statusFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                    onClick={() => setStatusFilter('all')}
                                >
                                    Wszystkie
                                </button>
                                <button
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                        statusFilter === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                    onClick={() => setStatusFilter('active')}
                                >
                                    Aktywne
                                </button>
                                <button
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                        statusFilter === 'suspended' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                    onClick={() => setStatusFilter('suspended')}
                                >
                                    Zawieszone
                                </button>
                                <button
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                                        statusFilter === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                    onClick={() => setStatusFilter('expired')}
                                >
                                    Wygasłe
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services list */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Twoje usługi</h2>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredServices.length > 0 ? (
                        <div className="space-y-6">
                            {filteredServices.map((service) => (
                                <div
                                    key={service.id}
                                    className="bg-gray-50 rounded-lg shadow-sm overflow-hidden"
                                >
                                    <div className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 mt-1">
                                                    <Server className="h-8 w-8 text-blue-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="flex items-center">
                                                        <h3 className="text-lg font-medium text-gray-900">{service.domain}</h3>
                                                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                              {service.status === 'active' && <CheckCircle className="mr-1 h-3 w-3" />}
                                                            {service.status === 'suspended' && <AlertCircle className="mr-1 h-3 w-3" />}
                                                            {service.status === 'expired' && <Clock className="mr-1 h-3 w-3" />}
                                                            {service.status === 'active' ? 'Aktywna' :
                                                                service.status === 'suspended' ? 'Zawieszona' :
                                                                    service.status === 'expired' ? 'Wygasła' : service.status}
                            </span>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-600">
                                                        Plan: {service.hosting_plan?.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 sm:mt-0">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link to={`/user/services/${service.id}`} className="flex items-center">
                                                        Szczegóły <ChevronRight className="ml-1 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">
                                                <HardDrive className="h-5 w-5 text-blue-600 mr-2" />
                                                <div>
                                                    <p className="text-xs text-gray-500">RAM</p>
                                                    <p className="text-sm font-semibold">{formatStorageSize(service.hosting_account?.current_ram || 0)}</p>
                                                </div>
                                            </div>

                                            <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">
                                                <Cpu className="h-5 w-5 text-blue-600 mr-2" />
                                                <div>
                                                    <p className="text-xs text-gray-500">CPU</p>
                                                    <p className="text-sm font-semibold">{service.hosting_account?.current_cpu || 0}%</p>
                                                </div>
                                            </div>

                                            <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">

                        <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-xs text-gray-500">Wygasa</p>
                          <p className="text-sm font-semibold">{formatDate(service.end_date)}</p>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg shadow-sm flex items-center">
                        <ToggleLeft className={`h-5 w-5 ${service.is_autoscaling_enabled ? 'text-green-600' : 'text-gray-400'} mr-2`} />
                        <div>
                          <p className="text-xs text-gray-500">Autoskalowanie</p>
                          <p className="text-sm font-semibold">
                            {service.is_autoscaling_enabled ? 'Włączone' : 'Wyłączone'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <RefreshCw className="mx-auto h-12 w-12 text-gray-400" />
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
    </div>
  )
}

export default Services