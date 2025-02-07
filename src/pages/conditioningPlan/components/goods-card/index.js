import { GOODS_SUGGEST_BUTTON_TEXT_STYLE } from '@const/index'
Component({
  
  /**
   * 组件的属性列表
   */
  properties: {
    goodItem:{
      type: Object,
      value: {}
    }
  },
  observers: {
		"goodItem" (newValue) {
      const { TXT, CLASSNAME } = GOODS_SUGGEST_BUTTON_TEXT_STYLE[newValue.type]
      let leftTxt, rightTxt
      switch (this.data.goodItem.type) {
        case 0:
          leftTxt = '￥'
          rightTxt = this.data.goodItem.productBriefVO?.salePrice
          break;
        case 1:
          if(this.data.goodItem.contentType == '3'){
            leftTxt = ''
            rightTxt = ""
          }else {
            leftTxt = '点赞'
            rightTxt = this.data.goodItem.productBriefVO?.likeNum
          }
          break;
        case 2:
          leftTxt = '￥'
          rightTxt = this.data.goodItem.productBriefVO?.salePrice
          break;
      
        default:
          break;
      }
      const cardDate = { ...this.data.goodItem, btnName: TXT, className: CLASSNAME, leftTxt, rightTxt }
      let url
      if(newValue.type === 2){
        url = `/pages/product/index?spuId=${newValue.contentId}&skuId=none`
      }else if(newValue.type === 1){
        if (newValue.contentType == 1) {
          // 图文种草
          url = `/pages/recommend/graphicDetail/index?id=${newValue.contentId}`;
        } else if (newValue.contentType == 2) {
          // 视频种草
          url = `/pages/recommend/videoDetail/index?id=${newValue.contentId}`;
        } else if (newValue.contentType == 3) {
          // 直播种草
          url = `/pages/live/player/index?roomId=${newValue.contentId}`;
        }
      }
      this.setData({ cardDate, url })
		}
	},
  /**
   * 组件的初始数据
   */
  data: {
    cardDate: {},
    url: ''
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    navigateToGoodsDetails(e){
      const { url } = this.data
      wx.navigateTo({url})
    }
  }
})
