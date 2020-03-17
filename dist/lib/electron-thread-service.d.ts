import { BrowserWindow } from 'electron';
import { IThreadLaunchOptions } from './ielectron-thread-options';
declare class Thread {
    id: number;
    module: string;
    window: BrowserWindow;
    channel: string;
    private _errorsCounter;
    private _errorsCounterMax;
    private _valid;
    private get valid();
    constructor(module: string);
    private createWindow;
    private errorHandlingEvents;
}
export declare class ElectronThreadService {
    id: number;
    private options;
    private runOptions;
    channel: string;
    private threads;
    constructor(options: IThreadLaunchOptions);
    handle(): void;
    result(thread: Thread): Promise<unknown>;
    end(): void;
    private unregister;
}
export {};
