// Dokończenie komponentu Login (src/pages/public/Login.jsx)
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/button'
import { Server, Eye, EyeOff } from 'lucide-react'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loginError, setLoginError] = useState('')
    const { login, isLoading, error, user } = useAuthStore()
    const navigate = useNavigate()

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/user')
        }
    }, [user, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoginError('')

        if (!email.trim() || !password.trim()) {
            setLoginError('Proszę wprowadzić email i hasło')
            return
        }

        const success = await login(email, password)

        if (success) {
            navigate('/user')
        } else {
            setLoginError(error || 'Błąd logowania. Sprawdź swoje dane.')
        }
    }

    const toggleShowPassword = () => {
        setShowPassword(!showPassword)
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Server className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Zaloguj się do swojego konta
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Lub{' '}
                    <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                        zarejestruj się, jeśli nie masz jeszcze konta
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {loginError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {loginError}
                            </div>
                        )}

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
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
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
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={toggleShowPassword}
                                >
                                    {showPassword ?
                                        <EyeOff className="h-5 w-5 text-gray-400" /> :
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    }
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Zapamiętaj mnie
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                    Zapomniałeś hasła?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logowanie...' : 'Zaloguj się'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login