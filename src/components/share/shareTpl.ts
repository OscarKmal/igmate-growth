export const shareStyles = [
	  {
	    id: 'strike',
	    label: 'Strike 🛡️',
	    gradient: 'from-red-500 via-pink-500 to-purple-600',
	    ring: 'ring-purple-400',
	    icon: '🛡️',
	    selectedTextColor: 'text-white',
	    defaultTextColor: 'text-gray-700',
	  },
	  {
	    id: 'meme',
	    label: 'Meme 😎',
	    gradient: 'from-yellow-400 to-red-500',
	    ring: 'ring-orange-400',
	    icon: '😎',
	    selectedTextColor: 'text-white',
	    defaultTextColor: 'text-gray-700',
	  },
	  {
	    id: 'clean',
	    label: 'Clean ✨',
	    gradient: 'from-gray-50 to-gray-100',
	    ring: 'ring-white',
	    icon: '✔️',
	    selectedTextColor: 'text-purple-600', // clean 选中时文字深色
	    defaultTextColor: 'text-gray-600',
	  },
	  {
	    id: 'zen',
	    label: 'Zen 🧘',
	    gradient: 'from-teal-400 to-blue-500',
	    ring: 'ring-cyan-400',
	    icon: '💨',
	    selectedTextColor: 'text-white',
	    defaultTextColor: 'text-gray-700',
	  },
	];


export const efficency = `
<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <defs>
    <linearGradient id="cleanBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f9fafb" stop-opacity="1"/>
      <stop offset="100%" stop-color="#e5e7eb" stop-opacity="1"/>
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ec4899" stop-opacity="1"/>
    </linearGradient>
    <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" stroke-width="1"/>
    </pattern>
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

  <rect width="800" height="450" fill="url(#cleanBg)"/>
  <rect width="800" height="450" fill="url(#grid)" opacity="0.5"/>

  <g transform="translate(400,225)">
    <rect x="-280" y="-160" width="560" height="320" rx="16" fill="rgba(0,0,0,0.05)" filter="url(#softShadow)"/>
    <rect x="-280" y="-160" width="560" height="320" rx="16" fill="white"/>
    <rect x="-280" y="-160" width="560" height="6" rx="16" fill="url(#accentGradient)"/>

    <g transform="translate(0,-80)">
      <circle cx="0" cy="0" r="40" fill="url(#accentGradient)"/>
      <circle cx="0" cy="0" r="36" fill="white"/>
      <circle cx="0" cy="0" r="32" fill="url(#accentGradient)"/>
      <path d="M -10,-2 L -3,8 L 12,-10" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>

    <text x="0" y="-10" text-anchor="middle" fill="#1f2937" font-size="32" font-weight="600" letter-spacing="-0.5">Cleanup Complete</text>
    <line x1="-120" y1="15" x2="120" y2="15" stroke="#e5e7eb" stroke-width="1"/>
    <text x="0" y="75" text-anchor="middle" fill="#111827" font-size="96" font-weight="700" letter-spacing="-2">{count}</text>
    <text x="0" y="100" text-anchor="middle" fill="#6b7280" font-size="16" font-weight="500">connections optimized</text>

    <g transform="translate(0,135)">
      <rect x="-80" y="-14" width="160" height="28" rx="14" fill="#f3f4f6"/>
      <text x="0" y="4" text-anchor="middle" fill="#6b7280" font-size="12" font-weight="600">Completed in {duration}</text>
    </g>
  </g>

  <g transform="translate(400,420)">
    <g transform="translate(-50,-5)">
      <path d="M 0,-4 L 1,0 L 0,4 L -1,0 Z" fill="#8b5cf6" opacity="0.6"/>
      <path d="M -4,0 L 0,1 L 4,0 L 0,-1 Z" fill="#8b5cf6" opacity="0.6"/>
    </g>
    <g transform="translate(50,-5)">
      <path d="M 0,-4 L 1,0 L 0,4 L -1,0 Z" fill="#ec4899" opacity="0.6"/>
      <path d="M -4,0 L 0,1 L 4,0 L 0,-1 Z" fill="#ec4899" opacity="0.6"/>
    </g>
    <text x="0" y="0" text-anchor="middle" fill="#8b5cf6" font-size="13" font-weight="600" letter-spacing="0.5">Digital Minimalism Achieved</text>
  </g>
</svg>
`;

