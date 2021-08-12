import sql from "lib/misc/sql";
import { knexConnect, knexDisconnect } from "lib/misc/knex";

export const init = () => {
  return new Promise<void>((resolve, _reject) => {
    sql.connect(() => {
      knexConnect(() => {
        resolve();
      });
    });
  });
};

export const deInit = () => {
  return new Promise<void>((resolve, _reject) => {
    if (sql) {
      sql.disconnect(() => {
        knexDisconnect(() => {
          resolve();
        });
      });
    }
  });
};
