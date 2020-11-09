import Head from "next/head";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import { GetStaticProps } from "next";

import React, { useContext, useState } from "react";
import { url } from "inspector";

// https://centricore.app:xxxx/scan?visitor_id=xxxxxx&temp=36.8&device_id=xxxxx
// https://centricore.app:8088/result?timeout=7000&status=success&visitor_id=xxxxxx&temp=36.8&device_id=xxxxx
// export const getServerSideProps = async ({ query }) => {
//   const { sessionId, flowNumber } = query;

//   return {
//     props: {
//       status
//     },
//   };
// };

const leftPanel = (
  <div style={{ marginTop: 0 }}>
    <div>&nbsp;</div>
    <div style={{ textAlign: "center" }}>
      {" "}
      <img
        src={
          "https://recledmi.sirv.com/Images/vmc_sense_time/man.gif?w=150&h=250"
        }
        alt="man"
        style={{ maxWidth: 150 }}
      />
    </div>
  </div>
);

export default function Home(props) {
  const [selectedLang, setSelectedLang] = useState("en");

  const selectLang = (code) => {
    setSelectedLang(code);
    console.log(code);
  };

  return (
    <div className="main-layout">
      <div className="cc-logo">
        <img
          src={
            "https://recledmi.sirv.com/Images/vmc_sense_time/centricore.png?w=130&h=52"
          }
          alt="centricore"
        />
      </div>
      <div>
        <div style={{ height: 20 }}>&nbsp;</div>
      </div>
      <div className="title-div">
        <div className="title-text">THANK YOU</div>
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
                              Please proceed to enter.
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
