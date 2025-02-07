import {getEnterOptions} from '@utils/index'
import cart from "../../../behaviors/cart";

Page({
    behaviors:[cart],
    //页面加载完成触发，一个页面只会调用一次
    onLoad(options) {
        getEnterOptions(options)
            .then((query) => this.setData({query}))
    },
    //页面显示/切入前台时触发
    onShow() {
        this.getCartList()
    },
});
