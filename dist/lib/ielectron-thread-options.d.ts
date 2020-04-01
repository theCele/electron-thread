import { BrowserWindowConstructorOptions, BrowserWindow } from "electron";
export interface IThreadRunOptions {
    method: string;
    parameters: any[];
}
export interface IThreadLaunchOptions {
    module: string;
    options?: {
        windowOptions?: BrowserWindowConstructorOptions;
        maxConcurrentThreads?: number;
        maxCallTime?: number;
        maxRetries?: number;
    };
}
export declare class ThreadLaunchOptions implements IThreadLaunchOptions, IThreadRunOptions {
    module: string;
    options: {
        windowOptions: BrowserWindowConstructorOptions;
        maxConcurrentThreads: number;
        maxCallTime: number;
        maxRetries: number;
    };
    method: string;
    parameters: any[];
    constructor(launchOptions: IThreadLaunchOptions, threadRunOptions: IThreadRunOptions, parentWebContents?: BrowserWindow);
}
