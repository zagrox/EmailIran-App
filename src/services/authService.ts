import type { DirectusUser, Profile, EmailMarketingCampaign } from '../types';

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

export const signup = async (firstName: string, lastName: string, email: string, password: string): Promise<void> => {
    // FIX: Explicitly provide the Role ID for new users to ensure they are created with the correct permissions.
    const USER_ROLE_ID = '1b67a326-7278-4500-b934-5ec83b2ecd89'; // ID for "Users Role"

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
            // Explicitly set the role for new users to ensure correct permissions are applied immediately.
            role: USER_ROLE_ID,
        }),
    });

    if (!response.ok) {
        let errorMessage = 'Signup failed. Please try again.';
        try {
            const errorData = await response.json();
            errorMessage = errorData.errors?.[0]?.message || errorMessage;
        } catch (e) {
            console.error("Could not parse JSON from signup error response.", e);
        }
        throw new Error(errorMessage);
    }
    // A successful user creation might return 204 No Content if the public role lacks read permissions.
    // We no longer parse the response body to avoid the "Unexpected end of JSON input" error.
};

export const createUserProfile = async (userId: string, accessToken: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/items/profiles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            type: 'personal',
            display: 'auto'
        }),
    });

    if (!response.ok) {
        let errorMessage = `Profile creation failed (status ${response.status}). This is likely a permission issue.`;
        // Attempt to parse a more specific error message from the API.
        try {
            const errorData = await response.json();
            errorMessage = errorData.errors?.[0]?.message || `Profile creation failed.`;
        } catch (e) {
            console.error("Could not parse JSON from profile creation error response:", e);
        }
        throw new Error(errorMessage);
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

export const fetchUserProfile = async (userId: string, accessToken: string): Promise<Profile | null> => {
    const response = await fetch(`${API_BASE_URL}/items/profiles?filter[user_created][_eq]=${userId}&limit=1`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        console.error('Failed to fetch user profile.');
        return null;
    }
    const { data } = await response.json();
    return data.length > 0 ? data[0] : null;
};

export const updateDirectusUser = async (userData: Partial<DirectusUser>, accessToken: string): Promise<DirectusUser> => {
     const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to update user details.');
    }

    const { data } = await response.json();
    return data;
};

export const updateUserProfile = async (profileId: number, profileData: Partial<Profile>, accessToken: string): Promise<Profile> => {
    const response = await fetch(`${API_BASE_URL}/items/profiles/${profileId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profileData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to update user profile.');
    }

    const { data } = await response.json();
    return data;
};

export const changePassword = async (password: string, new_password: string, accessToken: string): Promise<void> => {
    // The `password` parameter (the user's current password) is intentionally unused here.
    // We are using PATCH /users/me, which is a fallback for Directus versions that don't
    // support the more secure POST /users/me/password endpoint. This endpoint only
    // requires the new password.
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        // Directus expects the new password in a 'password' field.
        body: JSON.stringify({ password: new_password }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to change password.');
    }
    // A successful PATCH returns 200 OK, and we don't need to process the body.
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    // A 204 No Content response is expected on success. We check for any non-2xx status.
    if (!response.ok) {
        // We throw a generic error to avoid revealing whether a user account exists.
        // Directus might send specific errors (e.g., for an invalidly formatted email),
        // but for security, it's often better to keep the frontend response uniform.
        throw new Error('There was an issue processing your request. Please try again.');
    }
};

export const refreshAccessToken = async (refreshToken: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Session expired. Please log in again.');
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