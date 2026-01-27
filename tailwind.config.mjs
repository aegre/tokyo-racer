/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
					950: '#082f49',
				},
				accent: {
					50: '#fdf4ff',
					100: '#fae8ff',
					200: '#f5d0fe',
					300: '#f0abfc',
					400: '#e879f9',
					500: '#d946ef',
					600: '#c026d3',
					700: '#a21caf',
					800: '#86198f',
					900: '#701a75',
					950: '#4a044e',
				},
			},
			animation: {
				'fade-in': 'fadeIn 0.3s ease-in-out',
				'slide-up': 'slideUp 0.4s ease-out',
				'slide-down': 'slideDown 0.4s ease-out',
				'scale-in': 'scaleIn 0.2s ease-out',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				slideUp: {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideDown: {
					'0%': { transform: 'translateY(-10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
			},
			transitionProperty: {
				'height': 'height',
				'spacing': 'margin, padding',
			},
		},
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				professional: {
					'primary': '#0ea5e9',
					'primary-focus': '#0284c7',
					'primary-content': '#ffffff',
					'secondary': '#d946ef',
					'secondary-focus': '#c026d3',
					'secondary-content': '#ffffff',
					'accent': '#6366f1',
					'accent-focus': '#4f46e5',
					'accent-content': '#ffffff',
					'neutral': '#1f2937',
					'neutral-focus': '#111827',
					'neutral-content': '#ffffff',
					'base-100': '#ffffff',
					'base-200': '#f9fafb',
					'base-300': '#f3f4f6',
					'base-content': '#111827',
					'info': '#3b82f6',
					'success': '#10b981',
					'warning': '#f59e0b',
					'error': '#ef4444',
				},
			},
		],
		darkTheme: 'professional',
		base: true,
		styled: true,
		utils: true,
	},
};
