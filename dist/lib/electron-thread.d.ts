import { IThreadLaunchOptions, IThreadRunOptions } from './ielectron-thread-options';
export declare class ElectronThread {
    private options;
    private channel;
    constructor(options: IThreadLaunchOptions);
    run<T>(options: IThreadRunOptions): Promise<T>;
    end(): Promise<void>;
}
