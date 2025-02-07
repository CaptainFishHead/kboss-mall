const path = require('path')
const fs = require('fs')

const projectPath = path.resolve(process.cwd(), './')

function getFileContentStr(filePath) {
  const env_config_path = path.resolve(projectPath, filePath)
  return fs.readFileSync(env_config_path, 'utf-8')
}

module.exports = {
  projectPath, getFileContentStr
}