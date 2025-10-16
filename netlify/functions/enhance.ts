import { GoogleGenAI, Type } from '@google/genai';
import type { Handler } from '@netlify/functions';
import type { GeminiResponse } from '../../types';


const responseSchema = {
    type: Type.OBJECT,
    properties: {
        original_prompt_fa: { 
            type: Type.STRING,
            description: "The user's original, unmodified Persian prompt.",
        },
        analysis: {
            type: Type.OBJECT,
            description: "Analysis of the original prompt.",
            properties: {
                identified_dialogue: { 
                    type: Type.STRING,
                    description: "The spoken dialogue part of the prompt, if any."
                },
                identified_visual_text: { 
                    type: Type.STRING,
                    description: "The visual text part of the prompt (e.g., on a sign), if any."
                },
            },
            required: ['identified_dialogue', 'identified_visual_text']
        },
        processed_persian: {
            type: Type.OBJECT,
            description: "Persian text after processing.",
            properties: {
                dialogue_with_diacritics: { 
                    type: Type.STRING,
                    description: "The dialogue text after adding all necessary diacritics (harakat) for TTS."
                },
                visual_text_clean: { 
                    type: Type.STRING,
                    description: "The visual text with correct spelling and grammar, without any diacritics."
                },
            },
            required: ['dialogue_with_diacritics', 'visual_text_clean']
        },
        enhanced_prompt_en: { 
            type: Type.STRING,
            description: "The final, detailed technical prompt in English, optimized for a video AI."
        },
        negative_prompt_en: { 
            type: Type.STRING,
            description: "A standard negative prompt in English to avoid common AI generation issues."
        },
    },
    required: ['original_prompt_fa', 'analysis', 'processed_persian', 'enhanced_prompt_en', 'negative_prompt_en']
};

const buildMetaPrompt = (userPrompt: string): string => `
You are an expert prompt engineer for AI video generation models. Your task is to process a raw user prompt written in Persian and enhance it, populating the fields of the provided JSON schema.

The user's raw prompt is:
---
${userPrompt}
---

Follow these steps to populate the JSON fields:

1.  **original_prompt_fa**: Copy the user's original Persian prompt here.
2.  **analysis**:
    *   **identified_dialogue**: Identify any spoken dialogue (text in quotes) from the user's prompt. If none, leave empty.
    *   **identified_visual_text**: Identify any text meant to be written on objects (like signs or screens). If none, leave empty.
3.  **processed_persian**:
    *   **dialogue_with_diacritics**: This is a CRITICAL step. Add all necessary Persian diacritics (harakat), specifically including fatḥa (ـَ), kasra (ـِ), damma (ـُ), sukun (ـْ), and tashdid (ـّ), to the identified dialogue. The result must be fully vocalized for perfect, unambiguous Text-to-Speech (TTS) pronunciation. Do not miss any diacritics. If there is no dialogue, leave this field empty.
    *   **visual_text_clean**: Correct any spelling/grammar in the identified visual text. Do NOT add diacritics. If no visual text, leave empty.
4.  **enhanced_prompt_en**: Synthesize the entire request into a single, highly-detailed technical prompt in English, optimized for video generation AIs. Clearly incorporate instructions for both the dialogue and the visual text.
5.  **negative_prompt_en**: Create a standard but effective negative prompt in English to avoid common AI generation issues (e.g., bad anatomy, extra limbs, blurry).
`;

const buildHybridMetaPrompt = (userPrompt: string, svgCode: string): string => `
You are an expert prompt engineer for AI video generation models. Your task is to process a raw user prompt written in Persian and enhance it, populating the fields of the provided JSON schema.

The user's raw prompt is:
---
${userPrompt}
---

Follow these steps to populate the JSON fields:

1.  **original_prompt_fa**: Copy the user's original Persian prompt here.
2.  **analysis**:
    *   **identified_dialogue**: Identify any spoken dialogue (text in quotes) from the user's prompt. If none, leave empty.
    *   **identified_visual_text**: Identify the text meant to be written on an object (e.g., sign). It has been pre-identified from the prompt. Copy it here.
3.  **processed_persian**:
    *   **dialogue_with_diacritics**: CRITICAL: Add all necessary Persian diacritics (harakat) to the identified dialogue for perfect TTS pronunciation. If no dialogue, leave empty.
    *   **visual_text_clean**: Take the identified visual text, correct spelling/grammar, but do NOT add diacritics.
4.  **enhanced_prompt_en**: This is the MOST IMPORTANT step. Synthesize the entire request into a single, highly-detailed technical prompt in English. It MUST include the following critical instruction block to render the visual text using precise vector data instead of generating it from a string.

    The instruction block to include is:
    ---
    [CRITICAL OVERLAY INSTRUCTION]: You MUST render a texture onto the target surface (e.g., a sign, screen). This texture is NOT an image file; it is described by the following SVG code. This code represents the precise geometric vector shapes for a line of text. Render these shapes exactly as defined by the path data.

    [SVG DATA]:
    ${svgCode}

    [VISUAL STYLE FOR SVG]: The rendered text should look like black ink printed on the surface. It must be sharp and in focus. The texture should seamlessly integrate, matching the surface's perspective and lighting.
    ---

    Combine this block with the overall scene description and any dialogue instructions to create a complete and effective final prompt.

5.  **negative_prompt_en**: Create a standard negative prompt in English to avoid common AI issues.
`;

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    if (!process.env.API_KEY) {
        return { statusCode: 500, body: JSON.stringify({ error: 'API_KEY environment variable not set on the server.' }) };
    }

    try {
        const { userPrompt, svgCode } = JSON.parse(event.body || '{}');

        if (!userPrompt) {
            return { statusCode: 400, body: JSON.stringify({ error: 'userPrompt is required' }) };
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
        const metaPrompt = svgCode 
            ? buildHybridMetaPrompt(userPrompt, svgCode)
            : buildMetaPrompt(userPrompt);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: metaPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const textResponse = response.text;
        if (!textResponse) {
            throw new Error("پاسخ خالی از Gemini API دریافت شد.");
        }

        const parsedJson = JSON.parse(textResponse.trim());
        if (svgCode) {
            parsedJson.generated_svg = svgCode;
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsedJson),
        };

    } catch (error) {
        console.error('Function Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `خطا در سرور: ${errorMessage}` }),
        };
    }
};
