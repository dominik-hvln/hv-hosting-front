import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/button'
import { Server, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_marketing_consent: false,
        referral_code: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const { register, isLoading, error, user } = useAuthStore()
    const navigate = useNavigate()

    // Check for referral code in URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const refCode = urlParams.get('ref')
        if (refCode) {
            setFormData(prev => ({ ...prev, referral_code: refCode }))
        }
    }, [])

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/user')
        }
    }, [user, navigate])

    const validateForm = () => {
        let isValid = true
        const newErrors = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Imię i nazwisko jest wymagane'
            isValid = false
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email jest wymagany'
            isValid = false
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Podaj poprawny adres email'
            isValid = false
        }

        if (!formData.password) {
            newErrors.password = 'Hasło jest wymagane'
            isValid = false
        } else if (formData.password.length < 8) {
            newErrors.password = 'Hasło musi mieć co najmniej 8 znaków'
            isValid = false
        }

        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Hasła muszą być identyczne'
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        const success = await register(formData)

        if (success) {
            navigate('/user')
        } else if (error) {
            // Parse API error response if it's a validation error
            try {
                const errorObj = typeof error === 'string' ? JSON.parse(error) : error
                if (errorObj.errors) {
                    setErrors(errorObj.errors)
                } else {
                    setErrors({ general: errorObj.message || 'Wystąpił błąd podczas rejestracji' })
                }
            } catch {
                setErrors({ general: error || 'Wystąpił błąd podczas rejestracji' })
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Server className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Zarejestruj nowe konto
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Lub{' '}
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        zaloguj się, jeśli masz już konto
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {errors.general}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Imię i nazwisko
                            </label>
                            <div className="mt-1">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Adres email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Hasło
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10`}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ?
                                        <EyeOff className="h-5 w-5 text-gray-400" /> :
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    }
                                </button>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                Potwierdź hasło
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.password_confirmation ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10`}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ?
                                        <EyeOff className="h-5 w-5 text-gray-400" /> :
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    }
                                </button>
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="referral_code" className="block text-sm font-medium text-gray-700">
                                Kod polecenia (opcjonalnie)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="referral_code"
                                    name="referral_code"
                                    type="text"
                                    value={formData.referral_code}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                id="is_marketing_consent"
                                name="is_marketing_consent"
                                type="checkbox"
                                checked={formData.is_marketing_consent}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_marketing_consent" className="ml-2 block text-sm text-gray-900">
                                Wyrażam zgodę na otrzymywanie informacji marketingowych drogą elektroniczną
                            </label>
                        </div>

                        <div className="text-sm">
                            Klikając "Zarejestruj się", akceptujesz{' '}
                            <Link to="/terms" className="font-medium text-blue-600 hover:text-blue-500">
                                Warunki korzystania z usługi
                            </Link>
                            {' '}oraz{' '}
                            <Link to="/privacy" className="font-medium text-blue-600 hover:text-blue-500">
                                Politykę prywatności
                            </Link>
                            .
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register