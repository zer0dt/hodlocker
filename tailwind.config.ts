import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'media',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // Path to the tremor module
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}", 
    './node_modules/flowbite-react/**/*.js',
    "./node_modules/flowbite/**/*.js",
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        muted: {
          DEFAULT: "hsl(214.3,31.8%,91.4%)",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      backgroundImage: {
        'gradient-radial': 'linear-gradient(45deg, #F7931A, #FFFFFF)',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  
  plugins: [require("tailwindcss-animate"), require("flowbite/plugin"), require('tailwind-scrollbar')]
}
export default config
