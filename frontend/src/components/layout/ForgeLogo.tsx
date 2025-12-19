import { memo } from 'react'

interface ForgeLogoProps {
  className?: string
  size?: number
  showText?: boolean
}

export const ForgeLogo = memo(function ForgeLogo({ 
  className = '', 
  size = 32,
  showText = true 
}: ForgeLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-2xl"
      >
        <defs>
          {/* Main purple gradient */}
          <linearGradient id="forgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          
          {/* Accent green gradient */}
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06d6a0" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          
          {/* Fire/Heat gradient */}
          <linearGradient id="fireGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0.4" />
          </linearGradient>
          
          {/* Radial glow */}
          <radialGradient id="radialGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#9333ea" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Fire glow filter */}
          <filter id="fireGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background radial glow */}
        <circle cx="40" cy="40" r="38" fill="url(#radialGlow)" />
        
        {/* Main forge circle - hexagon style */}
        <path
          d="M40 8 L58 18 L58 38 L40 48 L22 38 L22 18 Z"
          fill="url(#forgeGradient)"
          filter="url(#glow)"
          opacity="0.9"
        />
        
        {/* Inner hexagon accent */}
        <path
          d="M40 14 L52 21 L52 35 L40 42 L28 35 L28 21 Z"
          fill="none"
          stroke="url(#accentGradient)"
          strokeWidth="1.5"
          opacity="0.4"
        />
        
        {/* Stylized Hammer - Modern and dynamic */}
        <g transform="translate(40, 28)">
          {/* Hammer handle */}
          <line
            x1="0"
            y1="8"
            x2="0"
            y2="20"
            stroke="url(#accentGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#glow)"
          />
          
          {/* Hammer head - stylized */}
          <path
            d="M-6 8 L6 8 L8 4 L-8 4 Z"
            fill="url(#accentGradient)"
            filter="url(#glow)"
          />
          
          {/* Hammer face detail */}
          <rect x="-7" y="4" width="14" height="2" fill="url(#fireGradient)" opacity="0.6" />
        </g>
        
        {/* Document being forged - stylized */}
        <g transform="translate(20, 45)">
          {/* Document base with curve */}
          <path
            d="M0 0 L18 0 L18 12 Q18 14 16 14 L2 14 Q0 14 0 12 Z"
            fill="white"
            opacity="0.95"
          />
          
          {/* Document lines - data representation */}
          <g stroke="url(#accentGradient)" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="3" x2="12" y2="3" />
            <line x1="3" y1="6" x2="15" y2="6" />
            <line x1="3" y1="9" x2="10" y2="9" />
          </g>
          
          {/* Corner fold */}
          <path
            d="M18 0 L18 6 L24 6 L18 0 Z"
            fill="white"
            opacity="0.7"
          />
        </g>
        
        {/* Fire/Sparkles from forging process */}
        <g>
          {/* Main fire burst */}
          <path
            d="M32 20 Q30 16 28 18 Q26 20 28 22 Q30 24 32 20"
            fill="url(#fireGradient)"
            filter="url(#fireGlow)"
            opacity="0.8"
          />
          <path
            d="M48 20 Q50 16 52 18 Q54 20 52 22 Q50 24 48 20"
            fill="url(#fireGradient)"
            filter="url(#fireGlow)"
            opacity="0.8"
          />
          
          {/* Sparkles */}
          <g fill="url(#accentGradient)" opacity="0.9">
            <circle cx="26" cy="16" r="2" filter="url(#fireGlow)" />
            <circle cx="54" cy="16" r="1.5" filter="url(#fireGlow)" />
            <circle cx="30" cy="14" r="1.5" filter="url(#fireGlow)" />
            <circle cx="50" cy="14" r="2" filter="url(#fireGlow)" />
          </g>
        </g>
        
        {/* Data waves/transformation effect */}
        <g transform="translate(25, 50)" opacity="0.7">
          <path
            d="M0 8 Q5 4 10 8 Q15 12 20 8"
            stroke="url(#accentGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            filter="url(#glow)"
          />
          <path
            d="M0 12 Q5 8 10 12 Q15 16 20 12"
            stroke="url(#accentGradient)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
        </g>
        
        {/* Decorative corner elements */}
        <g opacity="0.3">
          <circle cx="12" cy="12" r="2" fill="url(#accentGradient)" />
          <circle cx="68" cy="12" r="2" fill="url(#accentGradient)" />
          <circle cx="12" cy="68" r="2" fill="url(#accentGradient)" />
          <circle cx="68" cy="68" r="2" fill="url(#accentGradient)" />
        </g>
      </svg>
      
      {showText && (
        <h1 className="text-xl font-bold text-white tracking-tight">
          Forge<span className="text-primary-400">Reports</span>
        </h1>
      )}
    </div>
  )
})

