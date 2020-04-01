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
    module: require.resolve('./renderer.worker'),
    options: {
        maxCallTime: 500
    }
});
let test = async () => {
    for (var i = 0; i < 10; i++) {
        try {
            let r = await electronThread.run({
                method: 'getResponseAfter',
                parameters: [1000]
            });
            console.log(r);
        }
        catch (err) {
            console.log(err);
        }
        // r
        // .then(r => console.log(r))
        // .catch(e => console.log(e));
    }
};
let test2 = () => {
    let r = electronThread.run({
        method: 'getResponseAfter',
        parameters: [15000]
    });
    r
        .then(r => console.log(r))
        .catch(e => console.log(e));
};
test();
//test2();
//# sourceMappingURL=renderer.js.map