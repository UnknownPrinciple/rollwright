import { basename } from "node:path";

/**
 * @param {string} filename
 * @param {string} code
 * @returns {import("rollup").Plugin}
 */
export function ephemeral(filename, code) {
	let name = basename(filename);
	return {
		name: "ephemeral_" + name,
		resolveId(id, importer) {
			if (id === name) return id;
			if (importer === name) return this.resolve(id, filename);
			return null;
		},
		load(id) {
			return id === name ? code : null;
		},
	};
}
