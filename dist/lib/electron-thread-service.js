"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class Thread {
    constructor(module) {
        this._errorsCounter = 0;
        this._errorsCounterMax = 3;
        this.module = module;
        this.id = ((Date.now() * Math.random()) / Math.random()) * Math.random();
        this.channel = `${this.module}:${this.id}`;
        this.createWindow();
    }
    get valid() {
        this._errorsCounter++;
        if (this._errorsCounter > this._errorsCounterMax) {
            this._valid = false;
        }
        else {
            this._valid = true;
        }
        return this._valid;
    }
    createWindow() {
        this.window = new electron_1.BrowserWindow({
            show: false,
            webPreferences: {
                preload: this.module,
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                backgroundThrottling: false
            }
        });
        this.window.loadFile(__dirname + '/thread.html');
        this.errorHandlingEvents();
    }
    errorHandlingEvents() {
        this.window.webContents.on('did-fail-load', () => {
            if (this.window) {
                try {
                    if (this.valid) {
                        this.window.reload();
                    }
                    else {
                        this.window.close();
                    }
                }
                catch (err) { }
            }
            ;
        });
        this.window.webContents.on('crashed', () => {
            if (this.window) {
                try {
                    if (this.valid) {
                        this.window.reload();
                    }
                    else {
                        this.window.close();
                    }
                }
                catch (err) { }
            }
            ;
        });
        this.window.webContents.on('unresponsive', () => {
            if (this.window) {
                try {
                    if (this.valid) {
                        this.window.reload();
                    }
                    else {
                        this.window.close();
                    }
                }
                catch (err) { }
            }
            ;
        });
        this.window.webContents.on('destroyed', () => {
            if (this.window) {
                try {
                    this.window.close();
                }
                catch (err) { }
            }
            ;
        });
        this.window.webContents.on('preload-error', () => {
            if (this.window) {
                try {
                    if (this.valid) {
                        this.window.reload();
                    }
                    else {
                        this.window.close();
                    }
                }
                catch (err) { }
            }
            ;
        });
        this.window.webContents.on('ipc-message', (event, channel) => {
            if (channel === 'thread-preloader:module-close') {
                try {
                    this.window.close();
                }
                catch (err) { }
            }
        });
    }
}
class ElectronThreadService {
    constructor(options) {
        this.threads = [];
        this.id = ((Date.now() * Math.random()) / Math.random()) * Math.random();
        this.options = options;
        this.channel = `${options.module}:${this.id}`;
        this.handle();
    }
    handle() {
        electron_1.ipcMain.handle(`${this.channel}:work`, async (_event, args) => {
            let thread = new Thread(this.options.module);
            this.threads.push(thread);
            this.runOptions = args;
            thread.window.webContents.on('ipc-message-sync', (event, channel, ...args) => {
                if (channel === 'thread-preloader:module-parameters')
                    event.returnValue = this.runOptions;
            });
            // handle electron thread from renderer
            electron_1.ipcMain.handleOnce(`${thread.channel}:return`, async () => {
                return this.result(thread);
            });
            electron_1.ipcMain.handleOnce(`${this.channel}:end`, async () => {
                this.end();
            });
            return thread.channel;
        });
    }
    // handle prealoader
    result(thread) {
        return new Promise(resolve => {
            thread.window.webContents.on('ipc-message-sync', (event, channel, result) => {
                if (channel === 'thread-preloader:module-return') {
                    event.returnValue = true;
                    resolve(result);
                }
            });
        });
    }
    end() {
        // close
        this.unregister();
        for (let i = 0; i < this.threads.length; i++) {
            if (this.threads[i]) {
                if (this.threads[i].window) {
                    try {
                        this.threads[i].window.close();
                    }
                    catch (err) { }
                }
            }
        }
        this.threads = [];
    }
    unregister() {
        // handlers
        electron_1.ipcMain.removeHandler(`${this.channel}:work`);
    }
}
exports.ElectronThreadService = ElectronThreadService;
//# sourceMappingURL=electron-thread-service.js.map