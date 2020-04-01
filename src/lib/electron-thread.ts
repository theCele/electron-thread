import * as electron from 'electron';
import { remote } from 'electron';
import { exec } from 'child_process'
const BrowserWindow = (remote) ? remote.BrowserWindow : electron.BrowserWindow;
import { IThreadRunOptions, ThreadLaunchOptions, IThreadLaunchOptions } from './ielectron-thread-options';

class Thread {
    public id: number;
    private threadLaunchOptions: ThreadLaunchOptions;
    public parent: electron.BrowserWindow;
    public window: electron.BrowserWindow | null;
    public channel: string;
    private _errorsCounter: number = 0;
    private _valid: boolean;
    public get valid() : boolean {
        this._errorsCounter++;
        if (this._errorsCounter > this.threadLaunchOptions.options.maxRetries) {
            this._valid = false;
        } else {
            this._valid = true;
        }
        return this._valid;
    }
    private _running: boolean;
    public get running() : boolean {
        if (this.window) {
            this._running = true;
        } else {
            this._running = false;
        }
        return this._running;
    }

    constructor(launchOptions: ThreadLaunchOptions) {
        this.threadLaunchOptions = launchOptions;
        this.id = ((Date.now() * Math.random()) / Math.random()) * Math.random();
        this.channel = `${this.threadLaunchOptions.module}:${this.id}`;
        this.callTime();
        this.createWindow();
    }

    private createWindow() {
        this.window = new BrowserWindow(this.threadLaunchOptions.options?.windowOptions);
        this.window.loadFile(__dirname + '/thread.html');
    }
    end(): void {
        this.window?.close();
        this.window = null;
    }

    callTime(): Promise<VoidFunction> {
        return new Promise((resolve, reject) => {
            if (this.threadLaunchOptions.options.maxCallTime < Infinity) {
                let time = setTimeout(() => {
                    if (this.window) {
                        this.window?.close();
                        clearTimeout(time);
                        resolve();
                    } else {
                        clearTimeout(time);
                        resolve();
                    }
                }, this.threadLaunchOptions.options.maxCallTime);
            } else {
                resolve();
            }
        });
    }

    throwError(code: string): Error | undefined {
        let message = new Error(`ProcessTerminatedError with code:${code} module:${this.threadLaunchOptions.module} method:${this.threadLaunchOptions.method}`);
        if (this.window) {
            try {
                if (this.valid) { 
                    this.window.reload();
                    return undefined;
                } else {
                    this.window.close();
                    this.window = null;
                    return message;
                }
            } catch (err) {
                this.window = null;
                return message
            }
        } else {
            return undefined;
        }
    }
}

export class ElectronThread {
    private threads: Thread[] = [];
    private options: IThreadLaunchOptions;
    public get activeThreads() : number {
        return this.threads.filter(t => t.running == true).length;
    }
    
    constructor(options: IThreadLaunchOptions) {
        this.options = options;
    }

    run<T>(options: IThreadRunOptions): Promise<T> {
        return new Promise((resolve, reject) => {
            let thread = new Thread(new ThreadLaunchOptions(this.options, options, remote.getCurrentWindow()));
            this.threads.push(thread);

            //#region IPC SYNC
            thread.window?.webContents.on('ipc-message-sync', (event: Electron.Event, channel: string, ...args: any) => {
                if (channel === 'thread-preloader:module-parameters') {
                    (event.returnValue as any) = options;
                }
            });
            //#endregion

            //#region IPC
            thread.window?.webContents.on('ipc-message', (event: Electron.Event, channel: string, ...args: any) => {
                if (channel === 'electron-thread:console.log') {
                    console.log(...args);
                } else if (channel === 'electron-thread:console.error') {
                    console.error(...args);
                } else if (channel === 'thread-preloader:module-return') {
                    thread.end();
                    resolve(...args);
                } else if (channel === 'thread-preloader:module-error') {
                    thread.end();
                    reject(...args);
                }
            });
            //#endregion

            //#region ERROR HANDLER
            thread.window?.webContents.on('did-fail-load', () => {
                let error = thread.throwError('did-fail-load');
                if (error) {
                    reject(error);
                }
            });
            thread.window?.webContents.on('crashed', () => {
                let error = thread.throwError('crashed');
                if (error) {
                    reject(error);
                }
            });
            thread.window?.webContents.on('unresponsive', () => {
                let error = thread.throwError('unresponsive');
                if (error) {
                    reject(error);
                }
            });
            thread.window?.webContents.on('destroyed', () => {
                let error = thread.throwError('destroyed');
                if (error) {
                    reject(error);
                }
            });
            thread.window?.webContents.on('preload-error', () => {
                let error = thread.throwError('preload-error');
                if (error) {
                    reject(error);
                }
            });
            //#endregion
        });
    }

    end(): Promise<void> {
        return new Promise(resolve => {
            for (let i = 0; i < this.threads.length; i++) {
                try {
                    this.threads[i].end();
                } catch (err) { }
            }
            resolve();
        });
    }
}