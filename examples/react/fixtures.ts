import { test as base } from "rollwright";

import commonjs from "@rollup/plugin-commonjs";
import swc from "@rollup/plugin-swc";
import inject from "@rollup/plugin-inject";

import { type JSHandle, type Locator } from "@playwright/test";
import { type ReactNode } from "react";
import { type Root } from "react-dom/client";

process.env.NODE_ENV = "development";

export let test = base.extend<{ mount: (render: () => ReactNode) => Promise<Locator> }>({
	mount: [
		async ({ rollup, page }, use) => {
			let root: JSHandle<Root | null> = null as any;

			await use(async function mount(fn, ...args) {
				if (root == null) {
					root = await rollup(async () => {
						let { createRoot } = await import("react-dom/client");
						let section = document.createElement("section");
						document.body.append(section);
						let root = createRoot(section);
						return root;
					});
				}

				let node = await rollup(fn, ...args);
				await rollup((root, node) => root?.render(node), root, node);
				return page.locator("section >> internal:control=component");
			});

			await rollup((root) => root?.unmount(), root);
		},
		{ scope: "test" },
	],
});

test.beforeEach(({ rollup }) => {
	rollup.configurate([
		commonjs(),
		swc({
			swc: {
				jsc: {
					target: "es2022",
					parser: { syntax: "ecmascript", jsx: true, decorators: true },
					transform: {
						react: { runtime: "automatic" },
						optimizer: { globals: { envs: ["NODE_ENV"] } },
					},
				},
				sourceMaps: true,
			},
		}),
		inject({ _jsx: ["react/jsx-runtime", "jsx"] }),
	]);
});
