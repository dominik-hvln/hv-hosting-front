import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
    ArrowLeft,
    Server,
    CheckCircle,
    HardDrive,
    Cpu,
    Database,
    Wifi,
    Calendar,
    CreditCard,
    Wallet,
    TicketPercent,
    AlertCircle
} from 'lucide-react'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

const Purchase = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [domain, setDomain] = useState('')
    const [period, setPeriod] = useState('monthly')
    const [paymentMethod, setPaymentMethod] = useState('wallet')
    const [promoCode, setPromoCode] = useState('')
    const [wallet, setWallet] = useState(null)
    const [isAutoscalingEnabled, setIsAutoscalingEnabled] = useState(true)
    const [promoError, setPromoError] = useState(null)
    const [promoDiscount, setPromoDiscount] = useState(null)
    const [formError, setFormError] = useState(null)
    const [validatingPromo, setValidatingPromo] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Parse query parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const planId = params.get('plan')
        const periodParam = params.get('period')

        if (planId) {
            setPlanIdFromParams(parseInt(planId))
        }

        if (periodParam && ['monthly', 'yearly'].includes(periodParam)) {
            setPeriod(periodParam)
        }
    }, [location])

    // Set plan from URL parameter
    const setPlanIdFromParams = (planId) => {
        // This will be done when plans are loaded
        setSelectedPlan(planId)
    }

    // Fetch plans
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

    // Fetch wallet
    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const response = await api.get('/wallet')
                if (response.data.success) {
                    setWallet(response.data.wallet)
                }
            } catch (err) {
                console.error('Error fetching wallet:', err)
            }
        }

        fetchWallet()
    }, [])

    const validatePromoCode = async () => {
        if (!promoCode.trim() || !selectedPlan) return

        setPromoError(null)
        setPromoDiscount(null)
        setValidatingPromo(true)

        try {
            const response = await api.post('/promo-codes/validate', {
                code: promoCode,
                plan_id: selectedPlan,
                amount: getSelectedPlanPrice()
            })

            if (response.data.success) {
                setPromoDiscount({
                    amount: response.data.discount,
                    finalAmount: response.data.final_amount
                })
            } else {
                setPromoError(response.data.message || 'Nieprawidłowy kod promocyjny')
            }
        } catch (err) {
            setPromoError('Wystąpił błąd podczas weryfikacji kodu promocyjnego')
            console.error(err)
        } finally {
            setValidatingPromo(false)
        }
    }

    const getSelectedPlanPrice = () => {
        if (!selectedPlan) return 0

        const plan = plans.find(p => p.id === selectedPlan)
        if (!plan) return 0

        return period === 'yearly' ? plan.price_yearly : plan.price_monthly
    }

    const getFinalPrice = () => {
        const basePrice = getSelectedPlanPrice()
        if (promoDiscount) {
            return promoDiscount.finalAmount
        }
        return basePrice
    }

    const getSelectedPlanDetails = () => {
        if (!selectedPlan) return null
        return plans.find(p => p.id === selectedPlan)
    }

    const hasWalletFunds = () => {
        return wallet && wallet.balance >= getFinalPrice()
    }

    const handlePurchase = async (e) => {
        e.preventDefault()
        setFormError(null)

        // Validation
        if (!selectedPlan) {
            setFormError('Wybierz plan hostingowy')
            return
        }

        if (!domain.trim()) {
            setFormError('Wprowadź domenę')
            return
        }

        // Simple domain validation
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
        if (!domainRegex.test(domain)) {
            setFormError('Wprowadź poprawną domenę (np. example.com)')
            return
        }

        if (paymentMethod === 'wallet' && !hasWalletFunds()) {
            setFormError('Niewystarczające środki w portfelu')
            return
        }

        // Submit purchase
        try {
            setSubmitting(true)

            const purchaseData = {
                plan_id: selectedPlan,
                domain: domain,
                period: period,
                payment_method: paymentMethod,
                is_autoscaling_enabled: isAutoscalingEnabled,
                return_url: window.location.origin + '/user/services',
            }

            if (promoCode && promoDiscount) {
                purchaseData.promo_code = promoCode
            }

            const response = await api.post('/hosting/purchase', purchaseData)

            if (response.data.success) {
                if (paymentMethod === 'wallet') {
                    // If paid from wallet, redirect to services
                    navigate('/user/services')
                } else {
                    // For external payment methods, redirect to payment page
                    window.location.href = response.data.payment.payment_url
                }
            } else {
                setFormError(response.data.message || 'Wystąpił błąd podczas zamawiania usługi')
            }
        } catch (err) {
            setFormError('Wystąpił błąd podczas zamawiania usługi')
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    // Format storage size to human-readable format
    const formatStorageSize = (sizeInMB) => {
        if (sizeInMB >= 1024) {
            return `${(sizeInMB / 1024).toFixed(0)} GB`
        }
        return `${sizeInMB} MB`
    }

    // Format bandwidth to human-readable format
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
        <div>
            <div className="flex items-center mb-6">
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                >
                    <Link to="/user/services" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Wróć do usług
                    </Link>
                </Button>
                <h1 className="ml-4 text-2xl font-bold text-gray-900">Zamów nową usługę</h1>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {/* Step 1: Choose a plan */}
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">1. Wybierz plan hostingowy</h2>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="flex justify-center py-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                                </div>
                            ) : plans.length > 0 ? (
                                <div className="space-y-4">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                                selectedPlan === plan.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                                            }`}
                                            onClick={() => setSelectedPlan(plan.id)}
                                        >
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                                        selectedPlan === plan.id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                    }`}>
                                                        {selectedPlan === plan.id && (
                                                            <CheckCircle className="h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                                                            <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-semibold text-gray-900">
                                                                {period === 'monthly' ? plan.price_monthly.toFixed(2) : plan.price_yearly.toFixed(2)} PLN
                                                            </div>
                                                            <p className="text-sm text-gray-500">
                                                                {period === 'monthly' ? 'miesięcznie' : 'rocznie'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div className="flex items-center">
                                                            <HardDrive className="h-5 w-5 text-blue-600 mr-2" />
                                                            <span className="text-sm">{formatStorageSize(plan.ram)} RAM</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Cpu className="h-5 w-5 text-blue-600 mr-2" />
                                                            <span className="text-sm">{plan.cpu}% CPU</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Database className="h-5 w-5 text-blue-600 mr-2" />
                                                            <span className="text-sm">{formatStorageSize(plan.storage)} dysk</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Wifi className="h-5 w-5 text-blue-600 mr-2" />
                                                            <span className="text-sm">{formatBandwidth(plan.bandwidth)} transfer</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-500">Nie znaleziono dostępnych planów hostingowych.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Configuration */}
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">2. Konfiguracja</h2>
                        </div>

                        <div className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                                        Domena
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            id="domain"
                                            name="domain"
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                            placeholder="example.com"
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Wprowadź swoją domenę. Jeśli nie masz domeny, możesz ją zarejestrować lub użyć naszej subdomeny.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Okres rozliczeniowy
                                    </label>
                                    <div className="mt-1 grid grid-cols-2 gap-3">
                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                period === 'monthly'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                                            }`}
                                            onClick={() => setPeriod('monthly')}
                                        >
                                            <div className="flex items-center">
                                                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                                    period === 'monthly' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                }`}>
                                                    {period === 'monthly' && (
                                                        <CheckCircle className="h-4 w-4 text-white" />
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-gray-900">Miesięczny</h3>
                                                    <p className="text-xs text-gray-500">Płatność co miesiąc</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                period === 'yearly'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                                            }`}
                                            onClick={() => setPeriod('yearly')}
                                        >
                                            <div className="flex items-center">
                                                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                                    period === 'yearly' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                }`}>
                                                    {period === 'yearly' && (
                                                        <CheckCircle className="h-4 w-4 text-white" />
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-gray-900">Roczny</h3>
                                                    <p className="text-xs text-gray-500">Oszczędzasz do 20%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Autoskalowanie
                                        </label>
                                        <label className="inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={isAutoscalingEnabled}
                                                onChange={() => setIsAutoscalingEnabled(!isAutoscalingEnabled)}
                                            />
                                            <div className={`relative w-11 h-6 transition-colors duration-200 ease-in-out rounded-full ${isAutoscalingEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}>
                                                <div className={`absolute left-0.5 top-0.5 bg-white border-gray-300 w-5 h-5 rounded-full transition-transform duration-200 ease-in-out transform ${isAutoscalingEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                            </div>
                                        </label>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Autoskalowanie automatycznie zwiększa zasoby w razie potrzeby. Płacisz tylko za dodatkowe zużyte zasoby.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="promo_code" className="block text-sm font-medium text-gray-700">
                                        Kod promocyjny
                                    </label>
                                    <div className="mt-1 flex">
                                        <input
                                            type="text"
                                            id="promo_code"
                                            name="promo_code"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="WELCOME10"
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md rounded-r-none"
                                        />
                                        <Button
                                            type="button"
                                            disabled={!promoCode.trim() || !selectedPlan || validatingPromo}
                                            onClick={validatePromoCode}
                                            className="rounded-l-none"
                                        >
                                            {validatingPromo ? 'Weryfikacja...' : 'Zastosuj'}
                                        </Button>
                                    </div>

                                    {promoError && (
                                        <p className="mt-1 text-sm text-red-600">{promoError}</p>
                                    )}

                                    {promoDiscount && (
                                        <p className="mt-1 text-sm text-green-600">
                                            Kod zastosowano: zniżka {promoDiscount.amount.toFixed(2)} PLN
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Payment */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">3. Płatność</h2>
                        </div>

                        <div className="p-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Metoda płatności
                                    </label>
                                    <div className="mt-3 space-y-3">
                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                paymentMethod === 'wallet'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                                            }`}
                                            onClick={() => setPaymentMethod('wallet')}
                                        >
                                            <div className="flex items-center">
                                                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                                    paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                }`}>
                                                    {paymentMethod === 'wallet' && (
                                                        <CheckCircle className="h-4 w-4 text-white" />
                                                    )}
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <div className="flex justify-between">
                                                        <div className="flex items-center">
                                                            <Wallet className="h-5 w-5 text-blue-600 mr-2" />
                                                            <h3 className="text-sm font-medium text-gray-900">Portfel</h3>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                Saldo: {wallet?.balance?.toFixed(2) || '0.00'} PLN
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                paymentMethod === 'stripe'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                                            }`}
                                            onClick={() => setPaymentMethod('stripe')}
                                        >
                                            <div className="flex items-center">
                                                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                                    paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                }`}>
                                                    {paymentMethod === 'stripe' && (
                                                        <CheckCircle className="h-4 w-4 text-white" />
                                                    )}
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <div className="flex items-center">
                                                        <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                                                        <h3 className="text-sm font-medium text-gray-900">Karta płatnicza (Stripe)</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                paymentMethod === 'p24'
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                                            }`}
                                            onClick={() => setPaymentMethod('p24')}
                                        >
                                            <div className="flex items-center">
                                                <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                                    paymentMethod === 'p24' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                }`}>
                                                    {paymentMethod === 'p24' && (
                                                        <CheckCircle className="h-4 w-4 text-white" />
                                                    )}
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <div className="flex items-center">
                                                        <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                                                        <h3 className="text-sm font-medium text-gray-900">Przelewy24</h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {formError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                                        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                                        <p>{formError}</p>
                                    </div>
                                )}

                                <div>
                                    <Button
                                        type="button"
                                        onClick={handlePurchase}
                                        disabled={submitting || !selectedPlan || !domain.trim()}
                                        className="w-full"
                                    >
                                        {submitting ? 'Przetwarzanie...' : 'Zamów teraz'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow sticky top-6">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Podsumowanie zamówienia</h2>
                        </div>

                        <div className="p-6">
                            {selectedPlan ? (
                                <>
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-base font-medium text-gray-900">
                                                {getSelectedPlanDetails()?.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {getSelectedPlanDetails()?.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">RAM:</span>
                                                <span className="ml-1 font-medium">{formatStorageSize(getSelectedPlanDetails()?.ram || 0)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">CPU:</span>
                                                <span className="ml-1 font-medium">{getSelectedPlanDetails()?.cpu || 0}%</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Przestrzeń:</span>
                                                <span className="ml-1 font-medium">{formatStorageSize(getSelectedPlanDetails()?.storage || 0)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Transfer:</span>
                                                <span className="ml-1 font-medium">{formatBandwidth(getSelectedPlanDetails()?.bandwidth || 0)}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-500">Plan {period === 'monthly' ? 'miesięczny' : 'roczny'}</span>
                                                <span className="text-sm font-medium">{getSelectedPlanPrice().toFixed(2)} PLN</span>
                                            </div>

                                            {promoDiscount && (
                                                <div className="flex justify-between mb-2 text-green-600">
                                                    <span className="text-sm">Kod promocyjny</span>
                                                    <span className="text-sm font-medium">-{promoDiscount.amount.toFixed(2)} PLN</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between pt-4 border-t border-gray-200">
                                                <span className="text-base font-medium text-gray-900">Razem</span>
                                                <span className="text-base font-bold text-gray-900">{getFinalPrice().toFixed(2)} PLN</span>
                                            </div>

                                            <div className="mt-1 text-xs text-gray-500 text-right">
                                                {period === 'monthly' ? 'miesięcznie' : 'rocznie'}
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200 space-y-2">
                                            <div className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                                <span className="text-sm text-gray-600">Okres: {period === 'monthly' ? '1 miesiąc' : '1 rok'}</span>
                                            </div>
                                            <div className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                                <span className="text-sm text-gray-600">Autoskalowanie: {isAutoscalingEnabled ? 'Włączone' : 'Wyłączone'}</span>
                                            </div>
                                            <div className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                                <span className="text-sm text-gray-600">Konfiguracja: w ciągu 24 godzin</span>
                                            </div>
                                            <div className="flex items-start">
                                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                                <span className="text-sm text-gray-600">Wsparcie techniczne 24/7</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <Server className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Brak wybranego planu</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Wybierz plan hostingowy, aby zobaczyć podsumowanie zamówienia.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Purchase