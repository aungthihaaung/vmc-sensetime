import logger from "lib/misc/logger";
import { sql } from "lib/misc/util";
import sqlLib from "lib/misc/sql";
import setting from "lib/misc/setting";
import { ScanVisitorResult } from "lib/types";
import axios from "axios";

const doorOpen = (id: number) => {
  logger.info(`${setting.senseTimeApiUrl}/openDoor`, id);

  axios
    .post(`${setting.senseTimeApiUrl}/openDoor`, {
      id: 2,
      remark: "happy",
    })
    .then(function (response) {
      logger.info(response.data);
    })
    .catch(function (error) {
      logger.info(error);
    });
};

const scanVisitor = async (
  visitorId: string,
  temperature: number,
  deviceId: number
) => {
  try {
    // @TEMP temporarily hard code for just demo.
    // should read from staff_reg table when all are in sync.
    if (visitorId.indexOf("ST") === 0) {
      doorOpen(deviceId);

      return ScanVisitorResult.STAFF_OK;
    } else if (visitorId.indexOf("null") === 0) {
      // hereen changes. accept stranger.
      doorOpen(deviceId);

      return ScanVisitorResult.STRANGER_OK;
    }

    const regs = await sqlLib.query(
      sql`
        select
          id,
          is_black_list isBlackList,
          anti_passback antiPassback,
          is_escort_required isEscortRequired
          from visitor_reg
          where 1=1
              and record_status = 'A'
              and reg_id = @visitorId
      `,
      { visitorId }
    );
    logger.info(regs);
    if (regs && regs.length > 0) {
      if (regs[0].isBlackList === 1) {
        return ScanVisitorResult.BLACKLIST;
      } else if (regs[0].antiPassback === 1) {
        return ScanVisitorResult.QUOTA_FULL;
      } else if (regs[0].isEscortRequired === 1) {
        return ScanVisitorResult.ESCORT_REQUIRED;
      }
      doorOpen(deviceId);
      return ScanVisitorResult.OK;
    } else {
      return ScanVisitorResult.NOT_FOUND;
    }
  } catch (err) {
    logger.error(err);
    return ScanVisitorResult.ERROR;
  }
};

export default { scanVisitor };
