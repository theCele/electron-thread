"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class ThreadExport {
    static async export(methods) {
        return new Promise(async (resolve, reject) => {
            this.setConsole();
            this.mothods = methods;
            // receive method arguments
            let param = electron_1.ipcRenderer.sendSync(`thread-preloader:module-parameters`);
            // run method
            let result = undefined;
            try {
                result = await this.mothods[param.method](...param.parameters);
                // send result
                this.result(result)
                    .then(() => {
                    resolve(result);
                });
            }
            catch (err) {
                // send error
                this.error(err)
                    .then(() => {
                    resolve(result);
                });
            }
        });
    }
    static async result(result) {
        return new Promise(resolve => {
            electron_1.ipcRenderer.send(`thread-preloader:module-return`, result);
            resolve();
        });
    }
    static async error(result) {
        return new Promise(resolve => {
            electron_1.ipcRenderer.send(`thread-preloader:module-error`, result);
            resolve();
        });
    }
    static setConsole() {
        try {
            window.electronConsoleLog = window.console.log;
            window.electronConsoleError = window.console.error;
            window.console.error = (...args) => {
                window.electronConsoleError(...args);
                try {
                    electron_1.ipcRenderer.send('electron-thread:console.error', ...args);
                }
                catch (_err) { }
            };
            window.console.log = (...args) => {
                window.electronConsoleLog(...args);
                try {
                    electron_1.ipcRenderer.send('electron-thread:console.log', ...args);
                }
                catch (_err) { }
            };
        }
        catch (err) { }
    }
}
exports.ThreadExport = ThreadExport;
ThreadExport.mothods = {};
//# sourceMappingURL=electron-thread-export.js.map