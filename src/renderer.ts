// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

import { ElectronThread } from "./lib/electron-thread";

let electronThread = new ElectronThread({
    module: require.resolve('./renderer.thread')
});

let test = async () => {
    return new Promise((resolve, reject) => {
        let promises: Promise<string> [] = [];
        for (var i = 0; i < 10; i++) {
            let r = electronThread.run<string>({
                method: 'getProcessId',
                parameters: ['#', i + 1]
            });
            promises.push(r);
        }
        console.log(promises);
        Promise.all(promises)
        .then(r => resolve(r))
        .catch(e => reject(e));
    })
}

test()
.then((e) => { electronThread.end(); console.log(e); })
.catch(err => console.log(err));

