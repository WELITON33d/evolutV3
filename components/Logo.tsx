import React from 'react';
import { MousePointer2, ChevronLeft, ChevronRight } from 'lucide-react';

export const Logo: React.FC<{ className?: string, light?: boolean }> = ({ className = "", light = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Container */}
      <div className="relative flex items-center justify-center">
        {/* Brackets */}
        <div className={`flex items-center gap-1 font-black text-2xl tracking-tighter ${light ? 'text-white' : 'text-slate-900'}`}>
           <ChevronLeft strokeWidth={4} size={24} />
           <ChevronRight strokeWidth={4} size={24} />
        </div>
        
        {/* Cursor Overlay */}
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[40%] ${light ? 'text-white' : 'text-slate-900'}`}>
          <MousePointer2 size={18} strokeWidth={0} fill="currentColor" className="transform rotate-[-15deg] translate-x-[2px] translate-y-[2px]" />
          <MousePointer2 size={18} strokeWidth={2} className="absolute inset-0 transform rotate-[-15deg] translate-x-[2px] translate-y-[2px] text-white mix-blend-difference" />
        </div>
      </div>

      {/* Text */}
      <span className={`font-black text-2xl tracking-wide uppercase ${light ? 'text-white' : 'text-slate-900'}`}>
        EVOLUT
      </span>
    </div>
  );
};

