import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
	srcDir: "../docs",

	title: "PaperWeight Docs",
	description: "Documentation for PaperWeight.",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Guide', link: '/guide/' },
			{ text: 'Strava', link: '/strava/' },
			{ text: 'App', link: 'https://paperweight.olihef.com' }

		],

		sidebar: [
			{
				text: 'Guide',
				items: [
					{ text: 'PaperWeight User Guide', link: '/guide/' },
					{ text: 'Quick Start', link: '/guide/quick-start' },
					{ text: 'Features', link: '/guide/features' },
					{ text: 'Workout Structure', link: '/guide/workout-structure' },
					{ text: 'Exercise Management', link: '/guide/exercise-management' },
					{ text: 'Analog to Digital Conversion', link: '/guide/analog-to-digital' },
				]
			},
			{
				text: 'Strava',
				items: [
					{ text: 'Strava Integration Overview', link: '/strava/' },
					{ text: 'Connecting PaperWeight to Strava', link: '/strava/setup' },
					{ text: 'Syncing Workouts with Strava', link: '/strava/syncing' },
					{ text: 'Technical Implementation', link: '/strava/technical' },
				]
			}
		],

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/OliverHeffernan/paperWeight' }
		]
	}
})
