import { expect } from "@playwright/test";
import { test } from "rollwright";
import alias from "@rollup/plugin-alias";

test.describe("mock", () => {
	test.use({ plugins: [alias({ entries: { "./math.js": "./math.mock.js" } })] });

	test("sum 1", async ({ execute }) => {
		let mockValue = 10;

		let mock = await execute(async (value) => {
			let { sum } = await import("./math.mock.js");
			sum.returns(value);
			return sum;
		}, mockValue);

		let res = await execute(async (from) => {
			let element = document.createElement("div");
			document.body.append(element);

			let { sum } = await import("./math.js");
			element.append(document.createTextNode(String(sum(from, 2))));
			return element;
		}, 1);

		expect(await res.asElement().innerText()).toContain(String(mockValue));
		expect(await mock.evaluate((v) => v.callCount)).toEqual(1);
		expect(await mock.evaluate((v) => v.calledWith(1, 2))).toEqual(true);
	});
});

test.describe("real", () => {
	test("sum 1", async ({ execute }) => {
		let res = await execute(async (from) => {
			let element = document.createElement("div");
			document.body.append(element);

			let { sum } = await import("./math.js");
			element.append(document.createTextNode(String(sum(from, 2))));
			return element;
		}, 1);

		expect(await res.asElement().innerText()).toContain("3");
	});
});
