"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
class ElectronThread {
    constructor(options) {
        this.options = options;
    }
    run(options) {
        return new Promise((resolve, reject) => {
            electron_1.ipcRenderer.invoke('thread:register', this.options)
                .then((channel) => {
                this.channel = channel;
                electron_1.ipcRenderer.invoke(`${channel}:work`, options)
                    .then((channel) => {
                    electron_1.ipcRenderer.invoke(`${channel}:return`)
                        .then(result => {
                        resolve(result);
                    })
                        .catch(err => reject(err));
                })
                    .catch(err => reject(err));
            })
                .catch(err => reject(err));
        });
    }
    end() {
        return new Promise(resolve => {
            electron_1.ipcRenderer.invoke(`${this.channel}:end`)
                .then(() => {
                resolve();
            })
                .catch(() => {
                resolve();
            });
        });
    }
}
exports.ElectronThread = ElectronThread;
//# sourceMappingURL=electron-thread.js.map