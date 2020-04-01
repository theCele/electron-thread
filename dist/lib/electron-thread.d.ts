import { IThreadRunOptions, IThreadLaunchOptions } from './ielectron-thread-options';
export declare class ElectronThread {
    private threads;
    private options;
    get activeThreads(): number;
    constructor(options: IThreadLaunchOptions);
    run<T>(options: IThreadRunOptions): Promise<T>;
    end(): Promise<void>;
}
