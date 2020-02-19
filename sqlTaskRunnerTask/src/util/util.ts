import tl = require('azure-pipelines-task-lib');
import { TypeFieldTask } from '../model/TypeFieldsTask';


export default class Util {

    constructor(){}

    static getVariableValue(name: string, type: TypeFieldTask, required?: boolean): string | undefined {
        if (process.env.NODE_ENV === 'DEV') {
            return process.env[name];
        } else if (type === TypeFieldTask.ENVIRONMENT_VARIABLE) {
            return tl.getVariable(name);
        } else {
            return tl.getInput(name, required);
        }
    }

}