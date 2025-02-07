import cart from "../../behaviors/cart";
import {getEnterOptions} from "@utils/index";
import { RECEIVER_ADDRESS } from "../../const/index";

Page({
    behaviors:[cart],
    //页面加载完成触发，一个页面只会调用一次
    onLoad(options) {
        getEnterOptions(options)
          .then((query) => this.setData({query}))
    },
    //页面显示/切入前台时触发
    onShow() {
      if (wx.getStorageSync(RECEIVER_ADDRESS)) {
        wx.removeStorageSync(RECEIVER_ADDRESS)
       }
        this.getCartList()
    },
});
