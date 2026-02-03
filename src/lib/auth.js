
"use client"

import { supabase } from "./supabase"
import { useState, useEffect, createContext, useContext } from "react"

const AuthContext = createContext({
    user: null,
    loading: true,
    login: async () => {},
    signUp: async () => {},
    logout: async () => {},
    updateProfile: async () => {},
    isAuthenticated: () => false
})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Initialize user
        const initUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        initUser()

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    const updateProfile = async (updates) => {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        })
        if (error) throw error
        setUser(data.user)
        return data.user
    }

    const isAuthenticated = () => !!user

    return (
        <AuthContext.Provider value={{ user, loading, login, signUp, logout, updateProfile, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
