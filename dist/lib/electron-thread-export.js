"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class ThreadExport {
    static async export(methods) {
        return new Promise(async (resolve, reject) => {
            this.setIpc();
            this.mothods = methods;
            let param = electron_1.ipcRenderer.sendSync(`thread-preloader:module-parameters`);
            let result = undefined;
            try {
                result = await this.mothods[param.method](...param.parameters);
            }
            catch (err) {
                console.error(err);
            }
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
    static setIpc() {
        window.electronConsoleLog = window.console.log;
        window.electronConsoleError = window.console.error;
        window.electronConsoleError = window.console.warn;
        window.console.error = (...args) => {
            window.electronConsoleError(...args);
            try {
                electron_1.ipcRenderer.sendTo(electron_1.remote.getCurrentWindow().getParentWindow().webContents.id, 'electron-thread:console.log', ...args);
            }
            catch (_err) { }
        };
        window.console.log = (...args) => {
            window.electronConsoleLog(...args);
            try {
                electron_1.ipcRenderer.sendTo(electron_1.remote.getCurrentWindow().getParentWindow().webContents.id, 'electron-thread:console.log', ...args);
            }
            catch (_err) { }
        };
    }
}
exports.ThreadExport = ThreadExport;
ThreadExport.mothods = {};
//# sourceMappingURL=electron-thread-export.js.map