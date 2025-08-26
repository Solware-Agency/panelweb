import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [
		react(),
		...(mode === 'analyze'
			? [
					visualizer({
						filename: 'dist/stats.html',
						open: true,
						gzipSize: true,
						brotliSize: true,
						template: 'treemap',
					}),
			  ]
			: []),
	],
	resolve: {
		alias: {
			'@lib': path.resolve(__dirname, 'src/lib'),
			'@app': path.resolve(__dirname, 'src/app'),
			'@features': path.resolve(__dirname, 'src/features'),
			'@shared': path.resolve(__dirname, 'src/shared'),
			'@assets': path.resolve(__dirname, 'src/assets'),
		},
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3001',
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// React core libraries
					if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
						return 'react-vendor'
					}

					// Supabase
					if (id.includes('@supabase')) {
						return 'supabase-vendor'
					}

					// Radix UI components
					if (id.includes('@radix-ui')) {
						return 'ui-vendor'
					}

					// Form libraries
					if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) {
						return 'form-vendor'
					}

					// Animation libraries
					if (id.includes('framer-motion') || id.includes('motion')) {
						return 'animation-vendor'
					}

					// PDF libraries
					if (id.includes('pdf-lib') || id.includes('jspdf') || id.includes('html2canvas')) {
						return 'pdf-vendor'
					}

					// Charts
					if (id.includes('recharts')) {
						return 'charts-vendor'
					}

					// Date utilities
					if (id.includes('date-fns')) {
						return 'date-vendor'
					}

					// Query libraries
					if (id.includes('@tanstack/react-query')) {
						return 'query-vendor'
					}

					// Material UI
					if (id.includes('@mui/material') || id.includes('@emotion')) {
						return 'mui-vendor'
					}

					// Other UI utilities
					if (
						id.includes('lucide-react') ||
						id.includes('class-variance-authority') ||
						id.includes('clsx') ||
						id.includes('cmdk') ||
						id.includes('input-otp') ||
						id.includes('next-themes') ||
						id.includes('react-day-picker') ||
						id.includes('react-resizable-panels') ||
						id.includes('react-window') ||
						id.includes('sonner') ||
						id.includes('tailwind-merge') ||
						id.includes('tailwindcss-animate') ||
						id.includes('vaul')
					) {
						return 'ui-vendor'
					}

					// Carousel
					if (id.includes('embla-carousel-react')) {
						return 'carousel-vendor'
					}

					// Other utilities
					if (id.includes('ogl')) {
						return 'utils-vendor'
					}

					// Vendor chunk for other node_modules
					if (id.includes('node_modules')) {
						return 'vendor'
					}
				},
			},
		},
	},
}))