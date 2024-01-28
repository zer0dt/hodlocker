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
      backgroundImage: {
        'gradient-radial': 'linear-gradient(45deg, #F7931A, #FFFFFF)',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      width: {
        '586': '586px',
      }
    },
  },
  
  plugins: [require('flowbite/plugin')]
}
export default config
