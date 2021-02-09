import setting from "lib/misc/setting";
import logger from "lib/misc/logger";
import vmcService from "lib/services/vmc.service";
import React, { useState } from "react";
import { ScanVisitorResult } from "lib/types";

export const getServerSideProps = async ({ query, res }) => {
  const {
    visitor_id: visitorId,
    device_id: deviceId,
    temp: temperature,
  } = query;
  logger.info("scan", visitorId, temperature, deviceId);

  const result = await vmcService.scanVisitor(visitorId, temperature, deviceId);
  logger.info(result);
  const timeout =
    result === ScanVisitorResult.ESCORT_REQUIRED ? 1000 * 7 : setting.timeout;

  res.setHeader(
    "location",
    `/result?timeout?${timeout}&status=${result}&visitor_id=${visitorId}&temp=${temperature}&device_id=${deviceId}&my_timeout=${timeout}`
  );

  // res.setHeader(
  //   "location",
  //   `/result?timeout=${timeout}&status=BLACKLIST&visitor_id=${visitorId}&temp=${temperature}&device_id=${deviceId}`
  // );

  res.statusCode = 302;
  res.end();

  return { props: { status: "Loading..." } };
};

export default function Home({ status }) {
  return (
    <>
      <div>{status}</div>
    </>
  );
}
