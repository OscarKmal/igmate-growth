import React from 'react';

interface EfficiencyMasterProps {
  count: number;
  duration: string;
}

export const EfficiencyMaster: React.FC<EfficiencyMasterProps> = ({ count, duration }) => {
  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Background */}
      <defs>
        <linearGradient id="cleanBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f9fafb', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#e5e7eb', stopOpacity: 1 }} />
        </linearGradient>

        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
        </linearGradient>

        {/* Minimal Grid */}
        <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
        </pattern>

        {/* Soft Shadow */}
        <filter id="softShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.15"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="800" height="450" fill="url(#cleanBg)" />
      <rect width="800" height="450" fill="url(#grid)" opacity="0.5" />

      {/* Main Card Container */}
      <g transform="translate(400, 225)">
        {/* Shadow */}
        <rect
          x="-280"
          y="-160"
          width="560"
          height="320"
          rx="16"
          fill="rgba(0,0,0,0.05)"
          filter="url(#softShadow)"
        />
        
        {/* Card Background */}
        <rect
          x="-280"
          y="-160"
          width="560"
          height="320"
          rx="16"
          fill="white"
        />

        {/* Top Accent Bar */}
        <rect
          x="-280"
          y="-160"
          width="560"
          height="6"
          rx="16"
          fill="url(#accentGradient)"
        />

        {/* Check Icon Circle */}
        <g transform="translate(0, -80)">
          <circle cx="0" cy="0" r="40" fill="url(#accentGradient)" />
          <circle cx="0" cy="0" r="36" fill="white" />
          <circle cx="0" cy="0" r="32" fill="url(#accentGradient)" />
          
          {/* Check mark */}
          <path
            d="M -10,-2 L -3,8 L 12,-10"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Title */}
        <text
          x="0"
          y="-10"
          textAnchor="middle"
          fill="#1f2937"
          fontSize="32"
          fontWeight="600"
          letterSpacing="-0.5"
        >
          Cleanup Complete
        </text>

        {/* Divider Line */}
        <line
          x1="-120"
          y1="15"
          x2="120"
          y2="15"
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Number Display */}
        <text
          x="0"
          y="75"
          textAnchor="middle"
          fill="#111827"
          fontSize="96"
          fontWeight="700"
          letterSpacing="-2"
        >
          {count}
        </text>

        {/* Subtitle */}
        <text
          x="0"
          y="100"
          textAnchor="middle"
          fill="#6b7280"
          fontSize="16"
          fontWeight="500"
        >
          connections optimized
        </text>

        {/* Bottom Info Section */}
        <g transform="translate(0, 135)">
          {/* Duration Badge */}
          <rect
            x="-80"
            y="-14"
            width="160"
            height="28"
            rx="14"
            fill="#f3f4f6"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#6b7280"
            fontSize="12"
            fontWeight="600"
          >
            Completed in {duration}
          </text>
        </g>
      </g>

      {/* Bottom Label */}
      <g transform="translate(400, 420)">
        {/* Sparkle Icons */}
        <g transform="translate(-50, -5)">
          <path d="M 0,-4 L 1,0 L 0,4 L -1,0 Z" fill="#8b5cf6" opacity="0.6" />
          <path d="M -4,0 L 0,1 L 4,0 L 0,-1 Z" fill="#8b5cf6" opacity="0.6" />
        </g>
        <g transform="translate(50, -5)">
          <path d="M 0,-4 L 1,0 L 0,4 L -1,0 Z" fill="#ec4899" opacity="0.6" />
          <path d="M -4,0 L 0,1 L 4,0 L 0,-1 Z" fill="#ec4899" opacity="0.6" />
        </g>

        <text
          x="0"
          y="0"
          textAnchor="middle"
          fill="#8b5cf6"
          fontSize="13"
          fontWeight="600"
          letterSpacing="0.5"
        >
          Digital Minimalism Achieved
        </text>
      </g>
    </svg>
  );
};
