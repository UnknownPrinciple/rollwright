import { basename, isAbsolute } from "node:path";

/**
 * @param {string} filename
 * @param {string} code
 * @returns {import("rollup").Plugin}
 */
export function ephemeral(filename, code) {
	if (!isAbsolute) throw new Error("filename needs to be absolute path");

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