export const justice = `
<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#dc2626" stop-opacity="1"/>
      <stop offset="50%" stop-color="#db2777" stop-opacity="1"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="1"/>
    </linearGradient>
    <pattern id="shieldPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
      <path d="M50 10 L70 40 L50 70 L30 40 Z" fill="rgba(255,255,255,0.05)"/>
    </pattern>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="800" height="450" fill="url(#bgGradient)"/>
  <rect width="800" height="450" fill="url(#shieldPattern)" opacity="0.3"/>
  <rect width="800" height="450" fill="rgba(0,0,0,0.1)"/>

  <g transform="translate(400,80)">
    <path d="M 0,-50 L 30,-40 L 30,0 C 30,20 15,35 0,45 C -15,35 -30,20 -30,0 L -30,-40 Z" fill="rgba(255,255,255,0.15)" stroke="#fcd34d" stroke-width="3"/>
    <path d="M -15,-10 L -5,5 L 15,-20" stroke="#fcd34d" stroke-width="4" stroke-linecap="round" fill="none" filter="url(#glow)"/>
  </g>

  <g transform="translate(400,80)">
    <circle cx="0" cy="0" r="60" fill="rgba(252,211,77,0.2)"/>
    <circle cx="0" cy="0" r="50" fill="rgba(252,211,77,0.1)"/>
  </g>

  <text x="400" y="180" text-anchor="middle" fill="white" font-size="52" font-weight="900" letter-spacing="2">TERMINATED</text>
  <text x="400" y="265" text-anchor="middle" fill="white" font-size="110" font-weight="900">{count}</text>
  <text x="400" y="300" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="22" font-weight="500">non-mutual followers removed</text>

  <g transform="translate(400,345)">
    <rect x="-120" y="-20" width="240" height="40" rx="20" fill="rgba(255,255,255,0.2)"/>
    <text x="0" y="5" text-anchor="middle" fill="white" font-size="16" font-weight="600">⚡ Operation completed in {duration}</text>
  </g>

  <g transform="translate(400,400)">
    <rect x="-150" y="-16" width="300" height="32" rx="16" fill="rgba(0,0,0,0.3)"/>
    <text x="0" y="4" text-anchor="middle" fill="#fcd34d" font-size="14" font-weight="700" letter-spacing="1">🛡️ FOLLOWER GUARDIAN PROTOCOL</text>
  </g>
</svg>
`;

export const witty = `
<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <defs>
    <linearGradient id="memeBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="1"/>
      <stop offset="50%" stop-color="#fb923c" stop-opacity="1"/>
      <stop offset="100%" stop-color="#ef4444" stop-opacity="1"/>
    </linearGradient>
    <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.15)"/>
    </pattern>
    <filter id="comicShadow">
      <feDropShadow dx="4" dy="4" stdDeviation="0" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <rect width="800" height="450" fill="url(#memeBg)"/>
  <rect width="800" height="450" fill="url(#dotPattern)"/>

  <g transform="translate(400,85)">
    <circle cx="0" cy="0" r="48" fill="#fcd34d"/>
    <circle cx="0" cy="0" r="45" fill="#fbbf24"/>
    <g>
      <rect x="-35" y="-8" width="25" height="16" rx="3" fill="#1f2937"/>
      <rect x="10" y="-8" width="25" height="16" rx="3" fill="#1f2937"/>
      <rect x="-10" y="-6" width="20" height="3" rx="1.5" fill="#1f2937"/>
      <rect x="-32" y="-5" width="8" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
      <rect x="13" y="-5" width="8" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
    </g>
    <path d="M -12,15 Q 0,20 12,15" stroke="#1f2937" stroke-width="3" stroke-linecap="round" fill="none"/>
  </g>

  <text x="400" y="175" text-anchor="middle" fill="white" font-size="32" letter-spacing="1" font-family="Impact, Arial Black, sans-serif">JUST UNFOLLOWED</text>
  <text x="400" y="280" text-anchor="middle" fill="white" font-size="110" font-weight="600" font-family="Impact, Arial Black, sans-serif">{count}</text>
  <text x="400" y="330" text-anchor="middle" fill="white" font-size="20"  font-family="Impact, Arial Black, sans-serif">PEOPLE</text>

  <g transform="translate(400,375)">
    <rect x="-130" y="-22" width="260" height="44" rx="22" fill="white"/>
    <text x="0" y="6" text-anchor="middle" fill="#1f2937" font-size="18" font-weight="700">Like a boss 🏆</text>
  </g>

  <text x="400" y="428" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="13" font-weight="600">(Took only {duration}, NBD)</text>
</svg>
`;

