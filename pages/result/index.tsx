import React, { useState } from "react";
import { ScanVisitorResult } from "lib/types";

export const getServerSideProps = ({ query, res }) => {
  return { props: { status: query.status } };
};

export default function Home({ status }) {
  let leftSidePanelImgPath = "";
  let leftSidePanelImgMaxWidth = 0;
  let title = "";
  let message = "";
  let titleDivStyleClass = "";

  if (status === ScanVisitorResult.OK) {
    leftSidePanelImgPath =
      // "https://recledmi.sirv.com/Images/vmc_sense_time/man.gif?w=150&h=250";
      "/images/man.webp";
    leftSidePanelImgMaxWidth = 150;
    title = "THANK YOU";
    titleDivStyleClass = "title-div-ok";
    message = "Please Proceed to Enter";
  } else if (status === ScanVisitorResult.NOT_FOUND) {
    leftSidePanelImgPath =
      // "https://recledmi.sirv.com/Images/vmc_sense_time/stop_sign.png?w=150&h=250";
      "/images/stop_sign.webp";
    leftSidePanelImgMaxWidth = 150;
    title = "WARNING";
    titleDivStyleClass = "title-div-not-found";
    message = "No record found.";
  } else if (status === ScanVisitorResult.BLACKLIST) {
    leftSidePanelImgPath =
      // "https://recledmi.sirv.com/Images/vmc_sense_time/stop_sign.png?w=150&h=250";
      "/images/stop_sign.webp";
    leftSidePanelImgMaxWidth = 150;
    title = "ACCESS DENIED";
    titleDivStyleClass = "title-div-not-found";
    message = "YOU SHALL NOT PASS!!!";
  }

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
      <div className={titleDivStyleClass}>
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
                            className="message"
                          >
                            <div>
                              {/* {message1 &&
                                typeof message1 === "string" &&
                                Parser(message1)} */}
                              {message}
                            </div>
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
