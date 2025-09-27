import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { 
    login as apiLogin, 
    getCurrentUser, 
    logout as apiLogout, 
    signup as apiSignup, 
    createUserProfile,
    fetchUserProfile,
    updateDirectusUser,
    updateUserProfile,
    changePassword as apiChangePassword,
    requestPasswordReset as apiRequestPasswordReset
} from '../services/authService';
import type { DirectusUser, Profile } from '../types';
import { useNotification } from './NotificationContext';

interface AuthContextType {
    user: DirectusUser | null;
    profile: Profile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    accessToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfileAndUser: (userData: Partial<DirectusUser>, profileData: Partial<Profile>) => Promise<void>;
    changePassword: (current: string, newPass: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<DirectusUser | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addNotification } = useNotification();

    const fetchUserDataAndProfile = useCallback(async (token: string) => {
        const userData = await getCurrentUser(token);
        setUser(userData);
        if (userData) {
            const userProfile = await fetchUserProfile(userData.id, token);
            setProfile(userProfile);
        }
        return userData;
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
        try {
            const data = await apiLogin(email, password);
            localStorage.setItem('accessToken', data.access_token);
            localStorage.setItem('refreshToken', data.refresh_token);
            setAccessToken(data.access_token);
            setRefreshToken(data.refresh_token);
            const userData = await fetchUserDataAndProfile(data.access_token);
            addNotification(`خوش آمدید, ${userData.first_name || 'کاربر'}!`, 'success');
        } catch (error: any) {
            addNotification(error.message, 'error');
            throw error; // Re-throw to be caught by the modal form
        }
    };
    
    const signup = async (firstName: string, lastName: string, email: string, password: string) => {
        try {
            // Step 1: Create the user. We no longer get the user object back from this call.
            await apiSignup(firstName, lastName, email, password);

            // Step 2: Log the new user in to get an access token.
            const loginData = await apiLogin(email, password);

            // Step 3: Use the new token to fetch the user's details, including their ID.
            const newUser = await getCurrentUser(loginData.access_token);

            // Step 4: Create the associated user profile.
            await createUserProfile(newUser.id, loginData.access_token);

            // Step 5: Finalize session setup.
            localStorage.setItem('accessToken', loginData.access_token);
            localStorage.setItem('refreshToken', loginData.refresh_token);
            setAccessToken(loginData.access_token);
            setRefreshToken(loginData.refresh_token);

            // Step 6: Fetch all user data again to ensure context is fully updated.
            await fetchUserDataAndProfile(loginData.access_token);
            addNotification('حساب کاربری با موفقیت ایجاد شد.', 'success');
        } catch (error: any) {
            addNotification(error.message, 'error');
            throw error; // Re-throw to be caught by the modal form
        }
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
        addNotification('با موفقیت از حساب خود خارج شدید.', 'info');
    }, [refreshToken, addNotification]);
    
    const changePassword = async (current: string, newPass: string) => {
        if (!accessToken) {
            const message = "برای تغییر رمز عبور باید وارد شوید.";
            addNotification(message, "error");
            throw new Error(message);
        }
        try {
            await apiChangePassword(current, newPass, accessToken);
            addNotification('رمز عبور با موفقیت بروزرسانی شد.', 'success');
        } catch (error: any) {
            addNotification(error.message, 'error');
            throw error;
        }
    };

    const requestPasswordReset = async (email: string) => {
        try {
            await apiRequestPasswordReset(email);
            addNotification(
                'اگر حسابی با آن ایمیل وجود داشته باشد، لینک بازنشانی رمز عبور ارسال شده است.',
                'success'
            );
        } catch (error: any) {
            addNotification(error.message, 'error');
            throw error;
        }
    };

    const updateProfileAndUser = async (userData: Partial<DirectusUser>, profileData: Partial<Profile>) => {
        if (!accessToken || !user) {
            addNotification("برای بروزرسانی پروفایل باید وارد شوید.", "error");
            throw new Error("Not authenticated.");
        }

        let currentProfile = profile;

        // If profile doesn't exist, try to create it first.
        if (!currentProfile) {
            try {
                await createUserProfile(user.id, accessToken);
                currentProfile = await fetchUserProfile(user.id, accessToken);
                if (currentProfile) {
                    setProfile(currentProfile); // Update context state immediately
                } else {
                    throw new Error("Profile created but could not be fetched.");
                }
            } catch (creationError: any) {
                console.error("Failed to create profile during update:", creationError);
                addNotification(creationError.message || 'ایجاد پروفایل برای بروزرسانی شکست خورد.', 'error');
                throw creationError;
            }
        }

        try {
            const promises = [];

            if (Object.keys(userData).length > 0) {
                promises.push(updateDirectusUser(userData, accessToken));
            }

            if (Object.keys(profileData).length > 0 && currentProfile?.id) {
                promises.push(updateUserProfile(currentProfile.id, profileData, accessToken));
            } else if (Object.keys(profileData).length > 0) {
                 console.error("Profile update skipped: profile ID is missing.");
            }
            
            await Promise.all(promises);
            
            await fetchUserDataAndProfile(accessToken);
            
            addNotification('پروفایل با موفقیت بروزرسانی شد.', 'success');

        } catch (error: any) {
            addNotification(error.message || 'خطا در بروزرسانی پروفایل.', 'error');
            throw error;
        }
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
            updateProfileAndUser,
            changePassword,
            requestPasswordReset,
        }}>
            {children}
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