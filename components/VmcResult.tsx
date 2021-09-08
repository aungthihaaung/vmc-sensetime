import axios from "axios";
import setting from "lib/misc/setting";
import { ScanVisitorResult } from "lib/types";
import { useState } from "react";

export default function VmcResult({ status, timeout, senseTimeApiUrl }) {
  const [showLoading, setShowLoading] = useState(false);

  let leftSidePanelImgPath = "";
  let leftSidePanelImgMaxWidth = 0;
  let title = "";
  let message;
  let message2 = "";
  let titleStyleClass = "";
  let messageStyleClass = "message"; // default is message
  let qr = null;
  let messageFontSize = 45;
  let leftSidePanelImgDivStyle = {};
  let messageTdStyle = {};

  // ##TEMP
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
    leftSidePanelImgPath =
      // "https://recledmi.sirv.com/Images/vmc_sense_time/man.gif?w=150&h=250";
      "/images/man.webp";
    leftSidePanelImgMaxWidth = 150;
    title = "WELCOME - STAFF";
    titleStyleClass = "title-ok";
    messageStyleClass = "message-ok";
    message = "Please Proceed to Enter";
    // message2 = "请继续输入。";
  } else if (status === ScanVisitorResult.STRANGER_OK) {
    leftSidePanelImgPath =
      // "https://recledmi.sirv.com/Images/vmc_sense_time/man.gif?w=150&h=250";
      "/images/safe_entry.png";
    leftSidePanelImgMaxWidth = 365;
    title = "TRACE TOGETHER TOKEN";
    titleStyleClass = "title-ok";
    messageStyleClass = "message-ok";
    leftSidePanelImgDivStyle = {
      position: "absolute",
      left: -20,
      zIndex: 9,
      bottom: 47,
    };
    messageTdStyle = { paddingBottom: 248 };
    messageFontSize = 25;
    message = "Please Scan your Trace Together Token";
    // message2 = "请继续输入。";
  } else if (status === ScanVisitorResult.STAFF_NOT_FOUND) {
    leftSidePanelImgPath =
      // "https://recledmi.sirv.com/Images/vmc_sense_time/stop_sign.png?w=150&h=250";
      "/images/stop_sign.webp";

    leftSidePanelImgMaxWidth = 150;
    title = "ACCESS DENIED";
    titleStyleClass = "title-error";
    messageFontSize = 25;
    message = "Please approach staff for further assistance.";
  } else if (status === ScanVisitorResult.LANE_DISABLED) {
    leftSidePanelImgPath =
      // "https://recledmi.sirv.com/Images/vmc_sense_time/stop_sign.png?w=150&h=250";
      "/images/stop_sign.webp";

    leftSidePanelImgMaxWidth = 150;
    title = "LANE IS CLOSED";
    titleStyleClass = "title-error";
    messageFontSize = 25;
    message = "Please approach staff for further assistance.";
  }

  const leftPanel = (
    <div style={{ marginTop: 0 }}>
      <div>&nbsp;</div>
      <div style={{ textAlign: "center", ...leftSidePanelImgDivStyle }}>
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
            // "/images/centricore.webp"
            "/images/heeren.png"
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
                            style={{
                              verticalAlign: "middle",
                              height: "50%",
                              ...messageTdStyle,
                            }}
                            className={messageStyleClass}
                          >
                            <div style={{ fontSize: messageFontSize }}>
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
