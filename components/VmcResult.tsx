import axios from "axios";
import setting from "lib/misc/setting";
import { ScanVisitorResult } from "lib/types";
import { useState } from "react";

export default function VmcResult({ status, timeout, senseTimeApiUrl }) {
	const [showLoading, setShowLoading] = useState(false);

	let bottomImage = <></>;
	let message;
	let messageFontSize = null;

	// ## TEMP
	// setTimeout(() => {
	//   setShowLoading(true);
	// }, timeout);

	if (showLoading) {
		return (
			<>
				<div
					className="cc-logo-big"
					style={{ textAlign: "center", fontWeight: "bold" }}
				>
					<img src="/images/loader.svg" alt="loader" />
					{/* <img
						src={
							// "https://recledmi.sirv.com/Images/vmc_sense_time/centricore.png?w=130&h=52"
							"/images/centricore_big.webp"
						}
						alt="centricore"
					/> */}
					<span style={{ paddingLeft: 23 }}>Processing...</span>
				</div>
				<div className="cc-logo">
					<img
						src={
							// "https://recledmi.sirv.com/Images/vmc_sense_time/centricore.png?w=130&h=52"
							"/images/centricore.webp"
						}
						alt="centricore"
					/>
				</div>
			</>
		);
	}

	if (status === ScanVisitorResult.STAFF_OK) {
		messageFontSize = 58;
		message = "Please Proceed to Enter";
	} else if (status === ScanVisitorResult.STRANGER_OK) {
		bottomImage = (
			<img src="/images/safe_entry.png" style={{ width: 300 }}></img>
		);
		message = "Please Scan your Trace Together Token";
	} else if (status === ScanVisitorResult.STAFF_NOT_FOUND) {
		bottomImage = <img src="/images/stop_sign.webp"></img>;
		message = "Please approach staff for further assistance.";
	} else if (status === ScanVisitorResult.LANE_DISABLED) {
		bottomImage = <img src="/images/stop_sign.webp"></img>;
		message = "Please approach staff for further assistance.";
	} else if (status === ScanVisitorResult.ERROR) {
		bottomImage = <img src="/images/stop_sign.webp"></img>;
		message = "Please approach staff for further assistance.";
	}

	return (
		<div className="main-layout">
			<div className="cc-logo">
				<img
					src={
						// "https://recledmi.sirv.com/Images/vmc_sense_time/centricore.png?w=130&h=52"
						// "/images/centricore.webp"
						"/images/heeren.png"
					}
					alt="centricore"
				/>
			</div>
			<div
				style={{
					fontSize: 50,
					display: "flex",
					justifyContent: "center",
					height: 500,
					alignItems: "center",
					paddingBottom: 30,
					textAlign: "center",
					color: "#0A5AB2",
					paddingLeft: 15,
					paddingRight: 15,
					flexDirection: "column",
					fontWeight: "bold",
				}}
			>
				<div style={messageFontSize ? { fontSize: messageFontSize } : {}}>
					{message}
				</div>
				<div style={{ marginTop: 15 }}>{bottomImage}</div>
			</div>
		</div>
	);
}
