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
