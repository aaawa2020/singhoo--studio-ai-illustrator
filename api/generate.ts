import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio, GenerationModel, Resolution } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateImageInternal = async (prompt: string, aspectRatio: AspectRatio, model: GenerationModel, resolution: Resolution): Promise<{ base64: string, mimeType: string }> => {
  if (model === 'imagen-4.0-generate-001') {
    const enhancedPrompt = `galgame style, anime, beautiful, ${prompt}`;
    
    const config: {
        numberOfImages: number;
        outputMimeType: 'image/jpeg';
        aspectRatio: AspectRatio;
        imageSize?: '1K' | '2K';
    } = {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: aspectRatio,
    };

    if (resolution === '1k') {
      config.imageSize = '1K';
    } else if (resolution === '2k') {
      config.imageSize = '2K';
    }

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: enhancedPrompt,
      config: config,
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error('未能生成图片。');
    }

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return { base64: base64ImageBytes, mimeType: 'image/jpeg' };
  } else { // 'gemini-2.5-flash-image'
    const enhancedPrompt = `galgame style, anime, beautiful, ${prompt}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: enhancedPrompt,
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

    throw new Error('使用 Nano Banana 模型生成图片失败。');
  }
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    try {
        const { prompt, aspectRatio, model, resolution } = req.body;
        
        if (!prompt || !aspectRatio || !model || !resolution) {
            return res.status(400).json({ message: 'Missing required parameters' });
        }

        const result = await generateImageInternal(prompt, aspectRatio, model, resolution);
        res.status(200).json(result);
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message || 'An unexpected error occurred' });
    }
}
