import { ScanVisitorResult } from "lib/types";
import React, { useState } from "react";
import setting from "lib/misc/setting";
import VmcResult from "components/VmcResult";

export const getServerSideProps = ({ query, res }) => {
  return {
    props: {
      status: query.status,
      timeout: query.my_timeout,
      temperature: query.temp,
      deviceId: query.device_id,
      senseTimeApiUrl: setting.senseTimeApiUrl,
    },
  };
};

export default function Home({
  status,
  timeout,
  temperature,
  deviceId,
  senseTimeApiUrl,
}) {
  return (
    <VmcResult
      status={status}
      timeout={timeout}
      senseTimeApiUrl={senseTimeApiUrl}
    ></VmcResult>
  );
}
