import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const editImageInternal = async (prompt: string, imageBase64: string, mimeType: string, aspectRatio: AspectRatio): Promise<{ base64: string, mimeType: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType };
    }
  }

  throw new Error('图片编辑失败。');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    try {
        const { prompt, imageBase64, mimeType, aspectRatio } = req.body;
        
        if (!prompt || !imageBase64 || !mimeType || !aspectRatio) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const result = await editImageInternal(prompt, imageBase64, mimeType, aspectRatio);
        res.status(200).json(result);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || 'An unexpected error occurred' });
    }
}
