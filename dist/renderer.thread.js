"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const electron_thread_export_1 = require("./lib/electron-thread-export");
function getProcessId(paramOne, paramTwo) {
    console.log('hello from the other side');
    throw new Error(`${paramOne}:${paramTwo} ${process.pid}`);
}
function getSystemInfo(paramOne, paramTwo) {
    return new Promise((resolve, reject) => {
        let result = child_process_1.execSync('systeminfo').toString();
        console.log(result);
        reject(result);
    });
}
electron_thread_export_1.ThreadExport.export({
    getSystemInfo: getSystemInfo,
    getProcessId: getProcessId
});
//# sourceMappingURL=renderer.thread.js.map