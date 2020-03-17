import { ipcRenderer } from 'electron';
import { IThreadLaunchOptions, IThreadRunOptions } from './ielectron-thread-options';

export class ElectronThread {
    private options: IThreadLaunchOptions;
    private channel: string;
    constructor(options: IThreadLaunchOptions) {
        this.options = options;
    }

    run<T>(options: IThreadRunOptions): Promise<T> {
        return new Promise((resolve, reject) => {
            ipcRenderer.invoke('thread:register', this.options)
            .then((channel: string) => {
                this.channel = channel;
                ipcRenderer.invoke(`${channel}:work`, options)
                .then((channel: string) => {
                    ipcRenderer.invoke(`${channel}:return`)
                    .then(result => {
                        resolve(result);
                    })
                    .catch(err => reject(err));
                })
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
    }

    end(): Promise<void> {
        return new Promise(resolve => {
            ipcRenderer.invoke(`${this.channel}:end`)
            .then(() => {
                resolve();
            })
            .catch(() => {
                resolve();
            });
        });
    }
}