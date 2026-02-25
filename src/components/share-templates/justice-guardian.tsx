import React from 'react';

interface JusticeGuardianProps {
  count: number;
  duration: string;
}

export const JusticeGuardian: React.FC<JusticeGuardianProps> = ({ count, duration }) => {
  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Background Gradient */}
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#db2777', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
        </linearGradient>
        
        {/* Shield Pattern */}
        <pattern id="shieldPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M50 10 L70 40 L50 70 L30 40 Z" fill="rgba(255,255,255,0.05)" />
        </pattern>

        {/* Glow Filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="800" height="450" fill="url(#bgGradient)" />
      <rect width="800" height="450" fill="url(#shieldPattern)" opacity="0.3" />
      <rect width="800" height="450" fill="rgba(0,0,0,0.1)" />

      {/* Shield Icon - Top */}
      <g transform="translate(400, 80)">
        <path
          d="M 0,-50 L 30,-40 L 30,0 C 30,20 15,35 0,45 C -15,35 -30,20 -30,0 L -30,-40 Z"
          fill="rgba(255,255,255,0.15)"
          stroke="#fcd34d"
          strokeWidth="3"
        />
        <path
          d="M -15,-10 L -5,5 L 15,-20"
          stroke="#fcd34d"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
        />
      </g>

      {/* Alert Triangle */}
      <g transform="translate(400, 80)">
        <circle cx="0" cy="0" r="60" fill="rgba(252, 211, 77, 0.2)" />
        <circle cx="0" cy="0" r="50" fill="rgba(252, 211, 77, 0.1)" />
      </g>

      {/* Main Title */}
      <text
        x="400"
        y="180"
        textAnchor="middle"
        fill="white"
        fontSize="52"
        fontWeight="900"
        letterSpacing="2"
      >
        TERMINATED
      </text>

      {/* Number */}
      <text
        x="400"
        y="265"
        textAnchor="middle"
        fill="white"
        fontSize="110"
        fontWeight="900"
      >
        {count}
      </text>

      {/* Subtitle */}
      <text
        x="400"
        y="300"
        textAnchor="middle"
        fill="rgba(255,255,255,0.85)"
        fontSize="22"
        fontWeight="500"
      >
        non-mutual followers removed
      </text>

      {/* Duration Badge */}
      <g transform="translate(400, 345)">
        <rect
          x="-120"
          y="-20"
          width="240"
          height="40"
          rx="20"
          fill="rgba(255,255,255,0.2)"
          style={{ backdropFilter: 'blur(10px)' }}
        />
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontWeight="600"
        >
          ⚡ Operation completed in {duration}
        </text>
      </g>

      {/* Bottom Badge */}
      <g transform="translate(400, 400)">
        <rect
          x="-150"
          y="-16"
          width="300"
          height="32"
          rx="16"
          fill="rgba(0,0,0,0.3)"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fill="#fcd34d"
          fontSize="14"
          fontWeight="700"
          letterSpacing="1"
        >
          🛡️ FOLLOWER GUARDIAN PROTOCOL
        </text>
      </g>
    </svg>
  );
};
