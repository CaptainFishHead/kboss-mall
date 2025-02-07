// pages/poster/index.js
import {getPoster} from "@models/commonModels";
import {showToast, hideToast} from "../../components/toast/index";
import {TOAST_TYPE} from "../../const/index";
import {wxFuncToPromise} from "../../utils/wxUtils";
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    posterType: 1, // 海报类型：1: 图文海报 2: 分享码
    posterImage: '',
    shareFriendInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      // 页面传递参数
		const eventChannel = this.getOpenerEventChannel()
      eventChannel.on('shareData', ({type, shareParams, title, path, imgUrl}) => {
        this.setData({
          posterType: type,
          shareFriendInfo: {
            title,
            path,
            imageUrl: imgUrl
          }
        });
        this.createPosterImg(shareParams);
      })
  },

  /* 生成海报 */
  createPosterImg(posterJson){
    showToast({type: TOAST_TYPE.LOADING});
    getPoster({datas: posterJson})
      .then(({result}) => {
        hideToast();
        if(result.length) {
          this.setData({posterImage: result[0]});
        }
      })
  },
  // 保存到相册
  shareToFriend() {
    wxFuncToPromise(`downloadFile`, {url: this.data.posterImage})
    .then(({tempFilePath}) => {
      wxFuncToPromise(`showShareImageMenu`, {path: tempFilePath})
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const {shareFriendInfo} = this.data;
    if (shareFriendInfo) {
      console.log(1111, shareFriendInfo)
			return shareFriendInfo
		} else {
			return app.globalData.shareInfo
		}
  }
})