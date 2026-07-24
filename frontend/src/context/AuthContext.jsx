import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Basic auth state. In a real app, you might validate the token on mount.
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('unsaid_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('unsaid_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('unsaid_user');
        // In a real app, you'd also call the backend /logout endpoint to clear the HttpOnly cookie
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
