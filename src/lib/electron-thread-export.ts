import { IThreadRunOptions } from "./ielectron-thread-options";
import { ipcRenderer } from "electron";

export class ThreadExport {
    private static mothods: any = {};
    public static async export(methods: Object) {
        return new Promise( async (resolve, reject) => {
            this.mothods = methods;
            let param: IThreadRunOptions = ipcRenderer.sendSync(`thread-preloader:module-parameters`);
            let result = await this.mothods[param.method](...param.parameters);
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
}