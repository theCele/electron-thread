"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const index_1 = require("../index");
const electron_thread_service_1 = require("./electron-thread-service");
class ThreadRegister {
    static register() {
        electron_1.ipcMain.handle('thread:register', (event, options) => {
            let electronThread = new electron_thread_service_1.ElectronThreadService(options);
            index_1.threads.push(electronThread);
            return electronThread.channel;
        });
    }
}
exports.ThreadRegister = ThreadRegister;
//# sourceMappingURL=electron-thread-register.js.map