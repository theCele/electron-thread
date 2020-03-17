import { ipcMain, BrowserWindow } from 'electron';
import { IThreadLaunchOptions, IThreadRunOptions } from './ielectron-thread-options';

class Thread {
    public id: number;
    public module: string;
    public window: BrowserWindow;
    public channel: string;
    private _errorsCounter: number = 0;
    private _errorsCounterMax: number = 3;
    private _valid: boolean;
    private get valid() : boolean {
        this._errorsCounter++;
        if (this._errorsCounter > this._errorsCounterMax) {
            this._valid = false;
        } else {
            this._valid = true;
        }
        return this._valid;
    }
    

    constructor(module: string) {
        this.module = module;
        this.id = ((Date.now() * Math.random()) / Math.random()) * Math.random();
        this.channel = `${this.module}:${this.id}`;
        this.createWindow();
    }

    private createWindow() {
        this.window = new BrowserWindow({
            show: false,
            webPreferences: {
                preload: this.module,
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                backgroundThrottling: false
            }
        });
        this.window.loadFile(__dirname + '/thread.html');
        this.errorHandlingEvents();
    }

    private errorHandlingEvents() {
        this.window.webContents.on('did-fail-load', () => {
            if (this.window) {
                try {
                    if (this.valid) { 
                        this.window.reload();
                    } else {
                        this.window.close();
                    }
                } catch (err) { }
            };
        });
        this.window.webContents.on('crashed', () => {
            if (this.window) {
                try {
                    if (this.valid) { 
                        this.window.reload();
                    } else {
                        this.window.close();
                    }
                } catch (err) { }
            };
        });
        this.window.webContents.on('unresponsive', () => {
            if (this.window) {
                try {
                    if (this.valid) { 
                        this.window.reload();
                    } else {
                        this.window.close();
                    }
                } catch (err) { }
            };
        });
        this.window.webContents.on('destroyed', () => {
            if (this.window) {
                try {
                    this.window.close();
                } catch (err) { }
            };
        });
        this.window.webContents.on('preload-error', () => {
            if (this.window) {
                try {
                    if (this.valid) { 
                        this.window.reload();
                    } else {
                        this.window.close();
                    }
                } catch (err) { }
            };
        });
        this.window.webContents.on('ipc-message', (event, channel) => {
            if (channel === 'thread-preloader:module-close') {
                try {
                    this.window.close();
                } catch (err) { }
            }
        });
    }
}

export class ElectronThreadService {
    public id: number;
    private options: IThreadLaunchOptions;
    private runOptions: IThreadRunOptions;
    public channel: string;
    private threads: Thread[] = [];
    constructor(options: IThreadLaunchOptions) {
        this.id = ((Date.now() * Math.random()) / Math.random()) * Math.random();
        this.options = options;
        this.channel = `${options.module}:${this.id}`;
        this.handle();
    }

    handle() {
        ipcMain.handle(`${this.channel}:work`, async (_event, args: IThreadRunOptions): Promise<string> => {
            let thread = new Thread(this.options.module)
            this.threads.push(thread);

            this.runOptions = args;
            thread.window.webContents.on('ipc-message-sync', (event: Electron.Event, channel: string, ...args: any[]) => {
                if (channel === 'thread-preloader:module-parameters') (event.returnValue as any) = this.runOptions;
            });

            // handle electron thread from renderer
            ipcMain.handleOnce(`${thread.channel}:return`, async (): Promise<any> => {
                return this.result(thread);
            });
            ipcMain.handleOnce(`${this.channel}:end`, async (): Promise<void> => {
                this.end();
            });

            return thread.channel;
        });
    }

    // handle prealoader
    result(thread: Thread) {
        return new Promise( resolve => {
            thread.window.webContents.on('ipc-message-sync', (event: Electron.Event, channel: string, result) => {
                if (channel === 'thread-preloader:module-return'){
                    event.returnValue = true;
                    resolve(result);
                }
            });
        })
    }

    end() {
        // close
        this.unregister();
        for(let i = 0; i < this.threads.length; i++) {
            if (this.threads[i]) {
                if (this.threads[i].window) {
                    try {
                        this.threads[i].window.close();
                    } catch (err) { }
                }
            }
        }
        this.threads = [];
    }

    private unregister() {
        // handlers
        ipcMain.removeHandler(`${this.channel}:work`);
    }
}