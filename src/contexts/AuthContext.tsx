import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
    login as apiLogin, 
    getCurrentUser, 
    logout as apiLogout, 
    signup as apiSignup, 
    createUserProfile,
    fetchUserProfile,
    updateDirectusUser,
    updateUserProfile
} from '../services/authService';
import type { DirectusUser, Profile } from '../types';
import LoginModal from '../components/LoginModal';

interface AuthContextType {
    user: DirectusUser | null;
    profile: Profile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    openLoginModal: () => void;
    updateProfileAndUser: (userData: Partial<DirectusUser>, profileData: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<DirectusUser | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    const fetchUserDataAndProfile = useCallback(async (token: string) => {
        const userData = await getCurrentUser(token);
        setUser(userData);
        if (userData) {
            const userProfile = await fetchUserProfile(userData.id, token);
            setProfile(userProfile);
        }
    }, []);

    const initAuth = useCallback(async () => {
        setIsLoading(true);
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (storedAccessToken && storedRefreshToken) {
            try {
                setAccessToken(storedAccessToken);
                setRefreshToken(storedRefreshToken);
                await fetchUserDataAndProfile(storedAccessToken);
            } catch (error) {
                console.error("Session expired, logging out.", error);
                setUser(null);
                setProfile(null);
                setAccessToken(null);
                setRefreshToken(null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        }
        setIsLoading(false);
    }, [fetchUserDataAndProfile]);

    useEffect(() => {
        initAuth();
    }, [initAuth]);

    const login = async (email: string, password: string) => {
        const data = await apiLogin(email, password);
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        await fetchUserDataAndProfile(data.access_token);
        closeLoginModal();
    };
    
    const signup = async (firstName: string, lastName: string, email: string, password: string) => {
        const newUser = await apiSignup(firstName, lastName, email, password);
        const loginData = await apiLogin(email, password);
        await createUserProfile(newUser.id, loginData.access_token);
        localStorage.setItem('accessToken', loginData.access_token);
        localStorage.setItem('refreshToken', loginData.refresh_token);
        setAccessToken(loginData.access_token);
        setRefreshToken(loginData.refresh_token);
        await fetchUserDataAndProfile(loginData.access_token);
        closeLoginModal();
    };

    const logout = useCallback(async () => {
        if (refreshToken) {
            await apiLogout(refreshToken);
        }
        setUser(null);
        setProfile(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }, [refreshToken]);

    const updateProfileAndUser = async (userData: Partial<DirectusUser>, profileData: Partial<Profile>) => {
        if (!accessToken || !profile || !user) {
            throw new Error("Not authenticated or profile not loaded.");
        }

        const promises = [];

        // Update user details if there's data to update
        if (Object.keys(userData).length > 0) {
            promises.push(
                updateDirectusUser(userData, accessToken).then(updatedUser => {
                    setUser(updatedUser);
                })
            );
        }

        // Update profile details if there's data to update
        if (Object.keys(profileData).length > 0 && profile.id) {
            promises.push(
                updateUserProfile(profile.id, profileData, accessToken).then(updatedProfile => {
                    setProfile(updatedProfile);
                })
            );
        }

        // Await all promises to run in parallel, and throw if any of them fail
        await Promise.all(promises);
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            isAuthenticated: !!user,
            isLoading,
            accessToken,
            login,
            signup,
            logout,
            openLoginModal,
            updateProfileAndUser,
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