import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import routes from './routes'

// Komponent do śledzenia zmiany ścieżki (dla analityki, resetu stanu formularzy itp.)
const ScrollToTop = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}

// Komponent App
function App() {
    const { fetchUserData } = useAuthStore()

    // Próba odzyskania sesji użytkownika przy pierwszym ładowaniu
    useEffect(() => {
        fetchUserData()
    }, [fetchUserData])

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Routes>
                {routes.map((route, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        element={route.element}
                    />
                ))}
            </Routes>
        </BrowserRouter>
    )
}

export default App
