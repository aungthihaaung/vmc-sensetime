import vmcService from "lib/services/vmc.service";
import { init, deInit } from "./helper";

import { ScanVisitorResult } from "lib/types";

beforeAll((done) => {
	init().then(() => {
		done();
	});
});

afterAll((done) => {
	deInit().then(() => {
		done();
	});
});

describe("scan", () => {
	const visitorId = "TE_000021";
	const temperature = 1.1;
	const deviceId = "123";

	const visitorIdWrong = "TE_000021_wrong";
	const visitorIdStranger = "null";

	it("Tenant found.", async () => {
		const result = await vmcService.scanVisitor(
			visitorId,
			temperature,
			deviceId
		);
		expect(result).toEqual(ScanVisitorResult.STAFF_OK);
	});

	it("Tenant not found.", async () => {
		const result = await vmcService.scanVisitor(
			visitorIdWrong,
			temperature,
			deviceId
		);
		expect(result).toEqual(ScanVisitorResult.STAFF_NOT_FOUND);
	});
});

export {};
