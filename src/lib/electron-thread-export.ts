import { IThreadRunOptions } from "./ielectron-thread-options";
import { ipcRenderer, remote } from "electron";

export class ThreadExport {
    private static mothods: any = {};
    public static async export(methods: Object) {
        return new Promise( async (resolve, reject): Promise<any> => {
            this.setIpc();
            this.mothods = methods;
            let param: IThreadRunOptions = ipcRenderer.sendSync(`thread-preloader:module-parameters`);
            let result: any = undefined;
            try {
                result = await this.mothods[param.method](...param.parameters);
            } catch (err) {
                console.error(err);
            }
            this.result(result)
            .then(() => {
                ipcRenderer.send('thread-preloader:module-close');
                resolve(result);
            })
            .catch(() => {
                ipcRenderer.send('thread-preloader:module-close');
                reject(new Error('Thread export failed'));
            });
        });
    }

    private static async result(result: any): Promise<void>  {
        return new Promise( resolve => {
            ipcRenderer.sendSync(`thread-preloader:module-return`, result);
            resolve();
        });
    }

    private static setIpc() {
        (window as any).electronConsoleLog = window.console.log;
        (window as any).electronConsoleError = window.console.error;
        (window as any).electronConsoleError = window.console.warn;
        window.console.error = (...args: any) => {
            (window as any).electronConsoleError(...args);
            try {
                ipcRenderer.sendTo(remote.getCurrentWindow().getParentWindow().webContents.id, 'electron-thread:console.log', ...args);
            } catch(_err) {}
        }
        window.console.log = (...args: any) => {
            (window as any).electronConsoleLog(...args);
            try {
                ipcRenderer.sendTo(remote.getCurrentWindow().getParentWindow().webContents.id, 'electron-thread:console.log', ...args);
            } catch(_err) {}
        }
    }
}