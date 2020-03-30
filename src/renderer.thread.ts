import { execSync } from 'child_process';
import { ThreadExport } from "./lib/electron-thread-export";

function getProcessId(paramOne: string, paramTwo: number): string {
    console.log('hello from the other side');
    return `${paramOne}:${paramTwo} ${process.pid}`;
}

function getSystemInfo(paramOne: string, paramTwo: string): Promise<string> {
    return new Promise( resolve => {
        let result = execSync('systeminfo').toString();
        console.log(result);
        resolve(result);
    });
}

ThreadExport.export({
    getSystemInfo: getSystemInfo,
    getProcessId: getProcessId
});