import { queryLotteryResultCongratulate, queryLotteryResultRay } from '../pages/obh/models/obh'

export const LOTTERY_RESULT_RAY = "LOTTERY_RESULT_RAY"
export const LOTTERY_RESULT_CONGRATULATE = "LOTTERY_RESULT_CONGRATULATE"
export const LOTTERY_RESULT_SINGULARITY = 'LOTTERY_RESULT_SINGULARITY'   

export function downloadLotteryGifs() {
  // wx.downloadFile({
  //   url: 'https://static.tojoyshop.com/images/obh/lottery/new-lottery/ic-lottery-result-ray.gif',
  //   success(res) {
  //     wx.getFileSystemManager().saveFile({
  //       tempFilePath: res.tempFilePath,
  //       filePath: `${wx.env.USER_DATA_PATH}/${LOTTERY_RESULT_RAY}`,
  //     })
  //   }
  // })

  wx.downloadFile({
    url: 'https://static.tojoyshop.com/images/obh/lottery/new-lottery/ic-lottery-result-congratulate.gif',
    success(res) {
      wx.getFileSystemManager().saveFile({
        tempFilePath: res.tempFilePath,
        filePath: `${wx.env.USER_DATA_PATH}/${LOTTERY_RESULT_CONGRATULATE}`,
      })
    }
  })

  wx.downloadFile({
    url: 'https://static.tojoyshop.com/images/obh/lottery/new-lottery/lottery-result-singularity.gif',
    success(res) {
      wx.getFileSystemManager().saveFile({
        tempFilePath: res.tempFilePath,
        filePath: `${wx.env.USER_DATA_PATH}/${LOTTERY_RESULT_SINGULARITY}`,
      })
    }
  })
}


export function getLotteryGif(filePath, callback) {
  let path = `${wx.env.USER_DATA_PATH}/${filePath}`
  wx.getFileSystemManager().access({
    path,
    success(res) {
      // 读文件
      wx.getFileSystemManager().readFile({
        filePath: path, // 本地文件地址
        encoding: 'base64',
        success(res) {
          callback(`data:image/image/gif;base64,${res.data}`)
        },
        fail(err) {
        }
      })
    }

  })

}