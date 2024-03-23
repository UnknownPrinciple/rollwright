import { test } from "rollwright";
import { expect } from "@playwright/test";

import svelte from "rollup-plugin-svelte";

test.beforeAll(async ({ setup }) => {
	await setup({
		plugins: [svelte({ compilerOptions: { enableSourcemap: true } })],
	});
});

test("basic svelte", async ({ page, execute }) => {
	await execute(async () => {
		let main = document.createElement("main");
		document.body.append(main);
		let { default: Component } = await import("./App.svelte");
		new Component({ target: main, props: { name: "Svelte" } });
	});

	await expect(page.locator("main")).toContainText("Hello Svelte!");
});
