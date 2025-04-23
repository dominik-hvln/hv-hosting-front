import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import {
    CreditCard,
    PlusCircle,
    ArrowDownCircle,
    ArrowUpCircle,
    Clock,
    Search,
    RefreshCw,
    Banknote,
    TicketPercent,
    ChevronDown,
    ChevronUp,
    X
} from 'lucide-react'
import api from '../../lib/axios'
import { useAuthStore } from '../../stores/authStore'

const Wallet = () => {
    const [wallet, setWallet] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [transactionsLoading, setTransactionsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showAddFunds, setShowAddFunds] = useState(false)
    const [showApplyPromo, setShowApplyPromo] = useState(false)
    const [amount, setAmount] = useState('50')
    const [promoCode, setPromoCode] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('stripe')
    const [promoError, setPromoError] = useState(null)
    const [promoSuccess, setPromoSuccess] = useState(null)
    const [filterType, setFilterType] = useState('all')
    const [sortOrder, setSortOrder] = useState('desc')
    const { user } = useAuthStore()

    // Fetch wallet data
    useEffect(() => {
        const fetchWallet = async () => {
            try {
                setLoading(true)
                const response = await api.get('/wallet')
                if (response.data.success) {
                    setWallet(response.data.wallet)
                } else {
                    setError('Nie udało się pobrać danych portfela')
                }
            } catch (err) {
                setError('Wystąpił błąd podczas pobierania danych portfela')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchWallet()
    }, [])

    // Fetch transactions
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setTransactionsLoading(true)
                const params = {}

                if (filterType !== 'all') {
                    params.type = filterType
                }

                const response = await api.get('/wallet/transactions', { params })
                if (response.data.success) {
                    let sortedTransactions = [...response.data.transactions.data]

                    // Apply sorting
                    sortedTransactions.sort((a, b) => {
                        const dateA = new Date(a.created_at)
                        const dateB = new Date(b.created_at)
                        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
                    })

                    setTransactions(sortedTransactions)
                } else {
                    setError('Nie udało się pobrać historii transakcji')
                }
            } catch (err) {
                setError('Wystąpił błąd podczas pobierania historii transakcji')
                console.error(err)
            } finally {
                setTransactionsLoading(false)
            }
        }

        fetchTransactions()
    }, [filterType, sortOrder])

    const handleAddFunds = async (e) => {
        e.preventDefault()

        try {
            const parsedAmount = parseFloat(amount)

            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                setError('Wprowadź poprawną kwotę')
                return
            }

            const response = await api.post('/wallet/add-funds', {
                amount: parsedAmount,
                payment_method: paymentMethod,
                return_url: window.location.origin + '/user/wallet'
            })

            if (response.data.success) {
                // Redirect to payment page
                window.location.href = response.data.payment.payment_url
            } else {
                setError(response.data.message || 'Wystąpił błąd podczas przetwarzania płatności')
            }
        } catch (err) {
            setError('Wystąpił błąd podczas przetwarzania płatności')
            console.error(err)
        }
    }

    const handleApplyPromoCode = async (e) => {
        e.preventDefault()
        setPromoError(null)
        setPromoSuccess(null)

        if (!promoCode.trim()) {
            setPromoError('Wprowadź kod promocyjny')
            return
        }

        try {
            const response = await api.post('/wallet/promo-code', {
                code: promoCode
            })

            if (response.data.success) {
                setPromoSuccess('Kod promocyjny został zastosowany pomyślnie')
                setPromoCode('')

                // Refresh wallet balance
                const walletResponse = await api.get('/wallet')
                if (walletResponse.data.success) {
                    setWallet(walletResponse.data.wallet)
                }

                // Refresh transactions
                const transactionsResponse = await api.get('/wallet/transactions')
                if (transactionsResponse.data.success) {
                    setTransactions(transactionsResponse.data.transactions.data)
                }
            } else {
                setPromoError(response.data.message || 'Nieprawidłowy kod promocyjny')
            }
        } catch (err) {
            setPromoError('Wystąpił błąd podczas stosowania kodu promocyjnego')
            console.error(err)
        }
    }

    const toggleSort = () => {
        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    }

    const getTransactionIcon = (transaction) => {
        if (transaction.amount > 0) {
            if (transaction.source === 'deposit') {
                return <ArrowDownCircle className="h-8 w-8 text-green-500" />
            } else if (transaction.source === 'promo_code') {
                return <TicketPercent className="h-8 w-8 text-purple-500" />
            } else if (transaction.source === 'referral') {
                return <Banknote className="h-8 w-8 text-yellow-500" />
            }
            return <ArrowDownCircle className="h-8 w-8 text-green-500" />
        } else {
            return <ArrowUpCircle className="h-8 w-8 text-red-500" />
        }
    }

    const getTransactionTitle = (transaction) => {
        if (transaction.amount > 0) {
            if (transaction.source === 'deposit') {
                return 'Doładowanie portfela'
            } else if (transaction.source === 'promo_code') {
                return 'Kod promocyjny'
            } else if (transaction.source === 'referral') {
                return 'Bonus za polecenie'
            }
            return 'Wpłata'
        } else {
            if (transaction.source === 'hosting_purchase') {
                return 'Zakup hostingu'
            } else if (transaction.source === 'autoscaling') {
                return 'Autoskalowanie'
            }
            return 'Wypłata'
        }
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Portfel</h1>

                <div className="mt-4 md:mt-0 flex space-x-3">
                    <Button
                        onClick={() => {
                            setShowAddFunds(true)
                            setShowApplyPromo(false)
                        }}
                        className="flex items-center"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Doładuj
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowApplyPromo(true)
                            setShowAddFunds(false)
                        }}
                        className="flex items-center"
                    >
                        <TicketPercent className="mr-2 h-4 w-4" />
                        Kod promocyjny
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CreditCard className="h-10 w-10 text-blue-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                            <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Stan konta</dt>
                                <dd className="text-3xl font-semibold text-gray-900">
                                    {wallet?.balance?.toFixed(2)} PLN
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add funds form */}
            {showAddFunds && (
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Doładuj portfel</h2>
                        <button
                            onClick={() => setShowAddFunds(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleAddFunds} className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                    Kwota doładowania (PLN)
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="text"
                                        name="amount"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                                        placeholder="0.00"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">PLN</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700">
                                    Metoda płatności
                                </label>
                                <select
                                    id="payment-method"
                                    name="payment-method"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="stripe">Karta płatnicza (Stripe)</option>
                                    <option value="paynow">PayNow</option>
                                    <option value="p24">Przelewy24</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddFunds(false)}
                                className="mr-3"
                            >
                                Anuluj
                            </Button>
                            <Button type="submit">
                                Doładuj konto
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Apply promo code form */}
            {showApplyPromo && (
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Zastosuj kod promocyjny</h2>
                        <button
                            onClick={() => setShowApplyPromo(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleApplyPromoCode} className="p-6">
                        {promoError && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {promoError}
                            </div>
                        )}

                        {promoSuccess && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                                {promoSuccess}
                            </div>
                        )}

                        <div>
                            <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700">
                                Kod promocyjny
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="promo-code"
                                    id="promo-code"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Np. WELCOME10"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowApplyPromo(false)}
                                className="mr-3"
                            >
                                Anuluj
                            </Button>
                            <Button type="submit">
                                Zastosuj kod
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transactions history */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Historia transakcji</h2>
                </div>

                <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex space-x-2 mb-4 sm:mb-0">
                            <Button
                                variant={filterType === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('all')}
                            >
                                Wszystkie
                            </Button>
                            <Button
                                variant={filterType === 'deposit' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('deposit')}
                            >
                                Wpłaty
                            </Button>
                            <Button
                                variant={filterType === 'withdrawal' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('withdrawal')}
                            >
                                Wypłaty
                            </Button>
                        </div>

                        <div className="flex items-center">
                            <button
                                onClick={toggleSort}
                                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                            >
                                <Clock className="mr-1 h-4 w-4" />
                                {sortOrder === 'desc' ? (
                                    <>Najnowsze <ChevronDown className="ml-1 h-4 w-4" /></>
                                ) : (
                                    <>Najstarsze <ChevronUp className="ml-1 h-4 w-4" /></>
                                )}
                            </button>
                        </div>
                    </div>

                    {transactionsLoading ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {getTransactionIcon(transaction)}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">
                                                        {getTransactionTitle(transaction)}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(transaction.created_at)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} PLN
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Saldo: {transaction.balance_after.toFixed(2)} PLN
                                                    </p>
                                                </div>
                                            </div>
                                            {transaction.reference && (
                                                <p className="mt-1 text-xs text-gray-600">
                                                    Ref: {transaction.reference}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <RefreshCw className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Brak transakcji</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                W Twoim portfelu nie ma jeszcze żadnych transakcji.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Wallet