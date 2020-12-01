import sql, { ConnectionPool, Request } from "mssql";
import setting from "lib/misc/setting";
import logger from "lib/misc/logger";

// https://stackoverflow.com/questions/30356148/how-can-i-use-a-single-mssql-connection-pool-across-several-routes-in-an-express
const poolPromise = new sql.ConnectionPool(setting.db)
  .connect()
  .then((pool: ConnectionPool) => {
    logger.info("Connected to MSSQL");
    return pool;
  });
// .catch((err) => logger.error("Database Connection Failed! ", err));

// console.dir(setting.db_cfg);
const execSql = async (sqlQuery, userInput = {}) => {
  logger.debug(sqlQuery, userInput);

  try {
    const pool: ConnectionPool = await poolPromise;
    let result: Request = await pool.request();
    // let result = new sql.Request();
    // for (const key in userInput) {
    //   if (Array.isArray(userInput[key])) {
    //     // input(field_name, dataType, value)
    //     result = await result.input(key, sql.Int, userInput[key]);
    //   } else {
    //     // input(field_name, value)
    //     result = await result.input(key, userInput[key]);
    //   }
    // }
    Object.keys(userInput).forEach((key) => {
      // if (Array.isArray(userInput[key])) {
      //   // input(field_name, dataType, value)
      //   result = result.input(key, sql.Int, userInput[key]);
      // } else {
      // input(field_name, value)
      result = result.input(key, userInput[key]);
      // }
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

export default { query, update };
