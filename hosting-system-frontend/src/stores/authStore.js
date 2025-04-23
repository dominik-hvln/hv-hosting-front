import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await axios.post(`${API_URL}/login`, { email, password })

                    if (response.data.success) {
                        set({
                            user: response.data.user,
                            token: response.data.token,
                            isLoading: false
                        })

                        // Set token for future requests
                        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`

                        return true
                    } else {
                        set({
                            error: response.data.message || 'Login failed',
                            isLoading: false
                        })
                        return false
                    }
                } catch (error) {
                    set({
                        error: error.response?.data?.message || 'Login failed',
                        isLoading: false
                    })
                    return false
                }
            },

            register: async (userData) => {
                set({ isLoading: true, error: null })
                try {
                    const response = await axios.post(`${API_URL}/register`, userData)

                    if (response.data.success) {
                        set({
                            user: response.data.user,
                            token: response.data.token,
                            isLoading: false
                        })

                        // Set token for future requests
                        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`

                        return true
                    } else {
                        set({
                            error: response.data.message || 'Registration failed',
                            isLoading: false
                        })
                        return false
                    }
                } catch (error) {
                    set({
                        error: error.response?.data?.message || 'Registration failed',
                        isLoading: false
                    })
                    return false
                }
            },

            logout: async () => {
                try {
                    // Only attempt to call logout API if we have a token
                    if (get().token) {
                        await axios.post(`${API_URL}/logout`)
                    }
                } catch (error) {
                    console.error('Logout error:', error)
                } finally {
                    // Remove auth header
                    delete axios.defaults.headers.common['Authorization']
                    // Clear the state
                    set({ user: null, token: null })
                }
            },

            fetchUserData: async () => {
                // Only fetch if we have a token
                if (!get().token) return false

                set({ isLoading: true })
                try {
                    // Set auth header for this request
                    axios.defaults.headers.common['Authorization'] = `Bearer ${get().token}`

                    const response = await axios.get(`${API_URL}/me`)

                    if (response.data.success) {
                        set({
                            user: response.data.user,
                            isLoading: false
                        })
                        return true
                    } else {
                        set({ isLoading: false })
                        return false
                    }
                } catch (error) {
                    // If unauthorized, clear the state
                    if (error.response?.status === 401) {
                        get().logout()
                    }
                    set({ isLoading: false })
                    return false
                }
            },

            updateUserData: (userData) => {
                set({ user: { ...get().user, ...userData } })
            }
        }),
        {
            name: 'auth-storage', // unique name for localStorage
            partialize: (state) => ({ token: state.token }), // only persist token
        }
    )
)