import { expect } from "@playwright/test";
import { test } from "rollwright";

test("simple element rendering", async ({ execute }) => {
	let element = await execute(() => {
		let element = document.createElement("div");
		element.innerText = "hello";
		document.body.append(element);
		return element;
	});

	await expect(element.asElement().innerText()).resolves.toContain("hello");

	await execute((element) => {
		element.classList.add("active");
	}, element);

	await expect(element.asElement().getAttribute("class")).resolves.toContain("active");
});

test("imported behavior invoked", async ({ page, execute }) => {
	await execute(async () => {
		let { renderCounter } = await import("./implementation.js");
		let form = document.createElement("form");
		document.body.append(form);
		renderCounter(form);
		return form;
	});

	await expect(page.locator("output")).toHaveText("0");
	await page.click("button");
	await expect(page.locator("output")).toHaveText("1");
	await page.click("button");
	await expect(page.locator("output")).toHaveText("2");
});
