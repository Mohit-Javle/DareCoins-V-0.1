import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (userData) => {
        const data = await authService.login(userData);
        setUser(data);
        return data;
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        setUser(data);
        return data;
    };

    const refreshUser = async () => {
        try {
            const data = await authService.getMe();
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error("Failed to refresh user:", error);
            // Optional: if refresh fails (e.g. 401), might want to logout
        }
    };

    const updateUser = (updates) => {
        setUser(prev => {
            const newState = { ...prev, ...updates };
            localStorage.setItem('user', JSON.stringify(newState));
            return newState;
        });
    };

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
            setUser(storedUser);
            // Immediately fetch fresh data to sync wallet balance etc.
            refreshUser();
        }
        setLoading(false);
    }, []);

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, refreshUser, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
