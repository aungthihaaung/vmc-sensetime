import sql, { ConnectionPool, Request } from "mssql";
import setting from "lib/misc/setting";
import logger from "lib/misc/logger";

let poolPromise;
let pool: any = null;

const connect = (onConnected) => {
  const connectionPool = new sql.ConnectionPool(setting.db);
  poolPromise = connectionPool.connect().then((pool2) => {
    logger.info("sql connected");
    if (onConnected) {
      onConnected();
    }
    return pool2;
  });
};

const disconnect = (onDisconnected) => {
  if (pool) {
    pool.close();
  }
  if (onDisconnected) {
    onDisconnected();
  }
};

// console.dir(setting.db_cfg);
const execSql = async (sqlQuery, userInput = {}) => {
  logger.debug(sqlQuery, userInput);

  try {
    pool = await poolPromise;
    let result = pool.request();

    Object.keys(userInput).forEach((key) => {
      result = result.input(key, userInput[key]);
    });
    const iResult = await result.query(sqlQuery);

    return iResult;
  } catch (err) {
    // stringify err to easily grab just the message
    const e = JSON.stringify(err, ["message", "arguments", "type", "name"]);
    const { message } = JSON.parse(e);
    logger.error(message);
    // return { error: message };
    throw err;
  } finally {
    // pool.close(); // closing connection after request is finished.
  }
};

const query = async function (sqlquery, userInput = {}) {
  const result = await execSql(sqlquery, userInput);
  return result.recordset;
};

const update = async function (sqlquery, userInput = {}) {
  const result = await execSql(sqlquery, userInput);
  return result.rowsAffected[0];
};

process.env.ENV !== "test" && connect(null);

export default { query, update, connect, disconnect };
