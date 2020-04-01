"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron = require("electron");
const electron_1 = require("electron");
const BrowserWindow = (electron_1.remote) ? electron_1.remote.BrowserWindow : electron.BrowserWindow;
const ielectron_thread_options_1 = require("./ielectron-thread-options");
class Thread {
    constructor(launchOptions) {
        this._errorsCounter = 0;
        this.threadLaunchOptions = launchOptions;
        this.id = ((Date.now() * Math.random()) / Math.random()) * Math.random();
        this.channel = `${this.threadLaunchOptions.module}:${this.id}`;
        this.callTime();
        this.createWindow();
    }
    get valid() {
        this._errorsCounter++;
        if (this._errorsCounter > this.threadLaunchOptions.options.maxRetries) {
            this._valid = false;
        }
        else {
            this._valid = true;
        }
        return this._valid;
    }
    get running() {
        if (this.window) {
            this._running = true;
        }
        else {
            this._running = false;
        }
        return this._running;
    }
    createWindow() {
        var _a;
        this.window = new BrowserWindow((_a = this.threadLaunchOptions.options) === null || _a === void 0 ? void 0 : _a.windowOptions);
        this.window.loadFile(__dirname + '/thread.html');
    }
    end() {
        var _a;
        (_a = this.window) === null || _a === void 0 ? void 0 : _a.close();
        this.window = null;
    }
    callTime() {
        return new Promise((resolve, reject) => {
            if (this.threadLaunchOptions.options.maxCallTime < Infinity) {
                let time = setTimeout(() => {
                    var _a;
                    if (this.window) {
                        (_a = this.window) === null || _a === void 0 ? void 0 : _a.close();
                        clearTimeout(time);
                        resolve();
                    }
                    else {
                        clearTimeout(time);
                        resolve();
                    }
                }, this.threadLaunchOptions.options.maxCallTime);
            }
            else {
                resolve();
            }
        });
    }
    throwError(code) {
        let message = new Error(`ProcessTerminatedError with code:${code} module:${this.threadLaunchOptions.module} method:${this.threadLaunchOptions.method}`);
        if (this.window) {
            try {
                if (this.valid) {
                    this.window.reload();
                    return undefined;
                }
                else {
                    this.window.close();
                    this.window = null;
                    return message;
                }
            }
            catch (err) {
                this.window = null;
                return message;
            }
        }
        else {
            return undefined;
        }
    }
}
class ElectronThread {
    constructor(options) {
        this.threads = [];
        this.options = options;
    }
    get activeThreads() {
        return this.threads.filter(t => t.running == true).length;
    }
    run(options) {
        return new Promise((resolve, reject) => {
            var _a, _b, _c, _d, _e, _f, _g;
            let thread = new Thread(new ielectron_thread_options_1.ThreadLaunchOptions(this.options, options, electron_1.remote.getCurrentWindow()));
            this.threads.push(thread);
            //#region IPC SYNC
            (_a = thread.window) === null || _a === void 0 ? void 0 : _a.webContents.on('ipc-message-sync', (event, channel, ...args) => {
                if (channel === 'thread-preloader:module-parameters') {
                    event.returnValue = options;
                }
            });
            //#endregion
            //#region IPC
            (_b = thread.window) === null || _b === void 0 ? void 0 : _b.webContents.on('ipc-message', (event, channel, ...args) => {
                if (channel === 'electron-thread:console.log') {
                    console.log(...args);
                }
                else if (channel === 'electron-thread:console.error') {
                    console.error(...args);
                }
                else if (channel === 'thread-preloader:module-return') {
                    thread.end();
                    resolve(...args);
                }
                else if (channel === 'thread-preloader:module-error') {
                    thread.end();
                    reject(...args);
                }
            });
            //#endregion
            //#region ERROR HANDLER
            (_c = thread.window) === null || _c === void 0 ? void 0 : _c.webContents.on('did-fail-load', () => {
                let error = thread.throwError('did-fail-load');
                if (error) {
                    reject(error);
                }
            });
            (_d = thread.window) === null || _d === void 0 ? void 0 : _d.webContents.on('crashed', () => {
                let error = thread.throwError('crashed');
                if (error) {
                    reject(error);
                }
            });
            (_e = thread.window) === null || _e === void 0 ? void 0 : _e.webContents.on('unresponsive', () => {
                let error = thread.throwError('unresponsive');
                if (error) {
                    reject(error);
                }
            });
            (_f = thread.window) === null || _f === void 0 ? void 0 : _f.webContents.on('destroyed', () => {
                let error = thread.throwError('destroyed');
                if (error) {
                    reject(error);
                }
            });
            (_g = thread.window) === null || _g === void 0 ? void 0 : _g.webContents.on('preload-error', () => {
                let error = thread.throwError('preload-error');
                if (error) {
                    reject(error);
                }
            });
            //#endregion
        });
    }
    end() {
        return new Promise(resolve => {
            for (let i = 0; i < this.threads.length; i++) {
                try {
                    this.threads[i].end();
                }
                catch (err) { }
            }
            resolve();
        });
    }
}
exports.ElectronThread = ElectronThread;
//# sourceMappingURL=electron-thread.js.map