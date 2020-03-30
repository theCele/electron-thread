"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const path = require("path");
const et = require("./index");
const electron_1 = require("electron");
let packagePath = null;
const searchPaths = ['app', 'app.asar', 'default_app.asar'];
for (packagePath of searchPaths) {
    try {
        packagePath = path.join(process.resourcesPath, packagePath);
        break;
    }
    catch (error) {
        continue;
    }
}
console.log(packagePath);
console.log(electron_1.remote.getCurrentWindow().webContents.id);
console.log(electron_1.remote.getCurrentWindow().id);
let electronThread = new et.ElectronThread({
    module: require.resolve('./renderer.thread')
});
let test = async () => {
    return new Promise((resolve, reject) => {
        let promises = [];
        for (var i = 0; i < 10; i++) {
            let r = electronThread.run({
                method: 'getProcessId',
                parameters: ['#', i + 1]
            });
            promises.push(r);
        }
        console.log(promises);
        Promise.all(promises)
            .then(r => resolve(r))
            .catch(e => reject(e));
    });
};
test()
    .then((e) => { electronThread.end(); console.log(e); })
    .catch(err => console.log(err));
//# sourceMappingURL=renderer.js.map