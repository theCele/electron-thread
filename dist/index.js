"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_thread_register_1 = require("./lib/electron-thread-register");
exports.threads = [];
var electron_thread_register_2 = require("./lib/electron-thread-register");
exports.ThreadRegister = electron_thread_register_2.ThreadRegister;
var electron_thread_service_1 = require("./lib/electron-thread-service");
exports.ElectronThreadService = electron_thread_service_1.ElectronThreadService;
var electron_thread_export_1 = require("./lib/electron-thread-export");
exports.ThreadExport = electron_thread_export_1.ThreadExport;
var electron_thread_1 = require("./lib/electron-thread");
exports.ElectronThread = electron_thread_1.ElectronThread;
if (electron_1.app) {
    electron_1.app.on('ready', () => {
        electron_thread_register_1.ThreadRegister.register();
    });
}
//# sourceMappingURL=index.js.map