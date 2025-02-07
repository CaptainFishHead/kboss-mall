/**
 * 目的：解决每次切换页面都加载字体，以及字体包太大导致加载缓慢出现闪烁问题
 * 解决思路：
 * 1、首次访问通过代码把字体文件下载并存储到本地
 * 2、然后每次加载字体时从本地读取并转为base64格式进行加载（转base64的原因为下载下来的文件后缀非ttf而是html）
 * 优点：这样就可以保证只在用户第一次下载小程序时加载远端字体，以后每次打开都读取本地字体，同时也解决了文字闪烁问题
 * _downloadFont 下载字体
 * _loadFontFace 加载字体
 * loadCloudFontFace 智能判断字体从本地还是云端加载
 */


// 建议循环调用方法，而不是这个方法内循环下载
// 下载字体文件，注意要把字体域名加到后台downloadFile白名单中
function _downloadFont(fontUrl, filePath, fontFamily) {
  wx.downloadFile({
    url: fontUrl,
    success: res => {
      wx.getFileSystemManager().saveFile({ // 下载成功后保存到本地
        tempFilePath: res.tempFilePath,
        filePath,
        success: res => {
          // 加载字体
          _loadFontFace(fontFamily, res.savedFilePath)
        }
      })
    }
  })
}
// 加载文件字体转 base64，load
function _loadFontFace(fontFamily, filePath) {
  // 读文件
  wx.getFileSystemManager().readFile({
    filePath, // 本地文件地址
    encoding: 'base64',
    success: res => {
      wx.loadFontFace({
        global: true, // 是否全局生效
        // scopes: ['webview', 'native'], //native可能有点问题
        family: fontFamily, // 字体名称
        source: `url("data:font/ttf;charset=utf-8;base64,${res.data}")`,
        success(res) {
          console.log(fontFamily + '加载成功：' + res.status)
        },
        fail: function (res) {
          console.log(fontFamily + '加载失败' + res)
        },
      })
    }
  })


}
// fontUrl: 字体地址
// filename: 存储文件路径
// fontFamily: css 中字体的 family
export function loadCloudFontFace(fontUrl, filename, fontFamily) {
  const filePath = `${wx.env.USER_DATA_PATH}/${filename}`
  wx.getFileSystemManager().access({
    path: filePath,
    success: () => {
      // 从本地加载了字体
      _loadFontFace(fontFamily, filePath)
    },
    fail: () => {
      // 从服务器加载字体
      _downloadFont(fontUrl, filePath, fontFamily)
    }
  })
}