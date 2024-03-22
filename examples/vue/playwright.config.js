import { defineConfig } from "@playwright/test";

export default defineConfig({
	use: { headless: process.env.CI != null },
	reporter: [["line"], ["rollwright/coverage-reporter", {}]],
});
