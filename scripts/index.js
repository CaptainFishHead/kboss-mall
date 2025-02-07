const path = require('path')
const ci = require('miniprogram-ci');
const updateFile = require("./update.env")
const {projectPath} = require("./utils");
const {updateJSONFile, updateVersion, gitCommitPackageFile} = require("./update.version");

const appid = process.env.APP_ID
const version = updateVersion()
try {
  updateJSONFile('project.config.json', {appid})
} catch (err) {
  console.error('更新packege version 失败', err)
  process.exit()
}
console.log(`构建小程序${process.env.APP_ID}版本：`, version)

const buildAndUpload = () => {
  ;(async () => {
    try {
      const project = new ci.Project({
        appid: appid,
        type: 'miniProgram',
        projectPath,
        // privateKey:'268c92ff4c6a6a03f344fbe48ea5e26a',
        privateKeyPath: path.resolve(__dirname, `private.${appid}.key`),
        ignores: ['node_modules/**/*', 'scripts/**/*']
      })
  
      // let packResult = await ci.packNpmManually({
      //   packageJsonPath: path.resolve(projectPath, './package.json'),
      //   miniprogramNpmDistDir: path.resolve(projectPath, './src/'),
      // })
      //
      // console.log('pack done, packResult:', packResult)
      //
      // const warning = await ci.packNpm(project, {
      //   ignores: ['pack_npm_ignore_list'],
      //   reporter: (infos) => {
      //     console.log(infos)
      //   }
      // })
      //
      // console.warn(warning)
      
      const uploadResult = await ci.upload({
        project,
        version,
        robot: process.env.BASE_API === 'pro' ? 2 : 1,
        desc: `${process.env.BASE_API}自动化部署`,
        setting: {
          es6: true,
          es7: true,
          minify: true,
          autoPrefixWXSS: true
        },
        onProgressUpdate: console.log,
      })
      gitCommitPackageFile()
      console.log(uploadResult)
      
    } catch (err) {
      console.error('失败', err)
      process.exit()
    }
  })()
}
updateFile(`src/config/api.ts`)
  .then(() => {
    buildAndUpload()
  })
  .catch(err => {
    console.error(err)
  })

