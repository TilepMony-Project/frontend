import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      },
      keyframes: {
        'fade-in': {
          '0%': { display: 'block', visibility: 'visible', opacity: '0' },
          '100%': { opacity: 'var(--wb-loader-background-opacity, 1)' },
        },
        'fade-out': {
          '0%': { opacity: 'var(--wb-loader-background-opacity, 1)' },
          '100%': { opacity: '0', visibility: 'hidden', display: 'none' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s both',
        'fade-out': 'fade-out 0.3s both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

