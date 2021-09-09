import logger from "lib/misc/logger";
import { sql } from "lib/misc/util";
import sqlLib from "lib/misc/sql";
import setting from "lib/misc/setting";
import { ScanVisitorResult } from "lib/types";
import axios from "axios";
import NodeCache from "node-cache";
import { myKnex as knex } from "lib/misc/knex";
import {
  submitSafeEntry,
  SE_ACTION_TYPE,
  SE_PROFILE,
  SE_SUB_TYPE,
} from "safeentry-cli";

// default constants for data save
const trDesc = "Valid Card Entry";
const trCode = "Ca";
const createdId = "GAN";
const updatedId = "GAN";
const recordStatus = "A";

// https://www.npmjs.com/package/node-cache
const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

const CACHE_KEY = {
  CONTROLLER_INFO: "CONTROLLER_INFO",
  LANE_INFO: "LANE_INFO",
};

interface Staff {
  srId: number;
  pId: number;
  visIdentity: string;
  contactNo: string;
  passNo: string;
  name: string;
}

interface Controller {
  id: number;
  hostName: string;
  port: number;
  piGpioNumber: number;
  controllerName: string;
  controllerCode: string;
}

interface LaneStatus {
  isDisabled: number;
  actionCode: string;
  sensetimeDeviceId: String;
}

/**
 * return single staff record by regId
 * staff_reg.is_black_list must be 0
 * staff_reg.date_of_resign is checked
 * @param regId
 * @returns { } | null
 */
const getStaff = async (regId: string): Promise<Staff> => {
  const result = await sqlLib.query(
    sql`
    SELECT
      sr.id srId,
      p.id pId,
      p.vis_identity visIdentity,
      p.contact_no contactNo,
      sr.pass_no passNo,
      p.vis_name name
    FROM
      staff_reg sr
      LEFT JOIN cd_personnel p ON sr.personnel_id = p.id
    WHERE
      1 = 1
      AND sr.reg_id = @regId 
      AND sr.record_status = 'A'
      AND p.record_status = 'A'
      AND sr.is_black_list = 0
      AND (
        sr.date_of_resign IS NULL
        OR sr.date_of_resign >= getdate())`,
    { regId }
  );
  if (result.length > 0) {
    return result[0];
  }
  return null;
};

/**
 * get controller ip and port by sensetime device id
 * this query is cached
 * @param senseTimeDeviceId
 * @returns { } | null
 */
const getController = async (
  senseTimeDeviceId: string
): Promise<Controller> => {
  const cacheKey = `${CACHE_KEY.CONTROLLER_INFO}_${senseTimeDeviceId}`;
  const controllerCached: any = myCache.get(cacheKey);
  if (controllerCached == undefined) {
    const result = await sqlLib.query(
      sql`
    SELECT
        id,
        host_name hostName,
        port,
        pi_gpio_number piGpioNumber,
        controller_name controllerName,
        controller_code controllerCode
      FROM
        cd_controller
      WHERE
        1 = 1
        AND sensetime_product_no = @senseTimeDeviceId
        AND record_status = 'A'  `,
      { senseTimeDeviceId }
    );
    if (result.length > 0) {
      myCache.set(cacheKey, result[0]);
      return result[0];
    }
    return null;
  }
  // serve from cache
  return controllerCached;
};

/**
 * get cd_lane.is_disabled and cd_lane.action_id
 * this query is cached
 * @param senseTimeDeviceId
 * @returns { } | null
 */
const getLane = async (senseTimeDeviceId: string): Promise<LaneStatus> => {
  const cacheKey = `${CACHE_KEY.LANE_INFO}_${senseTimeDeviceId}`;
  const laneCached: any = myCache.get(cacheKey);
  if (laneCached == undefined) {
    const result = await sqlLib.query(
      sql`
      SELECT
        l.is_disabled isDisabled,
        a.action_code actionCode,
        c.sensetime_device_id as sensetimeDeviceId
      FROM
        cd_lane l
        LEFT JOIN cd_controller c ON l.controller_id = c.id
        LEFT JOIN cd_action a ON l.action_id = a.id
      WHERE
        c.sensetime_product_no = @senseTimeDeviceId  `,
      { senseTimeDeviceId }
    );
    if (result.length > 0) {
      myCache.set(cacheKey, result[0]);
      return result[0];
    }
    return null;
  }
  // serve from cache
  return laneCached;
};

