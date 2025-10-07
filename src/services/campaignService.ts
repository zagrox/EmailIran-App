import type { EmailMarketingCampaign, Order, Transaction } from '../types';

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
    const response = await fetch(`${API_BASE_URL}/items/emailmarketing/${id}?fields=*,campaign_audiences.audiences_id.*,campaign_order.*`, {
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

export const updateCampaign = async (id: number, campaignData: Partial<EmailMarketingCampaign>, accessToken: string): Promise<EmailMarketingCampaign> => {
    const response = await fetch(`${API_BASE_URL}/items/emailmarketing/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(campaignData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to update campaign.');
    }

    const { data } = await response.json();
    return data;
};

// --- Orders ---
export const createOrder = async (orderData: Partial<Omit<Order, 'id'>>, accessToken: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/items/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(orderData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create order.');
    }
    const { data } = await response.json();
    return data;
};

export const fetchOrderById = async (id: string, accessToken: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/items/orders/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch order details.');
    }

    const { data } = await response.json();
    return data;
};

export const fetchOrdersByUser = async (accessToken: string): Promise<Order[]> => {
    const response = await fetch(`${API_BASE_URL}/items/orders?filter[user_created][_eq]=$CURRENT_USER`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error('Failed to fetch user orders.');
    const { data } = await response.json();
    return data;
};

export const updateOrder = async (id: string, orderData: Partial<Order>, accessToken: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/items/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(orderData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to update order.');
    }
    const { data } = await response.json();
    return data;
};

export const fetchCampaignByOrderId = async (orderId: string, accessToken: string): Promise<EmailMarketingCampaign | null> => {
    const response = await fetch(`${API_BASE_URL}/items/emailmarketing?filter[campaign_order][_eq]=${orderId}&limit=1`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error('Failed to fetch campaign by order ID.');
    const { data } = await response.json();
    return data.length > 0 ? data[0] : null;
};

// --- Transactions ---
export const createTransaction = async (transactionData: { transaction_order: string, trackid: string, status: string }, accessToken: string): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/items/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(transactionData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to create transaction.');
    }
    const { data } = await response.json();
    return data;
};

export const fetchTransactionById = async (id: number, accessToken: string): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/items/transactions/${id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch transaction with ID ${id}.`);
    const { data } = await response.json();
    return data;
};

export const updateTransaction = async (id: number, transactionData: Partial<Transaction>, accessToken: string): Promise<Transaction> => {
    const response = await fetch(`${API_BASE_URL}/items/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify(transactionData),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to update transaction.');
    }
    const { data } = await response.json();
    return data;
}

// --- Project Settings ---
export const fetchProjectSettings = async (): Promise<{ project_zibal: string }> => {
    const response = await fetch(`${API_BASE_URL}/items/projects/d0749635-72fb-481e-9d87-e7bcdc8bd2ac?fields=project_zibal`);
    if (!response.ok) throw new Error('Failed to fetch project settings.');
    const { data } = await response.json();
    return data;
};