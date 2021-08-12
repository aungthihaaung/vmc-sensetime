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
  const visitorId = "ST_000006";
  const temperature = 1.1;
  const deviceId = "123";

  const visitorIdWrong = "ST_000006_wrong";
  const visitorIdStranger = "null";

  it("Staff found.", async () => {
    const result = await vmcService.scanVisitor(
      visitorId,
      temperature,
      deviceId
    );
    expect(result).toEqual(ScanVisitorResult.STAFF_OK);
  });

  it("Staff not found.", async () => {
    const result = await vmcService.scanVisitor(
      visitorIdWrong,
      temperature,
      deviceId
    );
    expect(result).toEqual(ScanVisitorResult.STAFF_NOT_FOUND);
  });

  it("Stranger.", async () => {
    const result = await vmcService.scanVisitor(
      visitorIdStranger,
      temperature,
      deviceId
    );
    expect(result).toEqual(ScanVisitorResult.STRANGER_OK);
  });
});

export {};
