import type { AspectRatio, GenerationModel, Resolution } from '../types';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
}

/**
 * Generates an image by calling the backend serverless function.
 * @param prompt - The text prompt for image generation.
 * @param aspectRatio - The desired aspect ratio of the image.
 * @param model - The model to use for generation.
 * @param resolution - The desired resolution/quality (for Imagen 4.0).
 * @returns A promise that resolves to an object with the base64 encoded image and its MIME type.
 */
export const generateImage = async (prompt: string, aspectRatio: AspectRatio, model: GenerationModel, resolution: Resolution): Promise<{ base64: string, mimeType: string }> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, aspectRatio, model, resolution }),
    });
    return handleResponse(response);
};

/**
 * Edits an existing image by calling the backend serverless function.
 * @param prompt - The editing instruction.
 * @param imageBase64 - The base64 encoded string of the image to edit.
 * @param mimeType - The MIME type of the image.
 * @param aspectRatio - The desired aspect ratio of the output image.
 * @returns A promise that resolves to an object with the base64 encoded edited image and its MIME type.
 */
export const editImage = async (prompt: string, imageBase64: string, mimeType: string, aspectRatio: AspectRatio): Promise<{ base64: string, mimeType: string }> => {
    const response = await fetch('/api/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, imageBase64, mimeType, aspectRatio }),
    });
    return handleResponse(response);
};

/**
 * Generates a detailed prompt by calling the backend serverless function.
 * @param query - The user's simple concept or idea.
 * @returns A promise that resolves to a detailed prompt string.
 */
export const getPromptIdeas = async (query: string): Promise<string> => {
    const response = await fetch('/api/think', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });
    const data = await handleResponse(response);
    return data.idea;
};