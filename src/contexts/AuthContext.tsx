import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { login as apiLogin, getCurrentUser, logout as apiLogout } from '../services/authService';
import type { DirectusUser } from '../types';
import LoginModal from '../components/LoginModal';

interface AuthContextType {
    user: DirectusUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    openLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<DirectusUser | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    const initAuth = useCallback(async () => {
        setIsLoading(true);
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedAccessToken && storedRefreshToken) {
            try {
                const userData = await getCurrentUser(storedAccessToken);
                setUser(userData);
                setAccessToken(storedAccessToken);
                setRefreshToken(storedRefreshToken);
            } catch (error) {
                console.error("Session expired, logging out.", error);
                // Token is invalid, clear it
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const login = async (email: string, password: string) => {
        const data = await apiLogin(email, password);
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        const userData = await getCurrentUser(data.access_token);
        setUser(userData);
        closeLoginModal();
    };

    const logout = useCallback(async () => {
        if (refreshToken) {
            await apiLogout(refreshToken);
        }
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }, [refreshToken]);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            accessToken,
            login,
            logout,
            openLoginModal,
        }}>
            {children}
            <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
