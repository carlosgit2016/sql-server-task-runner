import tl = require("azure-pipelines-task-lib/task");
import sql, { Int } from "mssql";
import "dotenv/config";
import Util from "./util/util";
import { TypeFieldTask } from "./model/TypeFieldsTask";
import fs from "fs";

const databaServer = Util.getVariableValue(
  "databaseserver",
  TypeFieldTask.STRING,
  true
);
const databaseName = Util.getVariableValue(
  "databasename",
  TypeFieldTask.STRING,
  true
);
const databaseUser = Util.getVariableValue(
  "databaseuser",
  TypeFieldTask.STRING,
  true
);
const databasePassword = Util.getVariableValue(
  "databasepassword",
  TypeFieldTask.STRING,
  true
);
const querySource = Util.getVariableValue(
  "querysource",
  TypeFieldTask.RADIO,
  true
);

const encryptOption = Util.getVariableValue(
  "encrypt",
  TypeFieldTask.PICK_LIST,
  true
);

console.log("Encryption option: " + encryptOption);

async function run() {
  const config: sql.config = {
    server: <string>databaServer,
    user: databaseUser,
    password: databasePassword,
    database: <string>databaseName,
    requestTimeout: 43200000,
    options: {
      enableArithAbort: true,
      encrypt: encryptOption ? true : false
    }
  };

  let pool: sql.ConnectionPool | null = null;
  // Getting Connection

  try {
    try {
      pool = new sql.ConnectionPool(config);
      console.log("============ Connecting on server ============");
      await pool.connect();
      console.log(
        "============ Connected on server " + config.server + " ============"
      );
    } catch (error) {
      throw "Failed to Create connection on server: " + databaServer + error;
    }

    try {
      /* Executing command */

      const requestToRunSQLQuery: sql.Request = (<sql.ConnectionPool>(
        pool
      )).request();

      let sqlToExecute = null;
      if (querySource === "Inline") {
        const sqlquery = Util.getVariableValue(
          "sqlquery",
          TypeFieldTask.MULTI_LINE,
          true
        );
        sqlToExecute = sqlquery;
      } else if (querySource === "FilePath") {
        const filepath = Util.getVariableValue(
          "filepath",
          TypeFieldTask.FILE_PATH,
          true
        );
        sqlToExecute = getFileContent(<string>filepath);
      }
      if (sqlToExecute === null)
        throw "Problem to determine file path or inline type";

      console.log("Executing query: \n" + sqlToExecute);

      let maxNumberOfRowsToPause = 15;
      pauseAndResumeRequestMAXNumberOfRowsHit(
        requestToRunSQLQuery,
        maxNumberOfRowsToPause
      );
      const result = await requestToRunSQLQuery.query(<string>sqlToExecute);

      console.log("======== Result ========");
      //console.log(result);
      printRecordSets(result);

      console.log("Closing connection");
      //@ts-ignore
      await pool.close();
      console.log("Connection closed");
    } catch (err) {
      throw "Problem when running SQL script" + err;
    }
  } catch (err) {
    tl.logIssue(tl.IssueType.Error, err);
    setTaskFail();
  } finally {
    //@ts-ignore
    if (!pool) return;
    pool.close();
  }
}

function getFileContent(filePath: string) {
  return fs.readFileSync(filePath, "utf8");
}

function setTaskFail() {
  tl.setResult(tl.TaskResult.Failed, "DONE");
}

function printRecordSets<T>(result: sql.IResult<T>) {
  const { recordsets, rowsAffected } = result;
  const affectedRows: number = countAffectedRows(rowsAffected);

  console.log("Affected Rows: " + affectedRows);
  printRecurseArrays(recordsets);
}

function pauseAndResumeRequestMAXNumberOfRowsHit(
  request: sql.Request,
  MAXNumberOfRows: number
) {
  const eventToListener: string = "row";
  const rowsToProcess: any[] = [];
  request.on(eventToListener, row => {
    rowsToProcess.push(row);
    if (rowsToProcess.length >= MAXNumberOfRows) {
      request.pause();
      processRows(rowsToProcess, request);
    }
  });

  request.on(eventToListener, () => {
    request.pause();
    processRows(rowsToProcess, request);
  });
}

function processRows(rowsToProcess: Array<any>, request: sql.Request) {
  // process rows
  rowsToProcess = [];
  request.resume();
}

function countAffectedRows(arrayRowsToCount: Array<number>): number {
  return arrayRowsToCount.reduce(
    (previousValue: number, currentValue: number) => {
      return previousValue + currentValue;
    }
  );
}

function printRecurseArrays(arrayToPrint: Array<any>) {
  //case base
  if (!(arrayToPrint instanceof Array)) {
    console.log(arrayToPrint);
    return;
  }

  // recurse case
  for (let index = 0; index < arrayToPrint.length; index++) {
    printRecurseArrays(arrayToPrint[index]);
  }
}

run();
