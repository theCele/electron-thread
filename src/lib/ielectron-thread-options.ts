import { BrowserWindowConstructorOptions, BrowserWindow } from "electron";

export interface IThreadRunOptions {
    method: string;
    parameters: any [];
}

export interface IThreadLaunchOptions {
    module: string;
    options?: {
        windowOptions?: BrowserWindowConstructorOptions;
        maxConcurrentThreads?: number;
        maxCallTime?: number;
        maxRetries?: number;
    }
}

export class ThreadLaunchOptions implements IThreadLaunchOptions, IThreadRunOptions {
    module: string;
    options: {
        windowOptions: BrowserWindowConstructorOptions;
        maxConcurrentThreads: number;
        maxCallTime: number;
        maxRetries: number;
    }
    method: string;
    parameters: any[];

    constructor(launchOptions: IThreadLaunchOptions, threadRunOptions: IThreadRunOptions, parentWebContents?: BrowserWindow) {
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
        }
        this.options = Object.assign({}, DEFAULT_OPTIONS, launchOptions.options);

        this.method = threadRunOptions.method;
        this.parameters = threadRunOptions.parameters;
    }
}