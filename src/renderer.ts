// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
import * as path from 'path';
import * as et from "./index";
import { remote } from 'electron';

let packagePath = null;
const searchPaths = ['app', 'app.asar', 'default_app.asar']
for (packagePath of searchPaths) {
  try {
    packagePath = path.join(process.resourcesPath, packagePath)
    break
  } catch (error) {
    continue
  }
}

console.log(packagePath);

console.log(remote.getCurrentWindow().webContents.id);
console.log(remote.getCurrentWindow().id);

let electronThread = new et.ElectronThread({
    module: require.resolve('./renderer.worker'),
    options: {
      maxCallTime: Infinity
    }
});

let test = async () => {
  let start = new Date();
  console.log(start.getMilliseconds());
  for (var i = 0; i < 50; i++) {
    try {
      electronThread.run<string>({
        method: 'getProcessId',
        parameters: ['#', i]
      })
      .then(r => {
        console.log(r);
        console.log((new Date()).getMilliseconds());
      })
      .catch(r => console.log(r))
      //console.log(r);
    } catch(err) {
      console.log(err);
    }
      
      // r
      // .then(r => console.log(r))
      // .catch(e => console.log(e));
  }
}

let test2 = () => {
  let r = electronThread.run<string>({
    method: 'getResponseAfter',
    parameters: [15000]
  });
  r
  .then(r => console.log(r))
  .catch(e => console.log(e));
}

test();
//test2();


