const updateFile = require("./update.env")
const { updateJSONFile } = require("./update.version");
updateFile(`src/config/api.ts`).then(() => {
  console.log('修改环境成功')
})
const appid = process.env.APP_ID
updateJSONFile(`project.config.json`,{appid})