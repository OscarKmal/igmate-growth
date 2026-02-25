import React from 'react';

interface ZenSpiritProps {
  count: number;
  duration: string;
}

export const ZenSpirit: React.FC<ZenSpiritProps> = ({ count, duration }) => {
  return (
    <svg
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Background */}
      <defs>
        <linearGradient id="zenBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#2dd4bf', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#22d3ee', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        </linearGradient>

        {/* Wave Pattern */}
        <pattern id="wavePattern" x="0" y="0" width="120" height="60" patternUnits="userSpaceOnUse">
          <path 
            d="M 0,30 Q 30,20 60,30 T 120,30" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="2" 
            fill="none"
          />
          <path 
            d="M 0,40 Q 30,30 60,40 T 120,40" 
            stroke="rgba(255,255,255,0.05)" 
            strokeWidth="2" 
            fill="none"
          />
        </pattern>

        {/* Glow Filter */}
        <filter id="zenGlow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Radial Gradient for Orbs */}
        <radialGradient id="orbGradient">
          <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.4 }} />
          <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="800" height="450" fill="url(#zenBg)" />
      <rect width="800" height="450" fill="url(#wavePattern)" />

      {/* Floating Orbs */}
      <circle cx="120" cy="80" r="60" fill="url(#orbGradient)" />
      <circle cx="680" cy="370" r="70" fill="url(#orbGradient)" />
      <circle cx="650" cy="100" r="50" fill="url(#orbGradient)" />
      <circle cx="150" cy="350" r="55" fill="url(#orbGradient)" />

      {/* Lotus/Wind Icon */}
      <g transform="translate(400, 85)">
        {/* Breathing circle */}
        <circle cx="0" cy="0" r="45" fill="rgba(255,255,255,0.15)" />
        <circle cx="0" cy="0" r="35" fill="rgba(255,255,255,0.1)" />
        
        {/* Wind/Breath Symbol */}
        <g opacity="0.9">
          <path
            d="M -25,-5 Q -10,-10 5,-5 Q 15,-8 25,-5"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M -25,5 Q -10,0 5,5 Q 15,2 25,5"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="-28" cy="-5" r="2" fill="rgba(255,255,255,0.8)" />
          <circle cx="-28" cy="5" r="2" fill="rgba(255,255,255,0.8)" />
          <circle cx="28" cy="-5" r="2" fill="rgba(255,255,255,0.8)" />
          <circle cx="28" cy="5" r="2" fill="rgba(255,255,255,0.8)" />
        </g>
      </g>

      {/* Main Quote-style Text */}
      <text
        x="400"
        y="175"
        textAnchor="middle"
        fill="rgba(255,255,255,0.95)"
        fontSize="26"
        fontWeight="400"
        fontStyle="italic"
        letterSpacing="0.5"
      >
        Found peace by letting go of
      </text>

      {/* Number - Soft Style */}
      <text
        x="400"
        y="265"
        textAnchor="middle"
        fill="white"
        fontSize="110"
        fontWeight="300"
        letterSpacing="-2"
        filter="url(#zenGlow)"
      >
        {count}
      </text>

      {/* Subtitle */}
      <text
        x="400"
        y="300"
        textAnchor="middle"
        fill="rgba(255,255,255,0.85)"
        fontSize="20"
        fontWeight="400"
      >
        connections
      </text>

      {/* Mindfulness Badges */}
      <g transform="translate(400, 350)">
        <rect
          x="-140"
          y="-25"
          width="280"
          height="50"
          rx="25"
          fill="rgba(255,255,255,0.2)"
          style={{ backdropFilter: 'blur(10px)' }}
        />
        
        <text
          x="0"
          y="-5"
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize="14"
          fontWeight="500"
        >
          ✨ Digital minimalism
        </text>
        
        <text
          x="0"
          y="12"
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize="14"
          fontWeight="500"
        >
          🧘 {duration} of mindful unfollowing
        </text>
      </g>

      {/* Bottom Mantra */}
      <g transform="translate(400, 420)">
        <text
          x="0"
          y="0"
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize="13"
          fontWeight="500"
          fontStyle="italic"
        >
          "Less is more. Energy is sacred." 🌸
        </text>
      </g>

      {/* Decorative Corner Elements */}
      <g opacity="0.3">
        {/* Top left */}
        <circle cx="40" cy="40" r="3" fill="white" />
        <circle cx="60" cy="40" r="2" fill="white" />
        <circle cx="40" cy="60" r="2" fill="white" />
        
        {/* Top right */}
        <circle cx="760" cy="40" r="3" fill="white" />
        <circle cx="740" cy="40" r="2" fill="white" />
        <circle cx="760" cy="60" r="2" fill="white" />
        
        {/* Bottom left */}
        <circle cx="40" cy="410" r="3" fill="white" />
        <circle cx="60" cy="410" r="2" fill="white" />
        <circle cx="40" cy="390" r="2" fill="white" />
        
        {/* Bottom right */}
        <circle cx="760" cy="410" r="3" fill="white" />
        <circle cx="740" cy="410" r="2" fill="white" />
        <circle cx="760" cy="390" r="2" fill="white" />
      </g>
    </svg>
  );
};
