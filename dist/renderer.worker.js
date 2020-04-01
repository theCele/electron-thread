"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const electron_thread_export_1 = require("./lib/electron-thread-export");
function getProcessId(paramOne, paramTwo) {
    return `${paramOne}:${paramTwo} ${process.pid}`;
}
function getSystemInfo(paramOne, paramTwo) {
    return new Promise((resolve, reject) => {
        let result = child_process_1.execSync('systeminfo').toString();
        resolve(result);
    });
}
function getResponseAfter(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`Process: #${process.pid} says hello world!!! after ${ms} ms.`);
        }, ms);
    });
}
electron_thread_export_1.ThreadExport.export({
    getSystemInfo: getSystemInfo,
    getProcessId: getProcessId,
    getResponseAfter: getResponseAfter
});
//# sourceMappingURL=renderer.worker.js.map