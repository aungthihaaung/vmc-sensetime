import React from "react";
import { useContext, useState } from "react";
import { AppContext } from "./AppContext";

export default function LangSelector(props) {
  const { selectedLang, selectLang } = React.useContext(AppContext);
  const [langs, setLangs] = useState(["en", "mm"]);

  const defaultStyle = "cursor-pointer";
  const selectedStyle = defaultStyle + " border-2 rounded-full";

  return (
    <>
      {langs.map((lang) => (
        <li className="flex items-center">
          <a
            className={
              (props.transparent
                ? "lg:text-white lg:hover:text-gray-300 text-gray-800"
                : "text-gray-800 hover:text-gray-600") +
              " px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold"
            }
            href="#pablo"
          >
            <img
              key={lang}
              className={lang === selectedLang ? selectedStyle : defaultStyle}
              onClick={() => selectLang(lang)}
              src={`https://recledmi.sirv.com/Images/ayk/lang/${lang}.png?w=20&h=20`}
            />
            <span className="lg:hidden inline-block ml-2">
              {lang === "en" ? "English" : "Myanmar"}
            </span>
          </a>
        </li>
      ))}
    </>
  );
}
