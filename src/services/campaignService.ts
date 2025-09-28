
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

export const fetchCampaignById = async (id: number, accessToken: string): Promise<EmailMarketingCampaign> => {
    const response = await fetch(`${API_BASE_URL}/items/emailmarketing/${id}?fields=*,campaign_audiences.audiences_id.*`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch campaign details.');
    }

    const { data } = await response.json();
    return data;
};

type CreateCampaignPayload = Omit<EmailMarketingCampaign, 'id'>;

export const createCampaign = async (campaignData: Partial<CreateCampaignPayload>, accessToken: string): Promise<EmailMarketingCampaign> => {
    const response = await fetch(`${API_BASE_URL}/items/emailmarketing`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(campaignData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create campaign.');
    }

    const { data } = await response.json();
    return data;
};