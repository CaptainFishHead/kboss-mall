const package = require('./../package.json')
const {getFileContentStr} = require("./utils");
const fs = require("fs");
const {exec} = require('child_process');

function updateJSONFile(filePath, params) {
  try {
    console.log(`正在读取 ${filePath} 计划修改：`, params)
    const readStr = getFileContentStr(filePath)
    const readJSON = JSON.parse(readStr)
    for (let [key, value] of Object.entries(params)) {
      readJSON[key] = value
    }
    console.log(`读取  ${filePath} 成功，正在更新  ${filePath}`)
    fs.writeFileSync(filePath, JSON.stringify(readJSON, null, 2), 'utf-8')
    console.log(`更新 ${filePath} 成功`)
  } catch (e) {
    console.error(`更新 ${filePath} 失败`, e)
    process.exit()
  }
}

function updateVersion() {
  const env_version = process.env.BASE_API
  let [big, middle, small] = (env_version === 'pro' ? package.version : package.trialVersion).split('.')
  big = parseInt(big, 10)
  middle = parseInt(middle, 10)
  small = parseInt(small, 10)
  if (small === 9) {
    small = 0
    middle += 1
  }
  if (middle === 9) {
    middle = 0
    big += 1
  }
  const _version = [big, middle, small].join('.')
  updateJSONFile(`package.json`, env_version === 'pro' ? {version: _version} : {trialVersion: _version})
  return _version
}

function gitCommitPackageFile(version) {
  // exec(`git commit ./package.json -m ${version}`)
  // exec(`git push ./package.json -m ${version}`)
}

module.exports = {
  updateVersion, updateJSONFile, gitCommitPackageFile
}