const { execSync } = require('child_process');
require('dotenv/config');

const manifestPath = process.env.MANIFEST_PATH;
const organization = process.env.ORGANIZATION;
const token = process.env.TOKEN;

try {
    console.log(execSync("cd sqlTaskRunnerTask").toString());
    console.log(execSync("tsc").toString());

    console.log(execSync(`tfx extension publish --manifest-globs ${manifestPath} --share-with ${organization} --token ${token}`).toString());
} catch (error) {
    console.error(error);
}