import { NextApiRequest, NextApiResponse } from "next";
import { myRedis } from "lib/misc/redis";

export default (req: NextApiRequest, res: NextApiResponse) => {
  myRedis.pub(`SENSE_TIME.MESSAGE_IN`, req.body);
  console.log(req.body);
  console.log("****");
  res.status(200).json({ text: "whatever" });
};