const saveDeviceEvent = async (
  staff: Staff,
  controller: Controller,
  temperature: number,
  safeentryStatus: string
) => {
  await knex("deviceEvent").insert({
    cardNo: staff.passNo,
    ctrlIp: controller.hostName,
    ctrlName: controller.controllerName,
    devName: controller.controllerCode,
    staffName: staff.name,
    trDesc,
    trCode,
    tranTime: new Date(),
    recordStatus,
    createdId,
    createdDt: new Date(),
    updatedId,
    updatedDt: new Date(),
    temperature,
    safeentryStatus,
    staffRegId: staff.srId,
    personnelId: staff.pId,
    controllerId: controller.id,
  });
};

const doorOpenSenseTime = (deviceId: string) => {
  const url = `${setting.senseTimeApiUrl}/openDoor`;
  const payload = {
    id: deviceId,
    remark: "happy",
  };
  logger.info(url, payload);

  process.env.ENV !== "dev" &&
    process.env.ENV !== "test" &&
    axios
      .post(`${setting.senseTimeApiUrl}/openDoor`, payload)
      .then(function (response) {
        logger.info("sensetime openDoor api response", response.data);
      })
      .catch(function (error) {
        logger.error(error);
      });
};

const doorOpenByPi = (hostName: string, port: number, gpioNumber: number) => {
  const url = `http://${hostName}:${port}/api/gpio`;
  const payload = { gpioNumber, action: "pulse" };

  logger.info(url, payload);

  process.env.ENV !== "dev" &&
    process.env.ENV !== "test" &&
    axios
      .post(url, payload)
      .then(function (response) {
        logger.info("pi gpio api response", response.data);
      })
      .catch(function (error) {
        logger.info(error);
      });
};

// const submitSafeentry = async (
//   identity: string,
//   contactNumber: string
// ): Promise<string> => {
//   return "S";
// };

const scanVisitor = async (
  visitorId: string,
  temperature: number,
  deviceId: string
) => {
  try {
    const lane = await getLane(deviceId);
    // console.log(`lane`, lane);
    if (lane.isDisabled === 1) {
      return ScanVisitorResult.LANE_DISABLED;
    }

    if (visitorId === "null") {
      doorOpenSenseTime(lane.sensetimeDeviceId);
      return ScanVisitorResult.STRANGER_OK;
    }

    const staff = await getStaff(visitorId);
    if (staff) {
      const controller = await getController(deviceId);
      // staff.visIdentity,
      // staff.contactNo
      // const safeentryStatus = await submitSafeEntry({
      //   actionType: SE_ACTION_TYPE.CHECK_IN, // "checkin" || "checkout"
      //   venueId: setting.safeEntry.stgVenueId,
      //   subType: SE_SUB_TYPE.UINFIN, // "uinfin" || "others"
      //   visitorIdentity: staff.visIdentity, // visitor id || safe entry token
      //   mobileno: staff.contactNo,
      //   profileName: SE_PROFILE.STG, // prd || stg
      // });
      const safeentryStatus = "Y"; 
      await saveDeviceEvent(staff, controller, temperature, safeentryStatus);

      doorOpenSenseTime(lane.sensetimeDeviceId);
      setTimeout(()=>{
        doorOpenByPi(
          controller.hostName,
          controller.port,
          controller.piGpioNumber
        );
      },4000);
      

      return ScanVisitorResult.STAFF_OK;
    } else {
      return ScanVisitorResult.STAFF_NOT_FOUND;
    }
  } catch (err) {
    logger.error(err);
    return ScanVisitorResult.ERROR;
  }
};

export default { scanVisitor };
