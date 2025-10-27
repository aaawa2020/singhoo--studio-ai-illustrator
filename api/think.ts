import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getPromptIdeasInternal = async (query: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: `Based on this idea: "${query}", create a rich, detailed, and artistic prompt for an AI image generator. The style must be 'galgame' or 'bishōjo game'. Describe the a character, their pose, expression, clothing, the background, lighting, and overall mood. Use descriptive keywords and phrases.`,
    config: {
      systemInstruction: "You are an expert prompt engineer for an AI image generator specializing in galgame-style illustrations. Your task is to expand a user's simple idea into a detailed, creative, and descriptive prompt. The prompt should be a single paragraph of comma-separated keywords and phrases. Start with 'masterpiece, best quality'.",
      thinkingConfig: {
        thinkingBudget: 32768,
      },
      temperature: 0.8,
    },
  });

  return response.text;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ message: 'Missing required parameter: query' });
        }

        const idea = await getPromptIdeasInternal(query);
        res.status(200).json({ idea });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || 'An unexpected error occurred' });
    }
}
