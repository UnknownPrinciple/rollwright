import { test as base, ConnectFn } from "rollwright";

import commonjs from "@rollup/plugin-commonjs";
import inject from "@rollup/plugin-inject";
import replace from "@rollup/plugin-replace";
import esbuild from "rollup-plugin-esbuild";

import { type JSHandle, type Locator } from "@playwright/test";
import { type ReactNode } from "react";

import * as Sinon from "sinon";

export let test = base.extend<{
	mount: ConnectFn<ReactNode | Promise<ReactNode>, Locator>;
	sinon: <T>(fn: (lib: typeof Sinon) => T) => Promise<JSHandle<T>>;
}>({
	plugins: [
		esbuild({ jsx: "automatic", target: "es2022", exclude: [/node_modules/] }),
		commonjs(),
		replace({ "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV) }),
		inject({
			_jsx: ["react/jsx-runtime", "jsx"],
			_jsxs: ["react/jsx-runtime", "jsxs"],
			sourceMap: true,
			exclude: [/node_modules/],
		}),
	],
	mount: [
		async ({ execute, page }, use) => {
			let root = await execute(async () => {
				let { createRoot } = await import("react-dom/client");
				let section = document.createElement("section");
				document.body.append(section);
				let root = createRoot(section);
				return root;
			});

			await use(async function mount(fn, ...args) {
				let node = await execute(fn, ...args);
				await execute((root, node) => root?.render(node), root, node);
				return page.locator("section >> internal:control=component");
			});

			await execute((root) => root?.unmount(), root);
		},
		{ scope: "test" },
	],
	sinon: async ({ execute }, use) => {
		let sinon = await execute(() => import("sinon"));
		await use((fn) => execute(fn, sinon));
	},
});
