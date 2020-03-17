"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class ThreadExport {
    static async export(methods) {
        return new Promise(async (resolve, reject) => {
            this.mothods = methods;
            let param = electron_1.ipcRenderer.sendSync(`thread-preloader:module-parameters`);
            let result = await this.mothods[param.method](...param.parameters);
            this.result(result)
                .then(() => {
                electron_1.ipcRenderer.send('thread-preloader:module-close');
                resolve(result);
            })
                .catch(() => {
                electron_1.ipcRenderer.send('thread-preloader:module-close');
                reject(new Error('Thread export failed'));
            });
        });
    }
    static async result(result) {
        return new Promise(resolve => {
            electron_1.ipcRenderer.sendSync(`thread-preloader:module-return`, result);
            resolve();
        });
    }
}
exports.ThreadExport = ThreadExport;
ThreadExport.mothods = {};
//# sourceMappingURL=electron-thread-export.js.map