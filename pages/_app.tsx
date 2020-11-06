import "../styles/global.css";
import { AppProps } from "next/app";
import "../styles/tailwind.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faGlasses,
  faMapSigns,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

import { faFacebook, faTwitter } from "@fortawesome/free-brands-svg-icons";

library.add(faGlasses, faMapSigns, faBars, faFacebook, faTwitter);

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
