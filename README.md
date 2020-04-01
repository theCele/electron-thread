# Electron Thread

**Electron workers using BrowserWindow headless window**

This package allows you to use multithreading in Electron. This type of multithreading allows you to use [NODE JS API](https://nodejs.org/docs/latest/api/) and [Electron API](https://www.electronjs.org/docs/api)

Note: this module has to be used in the renderer process and the thread to be invoked in the renderer process. Also make sure you register the module in the main module `import 'electron-thread'` and also import `import * as et from "electron-thread"` like this or if you prefer to import classes separetely, you have to register the module as well `import 'electron-thread'`;

## Install

```bash
npm install --save electron-thread
```

## Example

Given a file in renderer, child.worker.js:

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
    module: require.resolve('./child.worker')
});

let test = async () => {
  for (var i = 0; i < 10; i++) {
      let r = electronThread.run<string>({
          method: 'getProcessId',
          parameters: ['#', i + 1]
      });
      r
      .then(r => console.log(r))
      .catch(e => console.log(e));
  }
}

test();
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

## API

Electron thread exports a main method `run(options: IThreadRunOptions)` and an `end()` method. The `run()` method sets up a "thread farm" of coordinated BrowserWindows.

### ElectronThread(options: IThreadLaunchOptions)

#### `options: IThreadLaunchOptions`

If you don't provide an `options` object then the following defaults will be used:

```js
{
    module              : string,
    options             :
                            {
                                windowOptions: BrowserWindowConstructorOptions,
                                maxConcurrentThreads: require('os').cpus().length,
                                maxCallTime: Infinity,
                                maxRetries: 10
                            }
}
```

* **<code>module</code>** You should use an **absolute path** to the module file, the best way to obtain the path is with `require.resolve('./path/to/module')`.

* **<code>options.windowOptions</code>** allows you to customize all the parameters passed to BrowserWindowConstructorOptions. This object supports [all possible options of `BrowserWindowConstructorOptions`](https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions).

* **<code>options.maxConcurrentThreads</code>** will set the number of child processes to maintain concurrently. By default it is set to the number of CPUs available on the current system, but it can be any reasonable number, including `1`.

* **<code>options.maxCallTime</code>** when set, will cap a time, in milliseconds, that *any single call* can take to execute in a worker. If this time limit is exceeded by just a single call then the worker running that call will be killed and any calls running on that worker will have their callbacks returned with a `TimeoutError` (check `err.type == 'TimeoutError'`).

* **<code>options.maxCallTime</code>** allows you to control the max number of call retries after worker termination (unexpected or timeout). By default this option is set to `Infinity` which means that each call of each terminated worker will always be auto requeued. When the number of retries exceeds `maxRetries` value, the job callback will be executed with a `ProcessTerminatedError`.

You initialize electron "thread farm" `let electronThread ElectronThread(options: IThreadLaunchOptions)`.

### electronThread.end()

It will close all threads and won't wait for the task to complete.

### electronThread.run(options: IThreadRunOptions)

#### `options: IThreadRunOptions`

You have to specify the exported method name and the arguments

```js
{
    method              : string,
    parameters          : any []
}
```

### ElectronThread(methods: Object)

In the worker file we export the methods

```js
{
    exportMethodName1   : method1,
    exportMethodName2   : method2,
    exportMethodNameN   : methodN,
}
```

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

### Inspiration

- [worker-farm](https://www.npmjs.com/package/worker-farm) - Worker Farm
- [workerpool](https://www.npmjs.com/package/workerpool) - Workerpool