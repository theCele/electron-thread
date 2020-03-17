# Electron Thread

**Electron workers using BrowserWindow headless window**

This package allows you to use multithreading in Electron. This type of multithreading allows you to use [NODE JS API](https://nodejs.org/docs/latest/api/) and [Electron API](https://www.electronjs.org/docs/api)

## Install

```bash
npm install --save electron-thread
```

In you Electron start file import
main.js
```bash
import 'electron-thread';
```

## Example

In you Electron start file import
main.js
```bash
import 'electron-thread';
```

Given a file in renderer, child.thread.js:

```bash
# Import the ThreadExport class
import { ThreadExport } from "electron-thread";

# Write your methods
function getProcessId(paramOne, paramTwo) {
    return `${paramOne}:${paramTwo} ${process.pid}`;
}

# Register your methods
ThreadExport.export({
    getProcessId: getProcessId
});
```

And a renderer file where we call:

```bash
# Import the ElectronThread class
import { ElectronThread } from "electron-thread";

# initialise using your relative path to child.thread.js and resolve the path with require.resolve()
let electronThread = new ElectronThread({
    module: require.resolve('./child.thread')
});

let test = async () => {
    return new Promise((resolve, reject) => {
        let promises = [];
        for (var i = 0; i < 100; i++) {
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
    })
}

test()
.then((e) => { electronThread.end(); console.log(e); })
.catch(err => console.log(err));
```

We'll get an output something like the following:

```bash
"#:1 13560"
"#:2 21980"
"#:3 21868"
"#:4 22712"
"#:5 2476"
"#:6 15936"
"#:7 19140"
"#:8 14928"
"#:9 12992"
"#:10 22132"
```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## API

The module classe ElectronThread has two methods run(options) and end()

Class ElectronThread
```bash
let thread = new ElectronThread({
    module: require.resolve('relative path to the child thread')
})
```

ElectronThread.run(options) : Promise<any>. It launches the method and returns a promise
```bash
let options = {
    method: 'someMethod', //method name from the exported from child thread
    parameters: ['#', i + 1] // method parameters
}
thread.run(options)
.then((result) => console.log(result))
.catch((err) => console.log(err))
```
ElectronThread.end() : Promise<void>. It ends all active processes

### Inspiration

- [worker-farm](https://www.npmjs.com/package/worker-farm) - Worker Farm
- [workerpool](https://www.npmjs.com/package/workerpool) - Workerpool