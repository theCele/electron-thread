import { IThreadRunOptions } from "./ielectron-thread-options";
import { ipcRenderer } from "electron";

export class ThreadExport {
    private static mothods: any = {};
    public static async export(methods: Object) {
        return new Promise( async (resolve, reject): Promise<any> => {
            this.setConsole();
            this.mothods = methods;
            
            // receive method arguments
            let param: IThreadRunOptions = ipcRenderer.sendSync(`thread-preloader:module-parameters`);
            
            // run method
            let result: any = undefined;
            try {
                result = await this.mothods[param.method](...param.parameters);
                // send result
                this.result(result)
                .then(() => {
                    resolve(result);
                });
            } catch (err) {
                // send error
                this.error(err)
                .then(() => {
                    resolve(result);
                });
            }
        });
    }

    private static async result(result: any): Promise<void>  {
        return new Promise( resolve => {
            ipcRenderer.send(`thread-preloader:module-return`, result);
            resolve();
        });
    }

    private static async error(result: any): Promise<void>  {
        return new Promise( resolve => {
            ipcRenderer.send(`thread-preloader:module-error`, result);
            resolve();
        });
    }

    private static setConsole() {
        try {
            (window as any).electronConsoleLog = window.console.log;
            (window as any).electronConsoleError = window.console.error;
            window.console.error = (...args: any) => {
                (window as any).electronConsoleError(...args);
                try {
                    ipcRenderer.send('electron-thread:console.error', ...args);
                } catch(_err) { }
            }
            window.console.log = (...args: any) => {
                (window as any).electronConsoleLog(...args);
                try {
                    ipcRenderer.send('electron-thread:console.log', ...args);
                } catch(_err) { }
            }
        } catch (err) {}
    }
}