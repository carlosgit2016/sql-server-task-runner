import fs from "fs";

export function getTaskJSON(taskPath: string) {
    const taskJSONContent = fs.readFileSync(`${taskPath}`, { encoding: "utf8" });
    const convertedTaskJSON = JSON.parse(taskJSONContent);
    return convertedTaskJSON;
}