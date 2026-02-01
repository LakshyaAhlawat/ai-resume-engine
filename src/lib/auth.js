"use client"

export const useAuth = () => {
    // Removed internal router usage to prevent initialization conflicts

    const login = (email, password) => {
        // Mock validation
        if (email && password) {
            localStorage.setItem('isAuthenticated', 'true')
            localStorage.setItem('userEmail', email)
            return true
        }
        return false
    }

    const logout = () => {
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('userEmail')
        return true // Return success status instead of redirecting
    }

    const isAuthenticated = () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('isAuthenticated') === 'true'
        }
        return false
    }

    return { login, logout, isAuthenticated }
}
