import { app } from 'electron';
import { ElectronThreadService } from "./lib/electron-thread-service";
import { ThreadRegister } from "./lib/electron-thread-register";

export let threads: ElectronThreadService[] = [];
export { ThreadRegister } from './lib/electron-thread-register';
export { ElectronThreadService } from './lib/electron-thread-service';
export { IThreadLaunchOptions, IThreadRunOptions } from './lib/ielectron-thread-options';
export { ThreadExport } from './lib/electron-thread-export';
export { ElectronThread } from './lib/electron-thread';

if (app) {
    app.on('ready', () => {
        ThreadRegister.register();
    });
}