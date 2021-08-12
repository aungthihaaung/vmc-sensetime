import Knex from "knex";
import knexStringcase from "knex-stringcase";

import setting from "lib/misc/setting";

let myKnex = null;

const knexConnect = (onConnected) => {
  myKnex = Knex(
    knexStringcase({
      client: "mssql",
      connection: {
        host: setting.db.server,
        port: setting.db.port,
        user: setting.db.user,
        password: setting.db.password,
        database: setting.db.database,
      },
      pool: {
        min: setting.db.pool.min,
        max: setting.db.pool.max,
      },
    })
  );

  myKnex.raw("SELECT getdate()").then(() => {
    if (onConnected) {
      onConnected();
    }
  });
};

const knexDisconnect = (onDisconnected) => {
  myKnex.destroy(() => {
    if (onDisconnected) {
      onDisconnected();
    }
  });
};

// const getMyKnex = () => {
//   return myKnex;
// };

process.env.ENV !== "test" && knexConnect(null);

export { knexConnect, knexDisconnect, myKnex };
