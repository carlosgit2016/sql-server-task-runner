# SQL Server Task Runner

Use this task on [AzureDevOps](https://azure.microsoft.com/pt-br/services/devops/) in a build or release pipeline to run a SQL Script in a remote Microsoft SQL Server database.

## Arguments

|Argument|Description  | Required | Condition |
|--|--|--|--|
|DataBase Server  | The database name can be 128 characters or less | Yes| No|
|DataBase Name | The name or network address of the instance of SQL Server to which to connect. The port number can be specified after the `server name: server=tcp:servername, portnumber` | Yes | No |
|DataBase User | User account with the correct privileges to access the database | Yes | No|
|DataBase Password| The password for the SQL Server account logging on| Yes| No|
| Script Source | Target script type, must be a file path or inline script |Yes|No|
| SQL Script | Inline SQL script to execute | Yes | Script Source == Inline|
| File Path | Path of the file that contains SQL script to execute | Yes | Script Source == FilePath |

## Mssql
The task uses the [node-mssql](https://www.npmjs.com/package/mssql) library to connect and run scripts on the remote sql server

Supported drivers: 
 - [Tedious](https://www.npmjs.com/package/tedious) 
 - [msnodesqlv8 windows only](https://www.npmjs.com/package/msnodesqlv8).

## Latest Versions
[v0.0.23](https://github.com/carlosgit2016/sql-server-task-runner/releases/tag/v0.0.23) Initial functional version of the task.

## Images
Images can be found in [iconscout.com](https://iconscout.com/icon/sql-4)
