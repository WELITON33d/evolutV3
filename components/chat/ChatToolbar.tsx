import React from 'react';
import { Code, Bug, Lightbulb } from 'lucide-react';
import { ChatMode, ChatOptions } from '../../lib/openai';

interface ChatToolbarProps {
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
  options: ChatOptions;
  setOptions: (options: ChatOptions) => void;
  className?: string;
  embedded?: boolean;
}

export const ChatToolbar = ({ mode, setMode, options, setOptions, className = "", embedded = false }: ChatToolbarProps) => {
  const containerClass = embedded 
    ? `flex items-center gap-2 p-1.5 ${className}`
    : `bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl flex items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/50 pointer-events-auto transition-all hover:scale-105 hover:shadow-lg ${className}`;

  const wrapperClass = embedded
    ? ""
    : "absolute top-6 left-0 right-0 z-30 flex justify-center pointer-events-none";

  const content = (
    <div className={containerClass}>
      {/* Modes */}
      <div className="flex bg-slate-100/50 p-1 rounded-xl gap-1">
        <button 
          onClick={() => setMode('prompt')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
            mode === 'prompt' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Code size={12} /> PROMPT
        </button>
        <button 
          onClick={() => setMode('debug')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
            mode === 'debug' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400 hover:text-rose-600'
          }`}
        >
          <Bug size={12} /> DEBUG
        </button>
        <button 
          onClick={() => setMode('idea')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
            mode === 'idea' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-amber-600'
          }`}
        >
          <Lightbulb size={12} /> IDEIA
        </button>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className={wrapperClass}>
      {content}
    </div>
  );
};


