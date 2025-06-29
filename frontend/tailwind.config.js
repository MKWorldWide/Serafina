/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Galaxy Theme Colors
      colors: {
        // Primary Galaxy Colors
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6ff',
          300: '#a5b8ff',
          400: '#8191ff',
          500: '#6b46c1', // Main purple
          600: '#553c9a',
          700: '#4c1d95',
          800: '#2d1b69',
          900: '#1a103d',
        },
        
        // Nebula Blues
        secondary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        
        // Cosmic Backgrounds
        cosmic: {
          primary: '#0a0a0f', // Deep space black
          secondary: '#1a1a2e', // Dark nebula
          tertiary: '#16213e', // Cosmic blue
          glass: 'rgba(255, 255, 255, 0.05)', // Glassmorphism
          glassHover: 'rgba(255, 255, 255, 0.1)',
        },
        
        // Star-like Accents
        accent: {
          gold: '#ffd700', // Golden stars
          silver: '#c0c0c0', // Silver accents
          cyan: '#00ffff', // Cosmic cyan
          magenta: '#ff00ff', // Nebula pink
          orange: '#ff6b35', // Cosmic orange
        },
        
        // Text Colors
        text: {
          primary: '#ffffff',
          secondary: '#e2e8f0',
          tertiary: '#94a3b8',
          muted: '#64748b',
          inverse: '#0a0a0f',
        },
        
        // Status Colors
        status: {
          success: '#10b981', // Emerald
          warning: '#f59e0b', // Amber
          error: '#ef4444', // Red
          info: '#3b82f6', // Blue
        },
      },
      
      // Custom Gradients
      backgroundImage: {
        'galaxy-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'galaxy-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'galaxy-cosmic': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'galaxy-nebula': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'galaxy-full': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        'galaxy-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'galaxy-radial': 'radial-gradient(circle at center, rgba(107, 70, 193, 0.1) 0%, transparent 70%)',
      },
      
      // Custom Shadows
      boxShadow: {
        'cosmic': '0 0 20px rgba(107, 70, 193, 0.3)',
        'nebula': '0 0 30px rgba(59, 130, 246, 0.4)',
        'star': '0 0 15px rgba(255, 215, 0, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(107, 70, 193, 0.6)',
        'inner-glow': 'inset 0 0 20px rgba(107, 70, 193, 0.2)',
      },
      
      // Custom Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in-up': 'slideInUp 0.5s ease-out',
        'slide-in-down': 'slideInDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'cosmic-glow': 'cosmicGlow 4s ease-in-out infinite',
        'nebula-drift': 'nebulaDrift 8s ease-in-out infinite',
        'star-twinkle': 'starTwinkle 1.5s ease-in-out infinite',
      },
      
      // Custom Keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(107, 70, 193, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(107, 70, 193, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        cosmicGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(107, 70, 193, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(107, 70, 193, 0.6), 0 0 80px rgba(59, 130, 246, 0.4)' 
          },
        },
        nebulaDrift: {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '25%': { transform: 'translateX(5px) translateY(-5px)' },
          '50%': { transform: 'translateX(-3px) translateY(3px)' },
          '75%': { transform: 'translateX(2px) translateY(-2px)' },
        },
        starTwinkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
      },
      
      // Custom Fonts
      fontFamily: {
        'sf-pro': ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'sf-text': ['"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'sf-mono': ['"SF Mono"', 'Monaco', '"Cascadia Code"', '"Roboto Mono"', 'Consolas', 'monospace'],
      },
      
      // Custom Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Custom Border Radius
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      // Custom Backdrop Blur
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
} 