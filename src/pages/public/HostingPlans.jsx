import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/button'
import { CheckCircle, Server, Shield, X } from 'lucide-react'
import api from '../../lib/axios'

const HostingPlans = () => {
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [billingPeriod, setBillingPeriod] = useState('monthly') // monthly or yearly
    const { user } = useAuthStore()

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true)
                const response = await api.get('/hosting/plans')
                if (response.data.success) {
                    setPlans(response.data.plans)
                } else {
                    setError('Nie udało się pobrać planów hostingowych')
                }
            } catch (err) {
                setError('Wystąpił błąd podczas pobierania planów hostingowych')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchPlans()
    }, [])

    // Fallback plans if API is not available
    useEffect(() => {
        if (loading) return

        if (plans.length === 0 && !error) {
            setPlans([
                {
                    id: 1,
                    name: 'Podstawowy',
                    description: 'Idealny do małych stron i blogów',
                    price_monthly: 25,
                    price_yearly: 250,
                    ram: 1024,
                    cpu: 100,
                    storage: 20480,
                    bandwidth: 100 * 1024,
                    features: ['Darmowe SSL', 'Codzienny backup', 'Wsparcie 24/7', '1 domena'],
                    max_ram: 2048,
                    max_cpu: 200,
                    is_active: true
                },
                {
                    id: 2,
                    name: 'Biznes',
                    description: 'Doskonały dla sklepów i firm',
                    price_monthly: 50,
                    price_yearly: 500,
                    ram: 2048,
                    cpu: 200,
                    storage: 40960,
                    bandwidth: 200 * 1024,
                    features: ['Darmowe SSL', 'Codzienny backup', 'Wsparcie 24/7', '3 domeny', 'Priorytetowa obsługa'],
                    max_ram: 4096,
                    max_cpu: 400,
                    is_active: true
                },
                {
                    id: 3,
                    name: 'Premium',
                    description: 'Dla wymagających projektów',
                    price_monthly: 100,
                    price_yearly: 1000,
                    ram: 4096,
                    cpu: 400,
                    storage: 102400,
                    bandwidth: 500 * 1024,
                    features: ['Darmowe SSL', 'Codzienny backup', 'Wsparcie 24/7', 'Nielimitowana liczba domen', 'Priorytetowa obsługa', 'Dedykowane zasoby'],
                    max_ram: 8192,
                    max_cpu: 800,
                    is_active: true
                }
            ])
        }
    }, [loading, plans, error])

    const formatStorageSize = (sizeInMB) => {
        if (sizeInMB >= 1024) {
            return `${(sizeInMB / 1024).toFixed(0)} GB`
        }
        return `${sizeInMB} MB`
    }

    const formatBandwidth = (bandwidthInMB) => {
        if (bandwidthInMB >= 1024 * 1024) {
            return `${(bandwidthInMB / (1024 * 1024)).toFixed(0)} TB`
        }
        if (bandwidthInMB >= 1024) {
            return `${(bandwidthInMB / 1024).toFixed(0)} GB`
        }
        return `${bandwidthInMB} MB`
    }

    return (
        <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Plany hostingowe</h1>
                    <p className="text-xl text-gray-600">
                        Wybierz plan idealnie dopasowany do Twoich potrzeb. Wszystkie plany zawierają autoskalowanie i gwarancję dostępności 99.9%.
                    </p>

                    <div className="mt-8 inline-flex items-center p-1 bg-gray-200 rounded-lg">
                        <button
                            className={`px-4 py-2 rounded-md ${billingPeriod === 'monthly' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                            onClick={() => setBillingPeriod('monthly')}
                        >
                            Miesięcznie
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md ${billingPeriod === 'yearly' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                            onClick={() => setBillingPeriod('yearly')}
                        >
                            Rocznie <span className="text-green-600 text-sm font-medium">Oszczędzasz do 20%</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-600">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map(plan => (
                            <div
                                key={plan.id}
                                className="bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl"
                            >
                                <div className="p-6 border-b">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <p className="text-gray-600 h-12">{plan.description}</p>
                                    <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly}
                    </span>
                                        <span className="text-gray-600 ml-1">
                      PLN / {billingPeriod === 'monthly' ? 'miesiąc' : 'rok'}
                    </span>
                                    </div>
                                    {billingPeriod === 'yearly' && (
                                        <div className="mt-2 text-green-600 text-sm font-medium">
                                            Oszczędzasz {(plan.price_monthly * 12 - plan.price_yearly).toFixed(0)} PLN rocznie
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <Server className="h-5 w-5 text-blue-600 mr-2" />
                                            <span className="text-gray-700">{formatStorageSize(plan.ram)} RAM</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Shield className="h-5 w-5 text-blue-600 mr-2" />
                                            <span className="text-gray-700">{plan.cpu}% CPU</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Server className="h-5 w-5 text-blue-600 mr-2" />
                                            <span className="text-gray-700">{formatStorageSize(plan.storage)} przestrzeni dyskowej</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Server className="h-5 w-5 text-blue-600 mr-2" />
                                            <span className="text-gray-700">{formatBandwidth(plan.bandwidth)} transfer</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Maks. autoskalowanie do</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <Server className="h-5 w-5 text-green-600 mr-2" />
                                                <span className="text-gray-700">{formatStorageSize(plan.max_ram)} RAM</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Shield className="h-5 w-5 text-green-600 mr-2" />
                                                <span className="text-gray-700">{plan.max_cpu}% CPU</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Funkcje</h4>
                                        <ul className="space-y-2">
                                            {(plan.features || []).map((feature, index) => (
                                                <li key={index} className="flex items-start">
                                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50">
                                    <Button
                                        asChild
                                        className="w-full"
                                    >
                                        <Link to={user ? `/user/purchase?plan=${plan.id}&period=${billingPeriod}` : '/login?redirect=purchase'}>
                                            Wybierz plan
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-16 max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold text-gray-900">Najczęściej zadawane pytania</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Jak działa autoskalowanie?</h4>
                            <p className="text-gray-700">
                                Autoskalowanie automatycznie dostosowuje zasoby Twojego hostingu do aktualnego obciążenia. Gdy ruch na stronie wzrasta, system przydziela więcej zasobów, aby zapewnić płynne działanie. Płacisz tylko za faktycznie wykorzystane zasoby.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Czy mogę zmienić plan w trakcie jego trwania?</h4>
                            <p className="text-gray-700">
                                Tak, w każdej chwili możesz przejść na wyższy plan. Różnica w cenie zostanie proporcjonalnie obliczona i dodana do Twojego konta.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Jak naliczane są opłaty za autoskalowanie?</h4>
                            <p className="text-gray-700">
                                Opłaty za autoskalowanie są naliczane według aktualnego cennika. Możesz ustawić maksymalny limit zasobów, aby kontrolować koszty. Wszystkie opłaty są widoczne w panelu klienta.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HostingPlans