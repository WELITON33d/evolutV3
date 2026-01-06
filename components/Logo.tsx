import React from 'react';

export const Logo: React.FC<{ className?: string, light?: boolean }> = ({ className = "", light = false }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon Container */}
      <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden ${light ? 'bg-white' : 'bg-slate-900'}`}>
         {/* Geometric "E" / Evolution Symbol */}
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={light ? 'text-slate-900' : 'text-white'}>
            <path d="M4 4H20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <path d="M4 12H14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <path d="M4 20H20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <path d="M17 12L21 16L17 20" stroke="currentColor" strokeWidth="0" fill="currentColor"/> 
         </svg>
         {/* Abstract Arrow integrated */}
         <div className={`absolute right-1 bottom-1 w-2 h-2 rounded-full ${light ? 'bg-blue-600' : 'bg-blue-500'}`} />
      </div>

      {/* Text */}
      <span className={`font-bold text-xl tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
        Evolut
      </span>
    </div>
  );
};


