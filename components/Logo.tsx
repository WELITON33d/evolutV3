import React from 'react';

export const Logo: React.FC<{ className?: string, light?: boolean }> = ({ className = "h-8", light = false }) => {
  // Colors based on the provided image palette
  // Dark Blue: #003399 (approx)
  // Light Blue: #0099FF (approx)
  // Text: White (or dark if not light mode)
  
  const darkBlue = "#1e40af"; // blue-800
  const lightBlue = "#3b82f6"; // blue-500
  const textColor = light ? "#FFFFFF" : "#0f172a"; // white or slate-900
  const bracketColor = light ? "#FFFFFF" : "#0f172a"; 

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left Bracket Shape */}
        <path 
          d="M12 8 H 4 V 32 H 12" 
          stroke={bracketColor} 
          strokeWidth="3" 
          strokeLinecap="square"
        />
        
        {/* Horizontal Bars */}
        {/* Top Bar - Dark Blue */}
        <rect x="8" y="10" width="24" height="4" rx="0" fill={darkBlue} />
        
        {/* Middle Bar - Dark Blue */}
        <rect x="8" y="18" width="18" height="4" rx="0" fill={darkBlue} />
        
        {/* Bottom Bar - Light Blue */}
        <rect x="8" y="26" width="22" height="4" rx="0" fill={lightBlue} />
      </svg>
      <span className="font-bold text-xl tracking-wide" style={{ color: textColor }}>
        EVOLUT
      </span>
    </div>
  );
};
