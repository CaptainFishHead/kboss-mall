Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Object,
      value: []
    },
    current: {
      type: Number,
      value: 0
    },
    skinList: {
      type: Object,
      value: []
    },
    tip: {
      type: String,
      value: ''
    },
    bgType: {//背景的类型，0默认图片，1视频
      type: Number,
      value: 0
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    left: 0,
    systemInfo:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //金刚区滑动事件,这里主要实现的是进度条跟随导航滚动
    scroll(event) {
      let systemInfo=this.data.systemInfo
      if(!systemInfo){
        wx.getSystemInfo({
          success: res => {
            systemInfo=res
            this.setData({
              systemInfo:res
            })
          }
        })
      }
      let scrollLeft = event.detail.scrollLeft; //当前滚动的距离
      // let scrlloWidth = event.detail.scrollWidth - 398;
      let scrlloWidth = event.detail.scrollWidth; //元素的总长度
      let windowWidth=systemInfo.windowWidth//屏幕的宽度
      let s = (scrollLeft) / (scrlloWidth-windowWidth) //当前滚动条占总滚动的百分比
      if(s>1)s=1
      if(s<0)s=0
      let bar=170//背景标识条总长度
      let inBar=50//标识条的长度
      let left = (bar - inBar) * s
      this.setData({
          left, //模拟滑块滑动，相对背景块的宽度
      })
    },
    handleClick(e) {
      let item = e.currentTarget.dataset.item
      let index = e.currentTarget.dataset.index
      this.triggerEvent('selectItem', {
        index,
        item
      })
    }
  }
})