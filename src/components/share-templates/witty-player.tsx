import React from 'react';

interface WittyPlayerProps {
  count: number;
  duration: string;
}

export const WittyPlayer: React.FC<WittyPlayerProps> = ({ count, duration }) => {
  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Background Gradient */}
      <defs>
        <linearGradient id="memeBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#fb923c', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
        </linearGradient>

        {/* Dot Pattern */}
        <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.15)" />
        </pattern>

        {/* Comic Shadow */}
        <filter id="comicShadow">
          <feDropShadow dx="4" dy="4" stdDeviation="0" floodColor="#000000" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* Background */}
      <rect width="800" height="450" fill="url(#memeBg)" />
      <rect width="800" height="450" fill="url(#dotPattern)" />

      {/* Sunglasses Emoji - Stylized */}
      <g transform="translate(400, 85)">
        {/* Face circle */}
        <circle cx="0" cy="0" r="48" fill="#fcd34d" />
        <circle cx="0" cy="0" r="45" fill="#fbbf24" />
        
        {/* Sunglasses */}
        <g>
          {/* Left lens */}
          <rect x="-35" y="-8" width="25" height="16" rx="3" fill="#1f2937" />
          {/* Right lens */}
          <rect x="10" y="-8" width="25" height="16" rx="3" fill="#1f2937" />
          {/* Bridge */}
          <rect x="-10" y="-6" width="20" height="3" rx="1.5" fill="#1f2937" />
          {/* Glare effects */}
          <rect x="-32" y="-5" width="8" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
          <rect x="13" y="-5" width="8" height="4" rx="2" fill="rgba(255,255,255,0.4)" />
        </g>
        
        {/* Smirk */}
        <path
          d="M -12,15 Q 0,20 12,15"
          stroke="#1f2937"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Top Text - Comic Style */}
      <text
        x="400"
        y="175"
        textAnchor="middle"
        fill="white"
        fontSize="38"
        fontWeight="900"
        letterSpacing="1"
        filter="url(#comicShadow)"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        JUST UNFOLLOWED
      </text>

      {/* Number - Large and Bold */}
      <text
        x="400"
        y="280"
        textAnchor="middle"
        fill="white"
        fontSize="130"
        fontWeight="900"
        filter="url(#comicShadow)"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        {count}
      </text>

      {/* Bottom Text */}
      <text
        x="400"
        y="330"
        textAnchor="middle"
        fill="white"
        fontSize="28"
        fontWeight="900"
        filter="url(#comicShadow)"
        style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
      >
        PEOPLE
      </text>

      {/* Sarcastic Badge */}
      <g transform="translate(400, 375)">
        <rect
          x="-130"
          y="-22"
          width="260"
          height="44"
          rx="22"
          fill="white"
        />
        <text
          x="0"
          y="6"
          textAnchor="middle"
          fill="#1f2937"
          fontSize="18"
          fontWeight="700"
        >
          Like a boss 😤
        </text>
      </g>

      {/* Small note */}
      <text
        x="400"
        y="428"
        textAnchor="middle"
        fill="rgba(255,255,255,0.7)"
        fontSize="13"
        fontWeight="600"
      >
        (Took only {duration}, NBD)
      </text>
    </svg>
  );
};
