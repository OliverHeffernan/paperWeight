import { defineConfig } from 'vitepress'

// https://vitepress.vuejs.org/config/app-configs
export default defineConfig({
	lang: 'en-UK',
	title: 'PaperWeight',
	description: 'Bridge the gap between analog and digital workout tracking',
	head: [
		['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
		['meta', { name: 'theme-color', content: '#0B1119' }]
	],
	themeConfig: {
		logo: '/logo.svg',
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Guide', link: '/guide/' },
			{ text: 'Strava Integration', link: '/strava/' }
		],
		sidebar: {
			'/guide/': [
				{
					text: 'Getting Started',
					items: [
						{ text: 'Introduction', link: '/guide/' },
						{ text: 'Quick Start', link: '/guide/quick-start' },
						{ text: 'Features', link: '/guide/features' }
					]
				},
				{
					text: 'Core Concepts',
					items: [
						{ text: 'Analog to Digital', link: '/guide/analog-to-digital' },
						{ text: 'Workout Structure', link: '/guide/workout-structure' },
						{ text: 'Exercise Management', link: '/guide/exercise-management' }
					]
				}
			],
			'/strava/': [
				{
					text: 'Strava Integration',
					items: [
						{ text: 'Overview', link: '/strava/' },
						{ text: 'Setup Guide', link: '/strava/setup' },
						{ text: 'Data Synchronization', link: '/strava/sync' }
					]
				}
			],

		},
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/OliverHeffernan/paperWeight' }
		],
		footer: {
			message: 'Built with Vue.js, TypeScript, and Supabase',
			copyright: 'Copyright © 2025 PaperWeight'
		}
	},
	appearance: 'dark' // Default to dark mode to match the app
})
