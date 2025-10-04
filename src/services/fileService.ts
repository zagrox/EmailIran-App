const API_BASE_URL = 'https://crm.ir48.com';

interface UploadResponse {
    id: string;
    // ... other file properties
}

/**
 * Uploads a file to the Directus /files endpoint.
 * @param file The file to upload.
 * @param accessToken The user's authentication token.
 * @returns The ID of the uploaded file.
 */
export const uploadFile = async (file: File, accessToken: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/files`, {
        method: 'POST',
        headers: {
            // 'Content-Type' is set automatically by the browser for FormData
            'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'File upload failed.');
    }

    const { data }: { data: UploadResponse } = await response.json();
    return data.id;
};
