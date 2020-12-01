import React, { useState } from "react";
import { AppContext } from "../components/AppContext";

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
