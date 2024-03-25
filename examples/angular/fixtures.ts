import { test as base } from "rollwright";

import swc from "@rollup/plugin-swc";

export let test = base.extend<{}>({
	plugins: [
		swc({
			swc: {
				jsc: {
					target: "es2022",
					parser: { syntax: "typescript", decorators: true },
					transform: {
						optimizer: { globals: { envs: ["NODE_ENV"] } },
					},
				},
				sourceMaps: true,
			},
		}),
	],
});
