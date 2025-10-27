export type Mode = 'generate' | 'edit' | 'thinking';

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export type GenerationModel = 'imagen-4.0-generate-001' | 'gemini-2.5-flash-image';

export interface FileData {
  base64: string;
  mimeType: string;
}

export type Resolution = 'standard' | '1k' | '2k';

export interface HistoryItem {
  id: string;
  image: FileData;
  prompt: string;
  model: GenerationModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  timestamp: number;
}
