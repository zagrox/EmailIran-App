
import { GoogleGenAI, Type } from "@google/genai";
import type { AICampaignDraft, AudienceCategory } from "../types";

// This variable will hold the singleton instance of the GoogleGenAI client.
let ai: GoogleGenAI | null = null;
const model = 'gemini-2.5-flash';

// Lazily initialize and get the AI client. This function is called before
// every API request. This solves timing issues where the API key might be
// set by a script after this module is initially loaded.
const getAi = (): GoogleGenAI => {
    // If the client is already initialized, return it immediately.
    if (ai) {
        return ai;
    }

    // The API key is injected into the global window object by an inline script in `index.html`.
    // We use `(window as any)` to avoid TypeScript errors since `process` is not a standard
    // browser property.
    const apiKey = (window as any)?.process?.env?.API_KEY;

    // We must check for three conditions:
    // 1. The key exists.
    // 2. The key is not an empty string.
    // 3. The key is not the placeholder value, which would indicate the hosting
    //    environment failed to replace it.
    if (apiKey && apiKey !== "\${VITE_GEMINI_API_KEY}") {
        try {
            // If the key is valid, initialize the client and store it in the `ai` variable
            // for future calls.
            ai = new GoogleGenAI({ apiKey: apiKey });
            return ai;
        } catch (e) {
            console.error("Failed to initialize GoogleGenAI. Your API Key may be invalid.", e);
            // This error will be caught by the calling function's try/catch block.
            throw new Error("Gemini AI client failed to initialize. The API Key may be invalid.");
        }
    } else {
        // If the API key is missing or is still the placeholder, it means the
        // VITE_GEMINI_API_KEY environment variable was not injected correctly by the hosting service.
        console.error("API_KEY environment variable not set, or placeholder was not replaced. AI features will be disabled.");
        throw new Error("Gemini AI client is not initialized. The API_KEY is missing or was not provided by the server environment.");
    }
}


export const getSubjectSuggestions = async (context: string): Promise<string[]> => {
    try {
        const client = getAi();
        const prompt = `بر اساس متن ایمیل زیر، ۳ موضوع خلاقانه و جذاب برای ایمیل پیشنهاد بده. آن‌ها را به صورت یک آرایه JSON از رشته‌ها برگردان.
        
        متن ایمیل:
        ---
        ${context}
        ---
        
        مثال خروجی: ["موضوع ۱", "موضوع ۲", "موضوع ۳"]`;

        const response = await client.models.generateContent({
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
        const client = getAi();
        const prompt = `متن ایمیل زیر را بازنویسی و بهبود ببخش تا جذاب‌تر، حرفه‌ای‌تر و واضح‌تر شود. هدف اصلی و توکن‌های شخصی‌سازی مانند {{firstName}} را حفظ کن.
        
        متن اصلی ایمیل:
        ---
        ${emailBody}
        ---`;

        const response = await client.models.generateContent({
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
        const client = getAi();
        const prompt = `بهترین زمان (روز و ساعت) برای ارسال ایمیل به مخاطبان زیر چیست؟ پاسخ خود را کوتاه و به صورت یک پیشنهاد ارائه بده.
        
        توضیحات مخاطب:
        ---
        ${audienceDescription}
        ---
        
        مثال پاسخ: سه شنبه ساعت ۱۰:۳۰ صبح`;

        const response = await client.models.generateContent({
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
    const client = getAi(); // Throws if not initialized. The calling component's catch block will handle it.

    const systemInstruction = `You are an expert email marketing assistant. Your task is to generate a complete campaign draft based on a user's goal. You must select the best audience from the provided list of "Specialized Audiences", write a compelling subject and body, and suggest an optimal send time. You must also provide an alternative subject (subjectB) for A/B testing. Your response must be only a valid JSON object that conforms to the provided schema.

Specialized Audiences (for reaching new audiences by category):
${categories.map(c => `- ${c.name_fa} (ID: ${c.id}, Count: ${c.count})`).join('\n')}
`;

    const response = await client.models.generateContent({
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
