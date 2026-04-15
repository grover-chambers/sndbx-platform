import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0A1B2F',
          50: '#E8ECF0',
          100: '#C5CDD6',
          200: '#A2AEBC',
          300: '#7F8FA2',
          400: '#5C7088',
          500: '#3A516E',
          600: '#1A3A5C',
          700: '#0F2B45',
          800: '#0A1F35',
          900: '#0A1B2F',
        },
        teal: {
          DEFAULT: '#00A3A3',
          50: '#E6F5F5',
          100: '#B8E3E3',
          200: '#8AD1D1',
          300: '#5CBFBF',
          400: '#2EADAD',
          500: '#00A3A3',
          600: '#008A8A',
          700: '#006B6B',
          800: '#004C4C',
          900: '#002E2E',
        },
        gold: {
          DEFAULT: '#F5A623',
          50: '#FEF5E8',
          100: '#FCE4C4',
          200: '#FAD3A0',
          300: '#F8C27C',
          400: '#F6B158',
          500: '#F5A623',
          600: '#D18F1C',
          700: '#AD7815',
          800: '#89610E',
          900: '#654A07',
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}

export default config
