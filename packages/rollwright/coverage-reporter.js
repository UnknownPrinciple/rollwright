/** @typedef {import("@playwright/test/reporter").TestCase} TestCase */

import libcov from "istanbul-lib-coverage";
import { createContext } from "istanbul-lib-report";
import { create as createReport } from "istanbul-reports";

/** @implements {import("@playwright/test/reporter").Reporter} */
export default class IstanbulTextReporter {
	coverageMap = libcov.createCoverageMap();

	constructor(config) {
		let { name = "text", options = {} } = config;
		this.report = createReport(name, options);
	}

	onTestEnd(test) {
		for (let result of test.results)
			for (let attachment of result.attachments)
				if (attachment.name === "tester_coverage_report")
					this.coverageMap.merge(JSON.parse(attachment.body.toString()));
	}

	onEnd() {
		let context = createContext({ coverageMap: this.coverageMap });
		this.report.execute(context);
	}
}
