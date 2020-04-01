"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ThreadLaunchOptions {
    constructor(launchOptions, threadRunOptions, parentWebContents) {
        this.module = launchOptions.module;
        let DEFAULT_OPTIONS = {
            maxCallTime: Infinity,
            maxRetries: 10,
            maxConcurrentThreads: require('os').cpus().length,
            windowOptions: {
                show: false,
                parent: parentWebContents,
                webPreferences: {
                    preload: this.module,
                    nodeIntegration: true,
                    nodeIntegrationInWorker: true,
                    nodeIntegrationInSubFrames: true,
                    devTools: true,
                    backgroundThrottling: false
                }
            }
        };
        this.options = Object.assign({}, DEFAULT_OPTIONS, launchOptions.options);
        this.method = threadRunOptions.method;
        this.parameters = threadRunOptions.parameters;
    }
}
exports.ThreadLaunchOptions = ThreadLaunchOptions;
//# sourceMappingURL=ielectron-thread-options.js.map