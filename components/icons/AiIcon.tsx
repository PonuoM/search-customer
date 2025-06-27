import React from 'react';

const AiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        className={className} 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
    >
        <path d="M12 8V4H8" />
        <rect x="4" y="12" width="16" height="8" rx="2" />
        <path d="M12 12v0" />
        <path d="m9 16 3-3 3 3" />
    </svg>
);

export default AiIcon;
