import * as electron from 'electron';
import { IThreadRunOptions, ThreadLaunchOptions, IThreadLaunchOptions } from './ielectron-thread-options';
declare class Thread {
    id: number;
    private threadLaunchOptions;
    parent: electron.BrowserWindow;
    window: electron.BrowserWindow | null;
    channel: string;
    private _errorsCounter;
    private _valid;
    get valid(): boolean;
    private _running;
    get running(): boolean;
    constructor(launchOptions: ThreadLaunchOptions);
    private createWindow;
    end(): void;
    callTime(): Promise<VoidFunction>;
    throwError(code: string): Error | undefined;
}
export declare class ElectronThread {
    private threads;
    private options;
    get activeThreads(): number;
    constructor(options: IThreadLaunchOptions);
    run<T>(options: IThreadRunOptions): Promise<T>;
    enqueue(thread: Thread): Promise<unknown>;
    end(): Promise<void>;
    private wait;
}
export {};
