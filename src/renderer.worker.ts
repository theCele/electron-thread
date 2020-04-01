import { execSync } from 'child_process';
import { ThreadExport } from "./lib/electron-thread-export";

function getProcessId(paramOne: string, paramTwo: number): string {
    return `${paramOne}:${paramTwo} ${process.pid}`;
}

function getSystemInfo(paramOne: string, paramTwo: string): Promise<string> {
    return new Promise( (resolve, reject) => {
        let result = execSync('systeminfo').toString();
        resolve(result);
    });
}

function getResponseAfter(ms: number): Promise<string> {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`Process: #${process.pid} says hello world!!! after ${ms} ms.`);
        }, ms);
    });
}

ThreadExport.export({
    getSystemInfo: getSystemInfo,
    getProcessId: getProcessId,
    getResponseAfter: getResponseAfter
});