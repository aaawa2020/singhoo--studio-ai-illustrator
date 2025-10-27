import React from 'react';
import type { Mode, AspectRatio, FileData, GenerationModel, Resolution } from '../types';
import { BrainCircuitIcon, ImagePlusIcon, SparklesIcon, WandSparklesIcon } from './Icons';

interface ControlPanelProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  thinkingQuery: string;
  setThinkingQuery: (query: string) => void;
  editPrompt: string;
  setEditPrompt: (prompt: string) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  generationModel: GenerationModel;
  setGenerationModel: (model: GenerationModel) => void;
  resolution: Resolution;
  setResolution: (resolution: Resolution) => void;
  originalImage: FileData | null;
  setOriginalImage: (fileData: FileData | null) => void;
  generatedPrompt: string;
  isLoading: boolean;
  onGenerate: () => void;
  onEdit: () => void;
  onThinking: () => void;
  onUseGeneratedPrompt: () => void;
}

const fileToData = (file: File): Promise<FileData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export const ControlPanel: React.FC<ControlPanelProps> = ({
  mode,
  setMode,
  prompt,
  setPrompt,
  thinkingQuery,
  setThinkingQuery,
  editPrompt,
  setEditPrompt,
  aspectRatio,
  setAspectRatio,
  generationModel,
  setGenerationModel,
  resolution,
  setResolution,
  originalImage,
  setOriginalImage,
  generatedPrompt,
  isLoading,
  onGenerate,
  onEdit,
  onThinking,
  onUseGeneratedPrompt,
}) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileData = await fileToData(file);
        setOriginalImage(fileData);
      } catch (error) {
        console.error("Error reading file:", error);
        setOriginalImage(null);
      }
    }
  };

  const aspectRatios: AspectRatio[] = ['1:1', '3:4', '4:3', '9:16', '16:9'];
  const modeOptions: { id: Mode; label: string; icon: React.ReactNode }[] = [
    { id: 'generate', label: '生成', icon: <SparklesIcon /> },
    { id: 'edit', label: '编辑', icon: <WandSparklesIcon /> },
    { id: 'thinking', label: '构思模式', icon: <BrainCircuitIcon /> },
  ];

  const modelOptions: { id: GenerationModel; label: string;}[] = [
      { id: 'imagen-4.0-generate-001', label: 'Imagen 4.0'},
      { id: 'gemini-2.5-flash-image', label: 'Nano Banana'},
  ]

  const resolutionOptions: { id: Resolution, label: string }[] = [
    { id: 'standard', label: '标准' },
    { id: '1k', label: '1K' },
    { id: '2k', label: '2K' },
  ];

  return (
    <aside className="w-full md:w-96 lg:w-[420px] xl:w-[480px] flex-shrink-0 bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col gap-6 self-start">
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
        {modeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setMode(option.id)}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
              mode === option.id ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:bg-slate-200'
            }`}
            disabled={isLoading}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>

      {mode === 'generate' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <label className="font-semibold text-slate-700">模型</label>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                {modelOptions.map(option => (
                     <button
                        key={option.id}
                        onClick={() => setGenerationModel(option.id)}
                        className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                        generationModel === option.id ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                        disabled={isLoading}
                    >
                        {option.label}
                    </button>
                ))}
          </div>

          <label className="font-semibold text-slate-700">提示词</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="一个美丽的银发动漫少女..."
            className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"
            disabled={isLoading}
          />
          
          <label className="font-semibold text-slate-700">宽高比</label>
          <div className="grid grid-cols-5 gap-2">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                disabled={isLoading}
              >
                {ratio}
              </button>
            ))}
          </div>

          {generationModel === 'imagen-4.0-generate-001' && (
            <>
              <label className="font-semibold text-slate-700">清晰度</label>
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
                {resolutionOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setResolution(option.id)}
                    className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                      resolution === option.id ? 'bg-white text-indigo-600 shadow' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                    disabled={isLoading}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
          <button
            onClick={onGenerate}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            <SparklesIcon />
            {isLoading ? '生成中...' : '生成插画'}
          </button>
        </div>
      )}

      {mode === 'edit' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <label className="font-semibold text-slate-700">上传图片</label>
          <div className="w-full">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
                {originalImage ? (
                  <img src={`data:${originalImage.mimeType};base64,${originalImage.base64}`} alt="Upload preview" className="max-h-32 mx-auto rounded-md"/>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <ImagePlusIcon />
                    <span className="font-medium">点击上传或拖放文件</span>
                    <span className="text-sm">PNG, JPG, WEBP</span>
                  </div>
                )}
              </div>
            </label>
            <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
          </div>
          <label className="font-semibold text-slate-700">编辑指令</label>
          <input
            type="text"
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder="例如：把她的头发改成蓝色"
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            disabled={isLoading || !originalImage}
          />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500 text-center">
              编辑功能由 <strong>Nano Banana</strong> 模型提供支持。您可以在下方调整输出图像的宽高比。
            </p>
          </div>

          <label className="font-semibold text-slate-700">宽高比</label>
          <div className="grid grid-cols-5 gap-2">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                  aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                disabled={isLoading || !originalImage}
              >
                {ratio}
              </button>
            ))}
          </div>

          <button
            onClick={onEdit}
            disabled={isLoading || !originalImage || !editPrompt}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            <WandSparklesIcon />
            {isLoading ? '编辑中...' : '应用编辑'}
          </button>
        </div>
      )}

      {mode === 'thinking' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          <label className="font-semibold text-slate-700">概念 / 想法</label>
          <textarea
            value={thinkingQuery}
            onChange={(e) => setThinkingQuery(e.target.value)}
            placeholder="未来城市里的魔法少女"
            className="w-full h-24 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none"
            disabled={isLoading}
          />
          <button
            onClick={onThinking}
            disabled={isLoading || !thinkingQuery}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            <BrainCircuitIcon />
            {isLoading ? '构思中...' : '构思提示词'}
          </button>
          {generatedPrompt && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex flex-col gap-3">
              <p className="text-sm text-indigo-800 font-medium leading-relaxed">{generatedPrompt}</p>
              <button
                onClick={onUseGeneratedPrompt}
                className="w-full bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg hover:bg-indigo-200 transition-colors"
                disabled={isLoading}
              >
                使用此提示词
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};