import path from "path";
import fs from "fs";
import yml from "js-yaml";

let setting: any;

(() => {
  const rawData = fs.readFileSync(
    path.join(process.cwd(), "/config/setting.yml"),
    "utf8"
  );
  setting = yml.safeLoad(rawData);
})();

export default setting;
