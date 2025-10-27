import React from 'react';
import { DownloadIcon } from './Icons';

interface ImageDisplayProps {
  isLoading: boolean;
  error: string | null;
  generatedImage: string | null;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">正在生成您的杰作...</p>
    </div>
);

const WelcomeMessage: React.FC = () => (
    <div className="text-center text-slate-500 flex flex-col items-center gap-4">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-300">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2 className="text-2xl font-bold text-slate-700">欢迎使用 AI 插画师</h2>
        <p>使用左侧的控制面板来生成或编辑您的 galgame 插画。</p>
    </div>
);

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  isLoading,
  error,
  generatedImage,
}) => {
  return (
    <section className="flex-grow flex items-center justify-center bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="w-full h-full flex items-center justify-center">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
            <h3 className="font-bold">错误</h3>
            <p>{error}</p>
          </div>
        ) : generatedImage ? (
          <div className="relative group animate-fade-in">
            <img src={generatedImage} alt="Generated illustration" className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-md" />
             <a
                href={generatedImage}
                download="singhoo-studio-作品.jpg"
                className="absolute bottom-4 right-4 bg-black/50 text-white p-3 rounded-full hover:bg-black/75 transition-all opacity-0 group-hover:opacity-100"
                aria-label="下载图片"
             >
                <DownloadIcon />
            </a>
          </div>
        ) : (
          <WelcomeMessage />
        )}
      </div>
    </section>
  );
};