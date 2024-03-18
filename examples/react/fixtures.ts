import { test } from "rollwright";

import commonjs from "@rollup/plugin-commonjs";
import swc from "@rollup/plugin-swc";
import inject from "@rollup/plugin-inject";

export { test };

process.env.NODE_ENV = "development";

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
