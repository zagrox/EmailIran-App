import type { DirectusUser } from '../types';

const API_BASE_URL = 'https://crm.ir48.com';

interface LoginResponse {
    access_token: string;
    expires: number;
    refresh_token: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Login failed. Please check your credentials.');
    }

    const { data } = await response.json();
    return data;
};

export const signup = async (firstName: string, lastName: string, email: string, password: string): Promise<DirectusUser> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            // Per Directus docs, role is assigned automatically based on Public permissions for unauthenticated requests.
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Signup failed. Please try again.');
    }

    const { data } = await response.json();
    return data;
};

export const createUserProfile = async (userId: string, accessToken: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/items/profiles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            user: userId,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        // This is a follow-up action, so we log the error instead of throwing,
        // as the main user creation and login was successful.
        console.error('Failed to create user profile:', errorData.errors?.[0]?.message || 'Profile creation failed.');
    }
};

export const getCurrentUser = async (accessToken: string): Promise<DirectusUser> => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user data.');
    }

    const { data } = await response.json();
    return data;
};

export const logout = async (refreshToken: string) => {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });
    } catch (error) {
        console.error("Logout failed:", error);
    }
};