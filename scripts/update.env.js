const path = require('path')
const fs = require('fs')
const {getFileContentStr, projectPath} = require("./utils");

const env_version = process.env.BASE_API

const env_config_str = getFileContentStr(`scripts/env.config/${env_version}.json`)

function updateFile(filename) {
  // 写入文件是异步过程，需要使用promise保证文件操作完成
  return new Promise(resolve => {
    let str = path.join(projectPath, `${filename}`);
    fs.writeFile(str, `export default ${env_config_str}`, "utf-8", function (err) {
      if (err) {
        throw new Error("写入数据失败");
      } else {
        resolve()
      }
    });
  })
}

module.exports = updateFile