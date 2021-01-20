import { ScanVisitorResult } from "lib/types";
import React, { useState } from "react";
import setting from "lib/misc/setting";
import VmcResult from "components/VmcResult";
import TtshKioskResult from "components/TtshKioskResult";

export const getServerSideProps = ({ query, res }) => {
	return {
		props: {
			status: query.status,
			timeout: query.my_timeout,
			demoMode: setting.demoMode,
			temperature: query.temp,
			deviceId: query.device_id,
			sioUrl: setting.sioUrl,
			senseTimeApiUrl: setting.senseTimeApiUrl,
		},
	};
};

export default function Home({
	sioUrl,
	status,
	timeout,
	demoMode,
	temperature,
	deviceId,
	senseTimeApiUrl,
}) {
	if (demoMode === "vmc") {
		return (
			<VmcResult
				status={status}
				timeout={timeout}
				senseTimeApiUrl={senseTimeApiUrl}
			></VmcResult>
		);
	} else if (demoMode === "ttsh_kiosk") {
		return (
			<TtshKioskResult
				sioUrl={sioUrl}
				senseTimeDeviceId={deviceId}
				temperature={temperature}
				timeout={timeout}
			></TtshKioskResult>
		);
	}
	return <>invalid mode</>;
}
