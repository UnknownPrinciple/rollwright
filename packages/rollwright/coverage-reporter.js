/** @typedef {import("@playwright/test/reporter").TestCase} TestCase */

import libCoverage from "istanbul-lib-coverage";
import libReport from "istanbul-lib-report";
import reports from "istanbul-reports";

/** @implements {import("@playwright/test/reporter").Reporter} */
export default class IstanbulTextReporter {
	coverageMap = libCoverage.createCoverageMap();

	constructor(config) {
		let { name = "text", options = {} } = config;
		this.report = reports.create(name, options);
	}

	onTestEnd(test) {
		for (let result of test.results)
			for (let attachment of result.attachments)
				if (attachment.name === "tester_coverage_report")
					this.coverageMap.merge(JSON.parse(attachment.body.toString()));
	}

	onEnd() {
		let context = libReport.createContext({ coverageMap: this.coverageMap });
		this.report.execute(context);
	}
}
