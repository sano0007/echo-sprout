/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
    	extend: {
    		colors: {
    			// Minimalistic 3-Color Palette (White, Green, Black)
    			white: '#FFFFFF',
    			green: {
    				50: '#F0FDF4',
    				100: '#DCFCE7',
    				200: '#BBF7D0',
    				300: '#86EFAC',
    				400: '#4ADE80',
    				500: '#22C55E',
    				600: '#16A34A',
    				700: '#15803D',
    				800: '#166534',
    				900: '#14532D',
    			},
    			black: '#0A0A0A',

    			// Neutral grays derived from black/white
    			gray: {
    				50: '#FAFAFA',
    				100: '#F4F4F5',
    				200: '#E4E4E7',
    				300: '#D4D4D8',
    				400: '#A1A1AA',
    				500: '#71717A',
    				600: '#52525B',
    				700: '#3F3F46',
    				800: '#27272A',
    				900: '#18181B',
    			},

    			// Legacy color mappings for gradual migration
    			'rich-black': '#0A0A0A',
    			'light-gray': '#71717A',
    			'pure-white': '#FFFFFF',
    			'cloud-gray': '#E4E4E7',
    			'whisper-gray': '#FAFAFA',

    			// Simplified semantic colors using green palette
    			success: {
    				DEFAULT: '#22C55E',
    				light: '#F0FDF4',
    				border: '#BBF7D0'
    			},
    			warning: {
    				DEFAULT: '#A1A1AA',
    				light: '#F4F4F5',
    				border: '#D4D4D8'
    			},
    			error: {
    				DEFAULT: '#52525B',
    				light: '#F4F4F5',
    				border: '#D4D4D8'
    			},
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
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
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		fontFamily: {
    			sans: [
    				'Inter',
    				'system-ui',
    				'sans-serif'
    			],
    			mono: [
    				'JetBrains Mono',
    				'monospace'
    			]
    		},
    		fontSize: {
    			xs: '0.75rem',
    			sm: '0.875rem',
    			base: '1rem',
    			lg: '1.125rem',
    			xl: '1.25rem',
    			'2xl': '1.5rem',
    			'3xl': '1.875rem',
    			'4xl': '2.25rem'
    		},
    		spacing: {
    			'18': '4.5rem',
    			'88': '22rem',
    			'128': '32rem'
    		},
    		boxShadow: {
    			'subtle': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    			'soft': '0 2px 4px 0 rgb(0 0 0 / 0.06)',
    			'medium': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    			'strong': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    			'intense': '0 20px 25px -5px rgb(0 0 0 / 0.1)'
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
    			},
    			shimmer: {
    				'0%': { backgroundPosition: '-200% 0' },
    				'100%': { backgroundPosition: '200% 0' }
    			},
    			fadeIn: {
    				'0%': { opacity: '0' },
    				'100%': { opacity: '1' }
    			},
    			slideUp: {
    				'0%': { transform: 'translateY(10px)', opacity: '0' },
    				'100%': { transform: 'translateY(0)', opacity: '1' }
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'shimmer': 'shimmer 1.5s infinite',
    			'fade-in': 'fadeIn 0.3s ease-in-out',
    			'slide-up': 'slideUp 0.3s ease-out'
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
}