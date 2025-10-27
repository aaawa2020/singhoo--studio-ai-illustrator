import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { ImageDisplay } from './components/ImageDisplay';
import { HistoryTray } from './components/HistoryTray';
import { generateImage, editImage, getPromptIdeas } from './services/geminiService';
import type { Mode, AspectRatio, FileData, GenerationModel, Resolution, HistoryItem } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('generate');
  const [prompt, setPrompt] = useState<string>('masterpiece, best quality, 1girl, solo, beautiful detailed eyes, looking at viewer, detailed light, cinematic light, detailed background');
  const [thinkingQuery, setThinkingQuery] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [generationModel, setGenerationModel] = useState<GenerationModel>('imagen-4.0-generate-001');
  const [resolution, setResolution] = useState<Resolution>('standard');
  
  const [originalImage, setOriginalImage] = useState<FileData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('singhoo-illustrator-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
      setHistory([]);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('请输入提示词。');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const { base64, mimeType } = await generateImage(prompt, aspectRatio, generationModel, resolution);
      setGeneratedImage(`data:${mimeType};base64,${base64}`);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        image: { base64, mimeType },
        prompt: prompt,
        model: generationModel,
        aspectRatio: aspectRatio,
        resolution: resolution,
        timestamp: Date.now(),
      };
      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory];
        localStorage.setItem('singhoo-illustrator-history', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (e: any) {
      setError(`图像生成过程中发生错误：${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, generationModel, resolution]);

  const handleEdit = useCallback(async () => {
    if (!editPrompt) {
      setError('请输入编辑指令。');
      return;
    }
    if (!originalImage) {
      setError('请上传需要编辑的图片。');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const { base64, mimeType } = await editImage(editPrompt, originalImage.base64, originalImage.mimeType, aspectRatio);
      setGeneratedImage(`data:${mimeType};base64,${base64}`);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        image: { base64, mimeType },
        prompt: editPrompt,
        model: 'gemini-2.5-flash-image',
        aspectRatio: aspectRatio,
        resolution: 'standard',
        timestamp: Date.now(),
      };
      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory];
        localStorage.setItem('singhoo-illustrator-history', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (e: any) {
      setError(`图像编辑过程中发生错误：${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [editPrompt, originalImage, aspectRatio]);

  const handleThinking = useCallback(async () => {
    if (!thinkingQuery) {
      setError('请输入一个概念或想法。');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedPrompt('');
    try {
      const idea = await getPromptIdeas(thinkingQuery);
      setGeneratedPrompt(idea);
    } catch (e: any) {
      setError(`构思过程中发生错误：${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [thinkingQuery]);

  const useGeneratedPrompt = useCallback(() => {
    if (generatedPrompt) {
      setPrompt(generatedPrompt);
      setMode('generate');
      setGeneratedPrompt('');
      setThinkingQuery('');
    }
  }, [generatedPrompt]);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    setGeneratedImage(`data:${item.image.mimeType};base64,${item.image.base64}`);
    setOriginalImage(item.image);
    setPrompt(item.prompt);
    setEditPrompt(item.model === 'gemini-2.5-flash-image' && mode === 'edit' ? item.prompt : '');
    setAspectRatio(item.aspectRatio);
    setGenerationModel(item.model);
    setResolution(item.resolution);
    setError(null);
  }, [mode]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('singhoo-illustrator-history');
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <Header />
      <main className="flex-grow flex flex-col md:flex-row gap-8 p-4 md:p-8">
        <ControlPanel
          mode={mode}
          setMode={setMode}
          prompt={prompt}
          setPrompt={setPrompt}
          thinkingQuery={thinkingQuery}
          setThinkingQuery={setThinkingQuery}
          editPrompt={editPrompt}
          setEditPrompt={setEditPrompt}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          generationModel={generationModel}
          setGenerationModel={setGenerationModel}
          resolution={resolution}
          setResolution={setResolution}
          originalImage={originalImage}
          setOriginalImage={setOriginalImage}
          generatedPrompt={generatedPrompt}
          isLoading={isLoading}
          onGenerate={handleGenerate}
          onEdit={handleEdit}
          onThinking={handleThinking}
          onUseGeneratedPrompt={useGeneratedPrompt}
        />
        <div className="flex-grow flex flex-col gap-8 min-w-0">
            <ImageDisplay
                isLoading={isLoading}
                error={error}
                generatedImage={generatedImage}
            />
            <HistoryTray
                history={history}
                onSelectItem={handleSelectHistoryItem}
                onClearHistory={handleClearHistory}
            />
        </div>
      </main>
    </div>
  );
};

export default App;