import { test } from "rollwright";
import { expect } from "@playwright/test";
import esbuild from "rollup-plugin-esbuild";

test.use({ plugins: [esbuild({ exclude: [/node_modules/] })] });

test("lit component", async ({ execute, page }) => {
	let element = await execute(async () => {
		await import("./Component");
		let element = document.createElement("simple-greeting");
		document.body.append(element);
		return element;
	});
	await expect(page.locator("body")).toContainText("Hello, World!");

	await execute((element) => {
		element.setAttribute("name", "Lit");
	}, element);

	await expect(page.locator("body")).toContainText("Hello, Lit!");
});
