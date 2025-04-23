import React, { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { useAuthStore } from '../../stores/authStore'
import { User, Mail, Phone, MapPin, Building, CreditCard, Save, AlertCircle } from 'lucide-react'
import api from '../../lib/axios'

const Profile = () => {
    const { user, updateUserData } = useAuthStore()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
        country: '',
        company_name: '',
        tax_id: '',
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)
    const [countries, setCountries] = useState([
        { code: 'PL', name: 'Polska' },
        { code: 'DE', name: 'Niemcy' },
        { code: 'GB', name: 'Wielka Brytania' },
        { code: 'US', name: 'Stany Zjednoczone' },
        { code: 'FR', name: 'Francja' },
        { code: 'CZ', name: 'Czechy' },
        { code: 'SK', name: 'Słowacja' },
        // Można dodać więcej krajów
    ])

    // Inicjowanie formularza danymi użytkownika
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                postal_code: user.postal_code || '',
                country: user.country || '',
                company_name: user.company_name || '',
                tax_id: user.tax_id || '',
            })
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setSuccess(false)
        setError(null)

        try {
            const response = await api.post('/profile', formData)

            if (response.data.success) {
                // Aktualizacja danych w store
                updateUserData(response.data.user)
                setSuccess(true)

                // Wyczyść komunikat sukcesu po 3 sekundach
                setTimeout(() => {
                    setSuccess(false)
                }, 3000)
            } else {
                setError(response.data.message || 'Wystąpił błąd podczas aktualizacji profilu')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Wystąpił błąd podczas aktualizacji profilu')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil użytkownika</h1>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                    Profil został zaktualizowany pomyślnie
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Dane osobowe</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Imię i nazwisko */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Imię i nazwisko
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Adres email
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                    disabled
                                    title="Adres email nie może zostać zmieniony"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Adres email nie może zostać zmieniony</p>
                        </div>

                        {/* Telefon */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Telefon
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        {/* Adres */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Adres
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        {/* Miasto */}
                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                Miasto
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        {/* Kod pocztowy */}
                        <div>
                            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                                Kod pocztowy
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    id="postal_code"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        {/* Kraj */}
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                Kraj
                            </label>
                            <div className="mt-1">
                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                >
                                    <option value="">Wybierz kraj</option>
                                    {countries.map(country => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Nazwa firmy */}
                        <div>
                            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                                Nazwa firmy (opcjonalnie)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="company_name"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        {/* NIP */}
                        <div>
                            <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700">
                                NIP (opcjonalnie)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="tax_id"
                                    name="tax_id"
                                    value={formData.tax_id}
                                    onChange={handleChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex items-center"
                        >
                            {loading ? (
                                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Zapisywanie...
                </span>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Zapisz zmiany
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Profile
