import logger from "lib/misc/logger";
import { sql, getSqlNow } from "lib/misc/util";
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
import encryptor from "lib/misc/encryptor";

// default constants for data save
const trDescNormal = "Valid Card Entry";
const trCodeNormal = "Ca";
const trDescSafeEntryFail = "Safe Entry Fail";
const trCodeSafeEntryFail = "Cc";
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

interface Tenant {
	trId: number;
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
	sensetimeDeviceId: string;
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

const getTenant = async (regId: string): Promise<Tenant> => {
	const result = await sqlLib.query(
		sql`
    SELECT
      tr.id trId,
      p.id pId,
      p.vis_identity visIdentity,
      p.contact_no contactNo,
      tr.pass_no passNo,
      p.vis_name name
    FROM
      tenant_reg tr
      LEFT JOIN cd_personnel p ON tr.personnel_id = p.id
    WHERE
      1 = 1
      AND tr.reg_id = @regId
      AND tr.record_status = 'A'
      AND p.record_status = 'A'
      AND tr.is_black_list = 0
      AND (
        tr.date_of_expire IS NULL
        OR tr.date_of_expire >= getdate())`,
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
	tenant: Tenant,
	controller: Controller,
	temperature: number,
	safeentryStatus: string,
	trCode: string,
	trDesc: string
) => {
	await knex("deviceEvent").insert({
		cardNo: staff ? staff.passNo : tenant.passNo,
		ctrlIp: controller.hostName,
		ctrlName: controller.controllerName,
		devName: controller.controllerCode,
		staffName: staff ? staff.name : tenant.name,
		trDesc,
		trCode,
		tranTime: getSqlNow(),
		recordStatus,
		createdId,
		createdDt: getSqlNow(),
		updatedId,
		// updatedDt: new Date(),
		// updatedDt: new Date("YYYY-MM-DD HH:mm:ss"),
		updatedDt: getSqlNow(),
		temperature,
		safeentryStatus,
		staffRegId: staff ? staff.srId : null,
		tenantRegId: tenant ? tenant.trId : null,
		personnelId: staff ? staff.pId : tenant.pId,
		controllerId: controller.id,
	});
};

const doorOpenSenseTime = (deviceId: string, onSuccess: any) => {
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
				if (onSuccess) {
					onSuccess();
				}
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
			doorOpenSenseTime(lane.sensetimeDeviceId, null);
			return ScanVisitorResult.STRANGER_OK;
		}

		let staff = null;
		let tenant = null;
		// ST = staff
		// TE = tenant
		if (visitorId.startsWith("ST")) {
			staff = await getStaff(visitorId);
		} else if (visitorId.startsWith("TE")) {
			tenant = await getTenant(visitorId);
		}

		if (staff || tenant) {
			const controller = await getController(deviceId);
			// even if safe entry check in fail, let it pass

			let safeentryStatus;
			try {
				const visitorIdentity = encryptor.decrypt(
					staff ? staff.visIdentity : tenant.visIdentity
				);
				const mobileno = encryptor.decrypt(
					staff ? staff.contactNo : tenant.contactNo
				);
				// logger.info(visitorIdentity, mobileno);
				const safeEntryResponse =
					process.env.ENV === "test"
						? "Y"
						: await submitSafeEntry({
								actionType: SE_ACTION_TYPE.CHECK_IN, // "checkin" || "checkout"
								venueId: setting.safeEntry.prdVenueId,
								subType: SE_SUB_TYPE.UINFIN, // "uinfin" || "others"
								visitorIdentity, // visitor id || safe entry token
								mobileno,
								profileName: SE_PROFILE.PRD, // prd || stg
						  });
				// safeEntryResponse can be "Y" or "error message"
				if (safeEntryResponse === "Y") {
					safeentryStatus = "Y";
				} else {
					safeentryStatus = "E";
					logger.error(safeEntryResponse);
				}
			} catch (e) {
				safeentryStatus = "E";
				logger.error(e);
			}

			if (safeentryStatus === "Y") {
				await saveDeviceEvent(
					staff,
					tenant,
					controller,
					temperature,
					safeentryStatus,
					trCodeNormal,
					trDescNormal
				);
				doorOpenSenseTime(lane.sensetimeDeviceId, () => {
					doorOpenByPi(
						controller.hostName,
						controller.port,
						controller.piGpioNumber
					);
				});

				return ScanVisitorResult.STAFF_OK;
			} else {
				// safe entry fail
				await saveDeviceEvent(
					staff,
					tenant,
					controller,
					temperature,
					safeentryStatus,
					trCodeSafeEntryFail,
					trDescSafeEntryFail
				);

				logger.error("safe entry trigger fail");
				return ScanVisitorResult.ERROR;
			}
		} else {
			return ScanVisitorResult.STAFF_NOT_FOUND;
		}
	} catch (err) {
		logger.error(err);
		return ScanVisitorResult.ERROR;
	}
};

export default { scanVisitor };
