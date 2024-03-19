import { test } from "rollwright";

import swc from "@rollup/plugin-swc";

test.beforeAll(async ({ setup }) => {
	setup({
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
});

export { test };
