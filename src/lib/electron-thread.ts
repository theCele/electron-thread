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
    private get valid() : boolean {
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
        this.callTime(this.threadLaunchOptions.options.maxCallTime)
        this.createWindow();
    }

    private createWindow() {
        this.window = new BrowserWindow(this.threadLaunchOptions.options?.windowOptions);
        this.window.loadFile(__dirname + '/thread.html');
        this.errorHandlingEvents();
    }
    private errorHandlingEvents() {
        this.window?.webContents.on('did-fail-load', () => {
            if (this.window) {
                try {
                    if (this.valid) { 
                        this.window.reload();
                    } else {
                        this.window.close();
                        console.error(new Error(`ProcessTerminatedError with code:${'did-fail-load'} module:${this.threadLaunchOptions.module} method:${this.threadLaunchOptions.method}`))
                        this.window = null;
                    }
                } catch (err) {
                    this.window = null;
                }
            };
        });
        this.window?.webContents.on('crashed', () => {
            if (this.window) {
                try {
                    if (this.valid) { 
                        this.window.reload();
                    } else {
                        this.window.close();
                        console.error(new Error(`ProcessTerminatedError with code:${'crashed'} module:${this.threadLaunchOptions.module} method:${this.threadLaunchOptions.method}`))
                        this.window = null;
                    }
                } catch (err) {
                    this.window = null;
                }
            };
        });
        this.window?.webContents.on('unresponsive', () => {
            if (this.window) {
                try {
                    if (this.valid) { 
                        this.window.reload();
                    } else {
                        this.window.close();
                        console.error(new Error(`ProcessTerminatedError with code:${'unresponsive'} module:${this.threadLaunchOptions.module} method:${this.threadLaunchOptions.method}`))
                        this.window = null;
                    }
                } catch (err) {
                    this.window = null;
                }
            };
        });
        this.window?.webContents.on('destroyed', () => {
            if (this.window) {
                try {
                    this.window.close();
                    this.window = null;
                } catch (err) {
                    this.window = null;
                }
            };
        });
        this.window?.webContents.on('preload-error', () => {
            if (this.window) {
                try {
                    if (this.valid) { 
                        this.window.reload();
                    } else {
                        this.window.close();
                        console.error(new Error(`ProcessTerminatedError with code:${'preload-error'} module:${this.threadLaunchOptions.module} method:${this.threadLaunchOptions.method}`))
                        this.window = null;
                    }
                } catch (err) {
                    this.window = null;
                }
            };
        });
        this.window?.webContents.on('ipc-message', (event, channel) => {
            if (channel === 'thread-preloader:module-close') {
                try {
                    this.window?.close();
                    this.window = null;
                } catch (err) {
                    this.window = null;
                }
            }
        });
    }
    end(): void {
        this.window?.close();
        this.window = null;
    }

    private callTime(timeout: number) {
        return new Promise((resolve, reject) => {
            if (timeout < Infinity) {
                let time = setTimeout(() => {
                    this.window?.close();
                    clearTimeout(time);
                    reject(new Error(`TimeoutError module:${this.threadLaunchOptions.module} method:${this.threadLaunchOptions.method}`));
                }, timeout);
            } else {
                resolve();
            }
        });
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

            thread.window?.webContents.on('ipc-message-sync', (event: Electron.Event, channel: string, ...args: any) => {
                if (channel === 'thread-preloader:module-parameters') {
                    (event.returnValue as any) = options;
                }
            });

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