export const zen = `
<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
  <defs>
    <linearGradient id="zenBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf" stop-opacity="1"/>
      <stop offset="50%" stop-color="#22d3ee" stop-opacity="1"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="1"/>
    </linearGradient>
    <pattern id="wavePattern" x="0" y="0" width="120" height="60" patternUnits="userSpaceOnUse">
      <path d="M 0,30 Q 30,20 60,30 T 120,30" stroke="rgba(255,255,255,0.1)" stroke-width="2" fill="none"/>
      <path d="M 0,40 Q 30,30 60,40 T 120,40" stroke="rgba(255,255,255,0.05)" stroke-width="2" fill="none"/>
    </pattern>
    <filter id="zenGlow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <radialGradient id="orbGradient">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="800" height="450" fill="url(#zenBg)"/>
  <rect width="800" height="450" fill="url(#wavePattern)"/>

  <circle cx="120" cy="80" r="60" fill="url(#orbGradient)"/>
  <circle cx="680" cy="370" r="70" fill="url(#orbGradient)"/>
  <circle cx="650" cy="100" r="50" fill="url(#orbGradient)"/>
  <circle cx="150" cy="350" r="55" fill="url(#orbGradient)"/>

  <g transform="translate(400,85)">
    <circle cx="0" cy="0" r="45" fill="rgba(255,255,255,0.15)"/>
    <circle cx="0" cy="0" r="35" fill="rgba(255,255,255,0.1)"/>
    <g opacity="0.9">
      <path d="M -25,-5 Q -10,-10 5,-5 Q 15,-8 25,-5" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M -25,5 Q -10,0 5,5 Q 15,2 25,5" stroke="rgba(255,255,255,0.8)" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="-28" cy="-5" r="2" fill="rgba(255,255,255,0.8)"/>
      <circle cx="-28" cy="5" r="2" fill="rgba(255,255,255,0.8)"/>
      <circle cx="28" cy="-5" r="2" fill="rgba(255,255,255,0.8)"/>
      <circle cx="28" cy="5" r="2" fill="rgba(255,255,255,0.8)"/>
    </g>
  </g>

  <text x="400" y="175" text-anchor="middle" fill="rgba(255,255,255,0.95)" font-size="26" font-weight="400" font-style="italic" letter-spacing="0.5">Found peace by letting go of</text>
  <text x="400" y="265" text-anchor="middle" fill="white" font-size="110" font-weight="600" letter-spacing="-2">{count}</text>
  <text x="400" y="300" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-size="20" font-weight="400">connections</text>

  <g transform="translate(400,350)">
    <rect x="-140" y="-25" width="280" height="50" rx="25" fill="rgba(255,255,255,0.2)"/>
    <text x="0" y="-5" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="14" font-weight="500">✨ Digital minimalism</text>
    <text x="0" y="12" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="14" font-weight="500">🧘 {duration} of mindful unfollowing</text>
  </g>

  <g transform="translate(400,420)">
    <text x="0" y="0" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="13" font-weight="500" font-style="italic">"Less is more. Energy is sacred." 🌸</text>
  </g>

  <g opacity="0.3">
    <circle cx="40" cy="40" r="3" fill="white"/>
    <circle cx="60" cy="40" r="2" fill="white"/>
    <circle cx="40" cy="60" r="2" fill="white"/>
    <circle cx="760" cy="40" r="3" fill="white"/>
    <circle cx="740" cy="40" r="2" fill="white"/>
    <circle cx="760" cy="60" r="2" fill="white"/>
    <circle cx="40" cy="410" r="3" fill="white"/>
    <circle cx="60" cy="410" r="2" fill="white"/>
    <circle cx="40" cy="390" r="2" fill="white"/>
    <circle cx="760" cy="410" r="3" fill="white"/>
    <circle cx="740" cy="410" r="2" fill="white"/>
    <circle cx="760" cy="390" r="2" fill="white"/>
  </g>
</svg>
`;
