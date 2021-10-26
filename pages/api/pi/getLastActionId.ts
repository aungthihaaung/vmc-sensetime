import { NextApiRequest, NextApiResponse } from "next";
import sqlLib from "lib/misc/sql";
import { sql } from "lib/misc/util";
import setting from "lib/misc/setting";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { controllerId } = req.body;
	const actionIdResult = await sqlLib.query(
		sql`
      SELECT
        action_id actionId
      FROM
        cd_lane
      WHERE
        controller_id = @controllerId
        AND record_status = 'A'
			`,
		{ controllerId }
	);

	let doorOpen = false;

	if (
		actionIdResult.length > 0 &&
		actionIdResult[0].actionId === setting.securityDisabledActionId
	) {
		doorOpen = true;
	}

	if (doorOpen) {
		const piGpioNumberResult = await sqlLib.query(
			sql`
		SELECT
			pi_gpio_number piGpioNumber
		FROM
			cd_controller
		WHERE
			id = @controllerId
			and record_status = 'A'
		`,
			{ controllerId }
		);

		if (piGpioNumberResult.length > 0) {
			const { piGpioNumber } = piGpioNumberResult[0];
			res.status(200).json({ doorOpen: true, piGpioNumber });
			return;
		}
	}

	res.status(200).json({ doorOpen: false });
};
