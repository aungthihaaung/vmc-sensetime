import Head from "next/head";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import { GetStaticProps } from "next";

import React, { useContext, useState } from "react";
import { url } from "inspector";
import { useRouter } from "next/router";

// http://localhost:3000/scan?visitor_id=xxxxxx&temp=36.8&device_id=xxxxx
// https://centricore.app:xxxx/scan?visitor_id=xxxxxx&temp=36.8&device_id=xxxxx

// https://centricore.app:8088/result?timeout=7000&status=success&visitor_id=xxxxxx&temp=36.8&device_id=xxxxx
export const getServerSideProps = async ({ query, res }) => {
  const { visitor_id: visitorId, temp, device_id: deviceId } = query;
  console.log("scan", visitorId, temp, deviceId);
  const timeout = 7000;
  const status = "success";

  // res.setHeader("Connection", "Transfer-Encoding");
  // res.setHeader("Content-Type", "text/html; charset=utf-8");
  // res.setHeader("Transfer-Encoding", "chunked");
  // res.write("<h1>loading...</h1>");

  // setTimeout(() => {
  // res.write("<br/><h1>done...</h1>");
  // res.setHeader(
  //   "location",
  //   `/result?timeout?${timeout}&status=${status}&visitor_id=${visitorId}&temp=${temp}&device_id=${deviceId}`
  // );
  // res.write(
  //   `<script>location.href='/result?timeout?${timeout}&status=${status}&visitor_id=${visitorId}&temp=${temp}&device_id=${deviceId}'</script>`
  // );
  // }, 3000);

  res.setHeader(
    "location",
    `/result?timeout?${timeout}&status=${status}&visitor_id=${visitorId}&temp=${temp}&device_id=${deviceId}`
  );
  res.statusCode = 302;
  res.end();

  return { props: { status: "Loading..." } };
};

export default function Home({ status }) {
  const [selectedLang, setSelectedLang] = useState("en");

  const selectLang = (code) => {
    setSelectedLang(code);
    console.log(code);
  };

  return (
    <>
      <div>{status}</div>
    </>
  );
}
