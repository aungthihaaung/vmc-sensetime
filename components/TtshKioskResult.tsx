import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function ({ sioUrl, senseTimeDeviceId, temperature, timeout }) {
	const [showLoading, setShowLoading] = useState(false);
	const [sioCli, setSioCli] = useState(null);

	let leftSidePanelImgPath = "";
	let leftSidePanelImgMaxWidth = 0;
	let title = "";
	let message = "";
	let message2 = "";
	let titleStyleClass = "";
	let messageStyleClass = "message"; // default is message
	let qr = null;

	setTimeout(() => {
		setShowLoading(true);
	}, timeout);

	useEffect(() => {
		const _sioCli = io(sioUrl);
		setSioCli(_sioCli);
		_sioCli.emit("kioskWeb.produce.senseTime.temperature", {
			senseTimeDeviceId,
			temperature,
		});
		return () => {
			if (sioCli) sioCli.disconnect();
		};
	}, []);

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

	leftSidePanelImgPath =
		// "https://recledmi.sirv.com/Images/vmc_sense_time/man.gif?w=150&h=250";
		"/images/man.webp";
	leftSidePanelImgMaxWidth = 150;
	title = "THANK YOU";
	titleStyleClass = "title-ok";
	messageStyleClass = "message-ok";
	message = "Please Proceed to Main Kiosk";
	message2 = "请前往主要信息亭";
	// qr = "/images/cc_safe_entry_frame.webp";

	const leftPanel = (
		<div style={{ marginTop: 0 }}>
			<div>&nbsp;</div>
			<div style={{ textAlign: "center" }}>
				{" "}
				<img
					src={leftSidePanelImgPath}
					alt="man"
					style={{ maxWidth: leftSidePanelImgMaxWidth }}
				/>
			</div>
		</div>
	);

	return (
		<div className="main-layout">
			<div className="cc-logo">
				<img
					src={
						// "https://recledmi.sirv.com/Images/vmc_sense_time/centricore.png?w=130&h=52"
						"/images/centricore.webp"
					}
					alt="centricore"
				/>
			</div>
			<div>
				<div style={{ height: 20 }}>&nbsp;</div>
			</div>
			<div className={titleStyleClass}>
				<div className="title-text">{title}</div>
			</div>

			<div style={{ height: "100%", border: "0px solid red" }}>
				<table style={{ borderWidth: 0, height: "100%", width: "97%" }}>
					<tbody>
						<tr style={{}}>
							<td style={{ width: 150, padding: 0 }}>{leftPanel}</td>
							<td rowSpan={2}>
								<div style={{ height: "100%", position: "relative" }}>
									<div className="parallelogram1"></div>
									<div className="parallelogram2"></div>

									<div className="text-box">
										<table
											cellPadding="10"
											style={{ borderWidth: 0, height: "100%" }}
										>
											<tbody>
												<tr>
													<td
														style={{ verticalAlign: "middle", height: "50%" }}
														className={messageStyleClass}
													>
														<div>
															{/* {message1 &&
                                typeof message1 === "string" &&
                                Parser(message1)} */}
															{message}
														</div>
														{message2.length > 0 && <div>{message2}</div>}
														{qr && (
															<>
																<img
																	style={{ marginLeft: 32, marginTop: 39 }}
																	src={qr}
																></img>
															</>
														)}
													</td>
												</tr>
												{/* <tr>
                    <td>B</td>
                  </tr> */}
											</tbody>
										</table>
										{/* <Container className="h-100">
                  <Row className="h-50 w-100">
                    <Col className="align-items-center">A</Col>
                  </Row>
                  <Row className="h-50">
                    <Col className="align-items-center">B</Col>
                  </Row>
                </Container> */}
									</div>
									<div className="parallelogram3"></div>
									<div className="parallelogram4"></div>
								</div>
							</td>
						</tr>
						<tr>
							<td>&nbsp;</td>
						</tr>
					</tbody>
				</table>
				<div style={{ display: "inline-block" }}></div>
			</div>
			{/* <Link to="/success">Success</Link> */}
		</div>
	);
}
