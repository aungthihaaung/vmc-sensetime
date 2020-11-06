import Head from "next/head";
import utilStyles from "../styles/utils.module.css";
import { getSortedPostsData } from "../lib/posts";
import Link from "next/link";
import Date from "../components/date";
import { GetStaticProps } from "next";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import React, { useContext, useState } from "react";
import { AppContext } from "../components/AppContext";
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

export default function Home(props) {
  const [selectedLang, setSelectedLang] = useState("en");

  const selectLang = (code) => {
    setSelectedLang(code);
    console.log(code);
  };

  return (
    <>
      <AppContext.Provider value={{ selectedLang, selectLang }}>
        <div>hello world</div>
      </AppContext.Provider>
    </>
  );
}
