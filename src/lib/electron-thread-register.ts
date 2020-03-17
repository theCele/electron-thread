import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { threads } from '../index';
import { ElectronThreadService } from './electron-thread-service';
import { IThreadLaunchOptions } from './ielectron-thread-options';

export class ThreadRegister {
    static register(): void {
        ipcMain.handle('thread:register', (event: IpcMainInvokeEvent, options: IThreadLaunchOptions) => {
            let electronThread = new ElectronThreadService(options);
            threads.push(electronThread);
            return electronThread.channel;
        });
    }
}