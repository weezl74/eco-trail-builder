import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	safelist: [
		// Ensure WFG colors are always included in the build
		'bg-wfg-blue',
		'bg-wfg-purple', 
		'bg-wfg-green',
		'bg-wfg-yellow',
		'bg-wfg-orange',
		'bg-wfg-red',
		'text-wfg-blue',
		'text-wfg-purple',
		'text-wfg-green', 
		'text-wfg-yellow',
		'text-wfg-orange',
		'text-wfg-red',
		'border-wfg-blue',
		'border-wfg-purple',
		'border-wfg-green',
		'border-wfg-yellow', 
		'border-wfg-orange',
		'border-wfg-red',
		'hover:border-wfg-blue',
		'hover:border-wfg-purple',
		'hover:border-wfg-green',
		'hover:border-wfg-yellow',
		'hover:border-wfg-orange',
		'hover:border-wfg-red'
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				helvetica: ['Helvetica', 'Arial', 'sans-serif'],
				roboto: ['Roboto Slab', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					dark: 'hsl(var(--primary-dark))',
					light: 'hsl(var(--primary-light))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					hover: 'hsl(var(--accent-hover))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Category-specific colors
				category: {
					waste: 'hsl(var(--category-waste))',
					energy: 'hsl(var(--category-energy))',
					buildings: 'hsl(var(--category-buildings))',
					travel: 'hsl(var(--category-travel))',
					consumption: 'hsl(var(--category-consumption))',
					land: 'hsl(var(--category-land))',
				},
				// Caerphilly Business Club branding
				caerphilly: {
					primary: 'hsl(var(--caerphilly-primary))',
					secondary: 'hsl(var(--caerphilly-secondary))',
					accent: 'hsl(var(--caerphilly-accent))',
					yellow: 'hsl(var(--caerphilly-yellow))',
				},
				wfg: {
					orange: 'hsl(var(--wfg-orange))',
					purple: 'hsl(var(--wfg-purple))',
					blue: 'hsl(var(--wfg-blue))',
					green: 'hsl(var(--wfg-green))',
					red: 'hsl(var(--wfg-red))',
					yellow: 'hsl(var(--wfg-yellow))',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-hero': 'var(--gradient-hero)',
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'medium': 'var(--shadow-medium)',
				'strong': 'var(--shadow-strong)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
