import React from 'react';
import type { HistoryItem } from '../types';
import { ClockIcon, TrashIcon } from './Icons';

interface HistoryTrayProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryTray: React.FC<HistoryTrayProps> = ({ history, onSelectItem, onClearHistory }) => {
  return (
    <section className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col gap-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ClockIcon />
          历史记录
        </h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 font-semibold transition-colors"
            aria-label="清空历史记录"
          >
            <TrashIcon />
            清空
          </button>
        )}
      </div>
      <div className="relative">
        <div className="flex overflow-x-auto space-x-4 pb-4 -mb-4">
          {history.length === 0 ? (
            <div className="w-full text-center py-8 text-slate-500">
              您生成的图片将会出现在这里。
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group relative flex-shrink-0 cursor-pointer"
                onClick={() => onSelectItem(item)}
                title={item.prompt}
              >
                <img
                  src={`data:${item.image.mimeType};base64,${item.image.base64}`}
                  alt={item.prompt}
                  className="h-32 w-auto object-cover rounded-lg shadow-md transition-transform transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <p className="text-white text-xs text-center line-clamp-3">{item.prompt}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};