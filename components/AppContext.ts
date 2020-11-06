import React from "react";

const appState = { selectedLang: "en", selectLang: null };

export const AppContext = React.createContext(appState);
