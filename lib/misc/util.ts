import moment from "moment";

export const sql = (literals, ...expressions) => {
  let string = ``;
  expressions.forEach((val, i) => {
    string += literals[i] + val;
  });

  string += literals[literals.length - 1];
  return string;
};

export const groupBy = (arr, key) => {
  const final: any[] = [];
  let lastVal = null;
  arr.forEach((a) => {
    if (lastVal !== a[key]) {
      final.push(a);
      lastVal = a[key];
    }
  });

  return final;
};

export const format = (fM, value) => {
  const regex = /^[A-Z]*%0[1-9]d$/gm;
  if (regex.exec(fM)) {
    try {
      const prefix = fM.split("%")[0];
      const suffix = fM.split("%")[1];
      const number = parseInt(suffix.substring(1, suffix.length - 1), 10);

      if (value.length > number) {
        return "Invalid value!";
      }
      return prefix + value.padStart(number, "0");
    } catch (e) {
      return "Error!";
    }
  } else {
    return "Invalid format!";
  }
};

/**
 * format like java String.format()
 * %03d -> "001"
 * %3d -> "  1"
 * A%05dZ A%5dZ -> A00001Z A    1Z
 */
export const format2 = function (...args) {
  const f = args[0];
  let i = 1;
  let result = "";

  const regex = /(%\d+d)/;
  const splits = f.split(regex);

  splits.forEach((each) => {
    if (each.match(regex)) {
      const v = `${args[i]}`;
      i++;
      const numStr = each.substring(1, each.length - 1);
      const padChar = numStr.length === 1 ? " " : "0";
      result += v.padStart(parseInt(numStr, 10), padChar);
    } else {
      result += each;
    }
  });
  return result;
};

export const getSqlNow = () => {
  return moment().format("YYYY-MM-DD HH:mm:ss");
};
