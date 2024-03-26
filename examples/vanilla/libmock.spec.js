import { expect } from "@playwright/test";
import { test as base } from "rollwright";

let test = base.extend({
	sinon: async ({ execute }, use) => {
		let sinon = await execute(() => import("sinon"));
		await use((fn) => execute(fn, sinon));
	},
});

test("example", async ({ page, sinon, execute }) => {
	let cb = await sinon((lib) => lib.stub());
	let spy = await sinon((lib) => lib.spy(console));

	await execute((cb) => {
		let button = document.createElement("button");
		button.addEventListener("click", () => {
			console.log("clicked");
			cb();
		});
		console.log("created");
		document.body.append(button);
	}, cb);

	await page.click("button");

	expect(await cb.evaluate((m) => m.callCount)).toEqual(1);
	expect(await spy.evaluate((spy) => spy.log.args)).toEqual([["created"], ["clicked"]]);
});
