import { defineConfig } from "@playwright/test";

export default defineConfig({
	use: { headless: process.env.CI != null },
});
