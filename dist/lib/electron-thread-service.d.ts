import { BrowserWindow, WebContents } from 'electron';
import { IThreadLaunchOptions } from './ielectron-thread-options';
declare class Thread {
    id: number;
    module: string;
    parent: BrowserWindow;
    window: BrowserWindow;
    channel: string;
    private _errorsCounter;
    private _errorsCounterMax;
    private _valid;
    private get valid();
    constructor(module: string, parentWebContents: WebContents);
    private createWindow;
    private errorHandlingEvents;
}
export declare class ElectronThreadService {
    id: number;
    parentWebContents: WebContents;
    private options;
    private runOptions;
    channel: string;
    private threads;
    constructor(options: IThreadLaunchOptions, parentWebContents: WebContents);
    handle(): void;
    result(thread: Thread): Promise<unknown>;
    end(): void;
    private unregister;
}
export {};
