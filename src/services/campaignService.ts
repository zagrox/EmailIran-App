import type { EmailMarketingCampaign } from '../types';

const API_BASE_URL = 'https://crm.ir48.com';

export const fetchCampaigns = async (accessToken: string): Promise<EmailMarketingCampaign[]> => {
    const response = await fetch(`${API_BASE_URL}/items/emailmarketing`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch campaigns.');
    }

    const { data } = await response.json();
    return data;
};
