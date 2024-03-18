import { test } from "./fixtures";
import { expect } from "@playwright/test";

test("render should work", async ({ page, rollup }) => {
	let root = await rollup(async () => {
		let { createRoot } = await import("react-dom/client");
		let main = document.createElement("main");
		document.body.append(main);
		let root = createRoot(main);
		return root;
	});

	await rollup((root) => root.render(<h1>Hello, World</h1>), root);
	await expect(page.locator("main")).toContainText("Hello, World");
});

test("custom fixture for better workflow", async ({ mount }) => {
	let el = await mount(() => {
		return <h1 id="heading">Hello</h1>;
	});

	await expect(el).toHaveAttribute("id", "heading");
	await expect(el).toContainText("Hello");
});