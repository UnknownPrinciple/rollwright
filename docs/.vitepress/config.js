import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Rollwright",
	description:
		"A set of tools to make Playwright comfortable for UI integration testing.",
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [{ text: "Home", link: "/" }],

		sidebar: [
			{
				text: "Getting Started",
				items: [{ text: "Introduction", link: "/introduction" }],
			},
		],

		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/unknownprinciple/rollwright",
			},
		],
	},
});
