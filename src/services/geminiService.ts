import type { AICampaignDraft, AudienceCategory } from "../types";

/**
 * --- IMPORTANT ARCHITECTURE CHANGE ---
 * To resolve regional access issues (like in Iran) and enhance security,
 * all AI-related calls are now proxied through a backend service.
 * This service now points to the production-ready, secure custom domain.
 */
const API_BASE_URL = 'https://ai.email-iran.com';

const handleApiError = async (response: Response, context: string): Promise<string> => {
    console.error(`Error in ${context} (Status: ${response.status})`);
    try {
        const errorData = await response.json();
        const message = errorData.error || `Request failed in '${context}'. Please check the server logs.`;
        return message;
    } catch {
        return `A server error occurred in '${context}'. The response was not valid JSON.`;
    }
};


export const getSubjectSuggestions = async (context: string): Promise<string[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/subject-suggestions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context }),
        });

        if (!response.ok) {
            const errorMessage = await handleApiError(response, 'getSubjectSuggestions');
            return [errorMessage.substring(0, 100), "Please check your backend proxy server.", "Review server logs for details."];
        }

        const data = await response.json();
        return data.suggestions.slice(0, 3);
    } catch (error) {
        console.error(error);
        return ["Network error.", "Could not reach the backend server.", "Is it running?"];
    }
};

export const improveEmailBody = async (emailBody: string): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/improve-body`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailBody }),
        });
        
        if (!response.ok) {
            return handleApiError(response, 'improveEmailBody');
        }

        const data = await response.json();
        return data.improvedBody;

    } catch (error) {
        console.error(error);
        return "Network error: Could not reach the backend server to improve the email body.";
    }
};

export const getBestSendTime = async (audienceDescription: string): Promise<string> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/best-send-time`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audienceDescription }),
        });

        if (!response.ok) {
            return handleApiError(response, 'getBestSendTime');
        }

        const data = await response.json();
        return data.suggestion;
    } catch (error) {
        console.error(error);
        return "Network error: Could not get time suggestion from the backend server.";
    }
};

export const generateCampaignFromPrompt = async (
    userPrompt: string, 
    categories: AudienceCategory[]
): Promise<AICampaignDraft> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/generate-campaign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userPrompt, categories }),
        });

        if (!response.ok) {
            const errorMessage = await handleApiError(response, 'generateCampaignFromPrompt');
            throw new Error(errorMessage);
        }

        const draft = await response.json();
        return draft;

    } catch (error) {
        // Re-throw so the UI can catch and display it.
        // If it's a network error, the message will be less specific but still informative.
        throw new Error((error as Error).message || "A network error occurred while generating the campaign.");
    }
};