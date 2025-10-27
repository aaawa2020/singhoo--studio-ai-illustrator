import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio, GenerationModel, Resolution } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an image using either Imagen 4.0 or Gemini 2.5 Flash Image model.
 * @param prompt - The text prompt for image generation.
 * @param aspectRatio - The desired aspect ratio of the image.
 * @param model - The model to use for generation.
 * @param resolution - The desired resolution/quality (for Imagen 4.0).
 * @returns A promise that resolves to an object with the base64 encoded image and its MIME type.
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio, model: GenerationModel, resolution: Resolution): Promise<{ base64: string, mimeType: string }> => {
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
    // For 'standard', we rely on the default value which is '1K'.

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

/**
 * Edits an existing image using Gemini 2.5 Flash Image based on a text prompt.
 * @param prompt - The editing instruction.
 * @param imageBase64 - The base64 encoded string of the image to edit.
 * @param mimeType - The MIME type of the image.
 * @param aspectRatio - The desired aspect ratio of the output image.
 * @returns A promise that resolves to an object with the base64 encoded edited image and its MIME type.
 */
export const editImage = async (prompt: string, imageBase64: string, mimeType: string, aspectRatio: AspectRatio): Promise<{ base64: string, mimeType: string }> => {
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

/**
 * Generates a detailed and creative prompt for image generation using Gemini 2.5 Pro in Thinking Mode.
 * @param query - The user's simple concept or idea.
 * @returns A promise that resolves to a detailed prompt string.
 */
export const getPromptIdeas = async (query: string): Promise<string> => {
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