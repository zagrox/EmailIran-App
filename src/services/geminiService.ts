

import { GoogleGenAI, Type } from "@google/genai";
import type { AICampaignDraft, AudienceCategory } from "../types";

let ai: GoogleGenAI | null = null;

// The API key MUST be available in process.env.API_KEY.
// This is a requirement for the execution environment. We will gracefully
// handle its absence to prevent the app from crashing.
if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI. Your API Key may be invalid.", e);
        ai = null;
    }
} else {
    console.error("API_KEY environment variable not set. AI features will be disabled.");
}

const model = 'gemini-2.5-flash';

// Helper to ensure AI client is initialized before use.
const checkAi = (): GoogleGenAI => {
    if (!ai) {
        // This error will be caught by the individual function's catch block.
        throw new Error("Gemini AI client is not initialized. API_KEY may be missing or invalid.");
    }
    return ai;
}

export const getSubjectSuggestions = async (context: string): Promise<string[]> => {
    try {
        const ai = checkAi();
        const prompt = `بر اساس متن ایمیل زیر، ۳ موضوع خلاقانه و جذاب برای ایمیل پیشنهاد بده. آن‌ها را به صورت یک آرایه JSON از رشته‌ها برگردان.
        
        متن ایمیل:
        ---
        ${context}
        ---
        
        مثال خروجی: ["موضوع ۱", "موضوع ۲", "موضوع ۳"]`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        
        // The response text may have markdown ```json ... ``` wrapper
        const text = response.text.replace(/```json\n?|```/g, '').trim();
        const suggestions = JSON.parse(text);
        return suggestions.slice(0, 3);
    } catch (error) {
        console.error("Error getting subject suggestions:", error);
        return ["دریافت پیشنهادات ممکن نبود.", "لطفاً دوباره تلاش کنید.", "خطای سرویس هوش مصنوعی."];
    }
};

export const improveEmailBody = async (emailBody: string): Promise<string> => {
    try {
        const ai = checkAi();
        const prompt = `متن ایمیل زیر را بازنویسی و بهبود ببخش تا جذاب‌تر، حرفه‌ای‌تر و واضح‌تر شود. هدف اصلی و توکن‌های شخصی‌سازی مانند {{firstName}} را حفظ کن.
        
        متن اصلی ایمیل:
        ---
        ${emailBody}
        ---`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error improving email body:", error);
        return "متاسفانه بهبود متن ایمیل با خطا مواجه شد. لطفاً دوباره تلاش کنید.";
    }
};

export const getBestSendTime = async (audienceDescription: string): Promise<string> => {
    try {
        const ai = checkAi();
        const prompt = `بهترین زمان (روز و ساعت) برای ارسال ایمیل به مخاطبان زیر چیست؟ پاسخ خود را کوتاه و به صورت یک پیشنهاد ارائه بده.
        
        توضیحات مخاطب:
        ---
        ${audienceDescription}
        ---
        
        مثال پاسخ: سه شنبه ساعت ۱۰:۳۰ صبح`;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting best send time:", error);
        return "دریافت پیشنهاد ممکن نبود.";
    }
};

export const generateCampaignFromPrompt = async (
    userPrompt: string, 
    categories: AudienceCategory[]
): Promise<AICampaignDraft> => {
    const ai = checkAi(); // Throws if not initialized. The calling component's catch block will handle it.

    const systemInstruction = `You are an expert email marketing assistant. Your task is to generate a complete campaign draft based on a user's goal. You must select the best audience from the provided list of "Specialized Audiences", write a compelling subject and body, and suggest an optimal send time. You must also provide an alternative subject (subjectB) for A/B testing. Your response must be only a valid JSON object that conforms to the provided schema.

Specialized Audiences (for reaching new audiences by category):
${categories.map(c => `- ${c.name_fa} (ID: ${c.id}, Count: ${c.count})`).join('\n')}
`;

    const response = await ai.models.generateContent({
        model: model,
        contents: `Campaign Goal: "${userPrompt}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    audienceCategoryId: {
                        type: Type.STRING,
                        description: "The ID of the specialized audience category.",
                        enum: categories.map(c => c.id),
                    },
                    subject: {
                        type: Type.STRING,
                        description: "A compelling email subject line related to the campaign goal.",
                    },
                    subjectB: {
                        type: Type.STRING,
                        description: "An alternative email subject line for A/B testing. It should be a creative variation of the main subject.",
                    },
                    body: {
                        type: Type.STRING,
                        description: "A complete and persuasive email body. Be sure to use the {{firstName}} personalization token.",
                    },
                    sendTime: {
                        type: Type.STRING,
                        description: "The suggested send time in HH:MM format.",
                        pattern: "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$"
                    },
                },
                required: ["audienceCategoryId", "subject", "subjectB", "body", "sendTime"],
            },
        },
    });

    const jsonText = response.text.trim();
    const draft = JSON.parse(jsonText) as AICampaignDraft;

    return draft;
};