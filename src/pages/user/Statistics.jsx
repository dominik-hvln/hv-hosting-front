import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
    BarChart2,
    TrendingUp,
    Server,
    HardDrive,
    Cpu,
    Database,
    Wifi,
    Calendar,
    RefreshCw,
    ArrowDown,
    ArrowUp,
    ExternalLink,
    Filter,
    ChevronDown,
    ChevronUp,
    PieChart,
    LineChart,
    BarChart
} from 'lucide-react'
import api from '../../lib/axios'
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

const Statistics = () => {
    const location = useLocation()
    const [services, setServices] = useState([])
    const [selectedService, setSelectedService] = useState(null)
    const [stats, setStats] = useState(null)
    const [resourceStats, setResourceStats] = useState(null)
    const [scalingLogs, setScalingLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [statsLoading, setStatsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [timeRange, setTimeRange] = useState('7d') // 24h, 7d, 30d, 90d
    const [chartType, setChartType] = useState('line')
    const [chartMetric, setChartMetric] = useState('ram')

    // Parse query parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const serviceId = params.get('service')

        if (serviceId) {
            setSelectedService(parseInt(serviceId))
        }
    }, [location])

    // Fetch services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true)
                const response = await api.get('/hosting/services')
                if (response.data.success) {
                    setServices(response.data.services)

                    // If no service is selected, select the first active one
                    if (!selectedService && response.data.services.length > 0) {
                        const activeService = response.data.services.find(s => s.status === 'active')
                        if (activeService) {
                            setSelectedService(activeService.id)
                        } else if (response.data.services[0]) {
                            setSelectedService(response.data.services[0].id)
                        }
                    }
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

    // Fetch statistics and scaling logs when service changes
    useEffect(() => {
        if (!selectedService) return

        const fetchStatsAndLogs = async () => {
            try {
                setStatsLoading(true)

                // Get global stats
                const statsResponse = await api.get('/statistics/resources')
                if (statsResponse.data.success) {
                    setStats(statsResponse.data)
                }

                // Get service-specific resource usage
                const resourceResponse = await api.get(`/hosting/services/${selectedService}/resource-usage`)
                if (resourceResponse.data.success) {
                    setResourceStats(resourceResponse.data)
                }

                // Get scaling logs
                const logsResponse = await api.get(`/hosting/services/${selectedService}/scaling-logs`)
                if (logsResponse.data.success) {
                    setScalingLogs(logsResponse.data.logs.data)
                }
            } catch (err) {
                console.error('Error fetching statistics:', err)
            } finally {
                setStatsLoading(false)
            }
        }

        fetchStatsAndLogs()
    }, [selectedService])

    const getSelectedServiceDetails = () => {
        if (!selectedService) return null
        return services.find(s => s.id === selectedService)
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatStorageSize = (sizeInMB) => {
        if (!sizeInMB && sizeInMB !== 0) return 'N/A'
        if (sizeInMB >= 1024) {
            return `${(sizeInMB / 1024).toFixed(0)} GB`
        }
        return `${sizeInMB} MB`
    }

    const calculateUsagePercentage = (used, total) => {
        if (used === null || used === undefined || total === null || total === undefined || total === 0) {
            return 0
        }
        return Math.min(100, Math.round((used / total) * 100))
    }

    // Generate sample chart data (in a real app, this would come from the API)
    const getChartData = () => {
        const now = new Date()
        const data = []

        let days = 7
        if (timeRange === '24h') days = 1
        if (timeRange === '30d') days = 30
        if (timeRange === '90d') days = 90

        // We'll create hourly data points for 24h, and daily for other ranges
        const isHourly = timeRange === '24h'
        const pointsCount = isHourly ? 24 : days

        for (let i = 0; i < pointsCount; i++) {
            const date = new Date(now)
            if (isHourly) {
                date.setHours(date.getHours() - (pointsCount - i - 1))
            } else {
                date.setDate(date.getDate() - (pointsCount - i - 1))
            }

            // Generate realistic-looking data with some randomness
            // but also with trends
            const baseValue = {
                ram: 500, // Base RAM usage in MB
                cpu: 30,  // Base CPU usage in percentage
                disk: 2000, // Base disk usage in MB
                bandwidth: 50 // Base bandwidth in MB/day
            }

            const dailyVariation = {
                ram: 200, // RAM can vary by 200MB
                cpu: 15,  // CPU can vary by 15%
                disk: 500, // Disk can vary by 500MB
                bandwidth: 30 // Bandwidth can vary by 30MB
            }

            // Add some randomness
            const random = Math.random() * 2 - 1 // Between -1 and 1

            // Add a trend - increases over time
            const trendFactor = i / pointsCount // 0 to 1

            // For RAM and CPU, add daily patterns (higher during day, lower at night)
            // but only for hourly data
            let timeOfDayFactor = 0
            if (isHourly) {
                const hour = date.getHours()
                // Higher during business hours (9am-5pm)
                if (hour >= 9 && hour <= 17) {
                    timeOfDayFactor = 0.3 // 30% higher during business hours
                } else if (hour >= 1 && hour <= 5) {
                    timeOfDayFactor = -0.2 // 20% lower during night
                }
            }

            const values = {
                ram: Math.max(0, Math.round(baseValue.ram + (random * dailyVariation.ram) + (trendFactor * 300) + (timeOfDayFactor * baseValue.ram))),
                cpu: Math.max(0, Math.min(100, Math.round(baseValue.cpu + (random * dailyVariation.cpu) + (trendFactor * 20) + (timeOfDayFactor * baseValue.cpu)))),
                disk: Math.max(0, Math.round(baseValue.disk + (random * dailyVariation.disk) + (trendFactor * 1000))), // Disk usage only increases
                bandwidth: Math.max(0, Math.round(baseValue.bandwidth + (random * dailyVariation.bandwidth) + (timeOfDayFactor * baseValue.bandwidth * 2)))
            }

            data.push({
                date: date.toISOString(),
                name: isHourly
                    ? date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
                    : date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
                ram: values.ram,
                cpu: values.cpu,
                disk: values.disk,
                bandwidth: values.bandwidth
            })
        }

        return data
    }

    const chartData = getChartData()
    const selectedService_data = getSelectedServiceDetails()

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Statystyki i monitoring</h1>

                {/* Service selector */}
                {!loading && services.length > 0 && (
                    <div className="mt-4 md:mt-0">
                        <select
                            value={selectedService || ''}
                            onChange={(e) => setSelectedService(parseInt(e.target.value))}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="" disabled>Wybierz usługę</option>
                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.domain} ({service.hosting_plan?.name})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            ) : services.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <Server className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="mt-2 text-lg font-medium text-gray-900">Brak usług</h2>
                    <p className="mt-1 text-gray-500">
                        Nie masz jeszcze żadnych usług hostingowych. Zamów pierwszą usługę, aby zobaczyć statystyki.
                    </p>
                    <Button
                        asChild
                        className="mt-4"
                    >
                        <Link to="/user/purchase">Zamów usługę</Link>
                    </Button>
                </div>
            ) : !selectedService ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="mt-2 text-lg font-medium text-gray-900">Wybierz usługę</h2>
                    <p className="mt-1 text-gray-500">
                        Wybierz usługę z listy, aby zobaczyć statystyki.
                    </p>
                </div>
            ) : (
                <>
                    {/* Resource usage overview */}
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Aktualne wykorzystanie zasobów</h2>
                        </div>

                        <div className="p-6">
                            {statsLoading ? (
                                <div className="flex justify-center py-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* RAM Usage */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <HardDrive className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-gray-900">RAM</h3>
                                                <p className="text-lg font-semibold">
                                                    {formatStorageSize(resourceStats?.usage?.ram_usage || 0)} / {formatStorageSize(selectedService_data?.hosting_account?.current_ram || 0)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="relative pt-1">
                                                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                                    <div
                                                        style={{ width: `${calculateUsagePercentage(resourceStats?.usage?.ram_usage, selectedService_data?.hosting_account?.current_ram)}%` }}
                                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                                                    ></div>
                                                </div>
                                                <div className="flex mt-1 text-xs justify-between">
                                                    <span>{calculateUsagePercentage(resourceStats?.usage?.ram_usage, selectedService_data?.hosting_account?.current_ram)}% wykorzystane</span>
                                                    <span>Maks: {formatStorageSize(selectedService_data?.hosting_plan?.max_ram || 0)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CPU Usage */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <Cpu className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-gray-900">CPU</h3>
                                                <p className="text-lg font-semibold">
                                                    {resourceStats?.usage?.cpu_usage || 0}% / {selectedService_data?.hosting_account?.current_cpu || 0}%
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="relative pt-1">
                                                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                                    <div
                                                        style={{ width: `${calculateUsagePercentage(resourceStats?.usage?.cpu_usage, selectedService_data?.hosting_account?.current_cpu)}%` }}
                                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                                                    ></div>
                                                </div>
                                                <div className="flex mt-1 text-xs justify-between">
                                                    <span>{calculateUsagePercentage(resourceStats?.usage?.cpu_usage, selectedService_data?.hosting_account?.current_cpu)}% wykorzystane</span>
                                                    <span>Maks: {selectedService_data?.hosting_plan?.max_cpu || 0}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Disk Usage */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <Database className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-gray-900">Przestrzeń dyskowa</h3>
                                                <p className="text-lg font-semibold">
                                                    {formatStorageSize(resourceStats?.usage?.storage_usage || 0)} / {formatStorageSize(selectedService_data?.hosting_account?.current_storage || 0)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="relative pt-1">
                                                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                                    <div
                                                        style={{ width: `${calculateUsagePercentage(resourceStats?.usage?.storage_usage, selectedService_data?.hosting_account?.current_storage)}%` }}
                                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                                                    ></div>
                                                </div>
                                                <div className="flex mt-1 text-xs justify-between">
                                                    <span>{calculateUsagePercentage(resourceStats?.usage?.storage_usage, selectedService_data?.hosting_account?.current_storage)}% wykorzystane</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bandwidth Usage */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <Wifi className="h-6 w-6 text-orange-600" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-gray-900">Transfer</h3>
                                                <p className="text-lg font-semibold">
                                                    {formatStorageSize(resourceStats?.usage?.bandwidth_usage || 0)} / {formatStorageSize(selectedService_data?.hosting_account?.current_bandwidth || 0)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <div className="relative pt-1">
                                                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                                                    <div
                                                        style={{ width: `${calculateUsagePercentage(resourceStats?.usage?.bandwidth_usage, selectedService_data?.hosting_account?.current_bandwidth)}%` }}
                                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
                                                    ></div>
                                                </div>
                                                <div className="flex mt-1 text-xs justify-between">
                                                    <span>{calculateUsagePercentage(resourceStats?.usage?.bandwidth_usage, selectedService_data?.hosting_account?.current_bandwidth)}% wykorzystane</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resource usage chart */}
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-lg font-medium text-gray-900">Wykres wykorzystania zasobów</h2>
                                <div className="mt-2 sm:mt-0 flex space-x-2">
                                    <select
                                        value={timeRange}
                                        onChange={(e) => setTimeRange(e.target.value)}
                                        className="text-sm border-gray-300 rounded-md"
                                    >
                                        <option value="24h">Ostatnie 24h</option>
                                        <option value="7d">Ostatnie 7 dni</option>
                                        <option value="30d">Ostatnie 30 dni</option>
                                        <option value="90d">Ostatnie 90 dni</option>
                                    </select>

                                    <select
                                        value={chartMetric}
                                        onChange={(e) => setChartMetric(e.target.value)}
                                        className="text-sm border-gray-300 rounded-md"
                                    >
                                        <option value="ram">RAM</option>
                                        <option value="cpu">CPU</option>
                                        <option value="disk">Przestrzeń dyskowa</option>
                                        <option value="bandwidth">Transfer</option>
                                    </select>

                                    <select
                                        value={chartType}
                                        onChange={(e) => setChartType(e.target.value)}
                                        className="text-sm border-gray-300 rounded-md"
                                    >
                                        <option value="line">Liniowy</option>
                                        <option value="area">Obszarowy</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartType === 'line' ? (
                                        <ReLineChart
                                            data={chartData}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            {chartMetric === 'ram' && (
                                                <Line
                                                    type="monotone"
                                                    name="RAM (MB)"
                                                    dataKey="ram"
                                                    stroke="#3b82f6"
                                                    activeDot={{ r: 8 }}
                                                />
                                            )}
                                            {chartMetric === 'cpu' && (
                                                <Line
                                                    type="monotone"
                                                    name="CPU (%)"
                                                    dataKey="cpu"
                                                    stroke="#22c55e"
                                                    activeDot={{ r: 8 }}
                                                />
                                            )}
                                            {chartMetric === 'disk' && (
                                                <Line
                                                    type="monotone"
                                                    name="Dysk (MB)"
                                                    dataKey="disk"
                                                    stroke="#a855f7"
                                                    activeDot={{ r: 8 }}
                                                />
                                            )}
                                            {chartMetric === 'bandwidth' && (
                                                <Line
                                                    type="monotone"
                                                    name="Transfer (MB)"
                                                    dataKey="bandwidth"
                                                    stroke="#f97316"
                                                    activeDot={{ r: 8 }}
                                                />
                                            )}
                                        </ReLineChart>
                                    ) : (
                                        <AreaChart
                                            data={chartData}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            {chartMetric === 'ram' && (
                                                <Area
                                                    type="monotone"
                                                    name="RAM (MB)"
                                                    dataKey="ram"
                                                    stroke="#3b82f6"
                                                    fill="#93c5fd"
                                                />
                                            )}
                                            {chartMetric === 'cpu' && (
                                                <Area
                                                    type="monotone"
                                                    name="CPU (%)"
                                                    dataKey="cpu"
                                                    stroke="#22c55e"
                                                    fill="#86efac"