Component({
  properties: {},
  data: {
    totalNum: 200,
    remark: '',
    isContentFocus: true,
    isInputContentFocus: false,
    isFocus: false
  },
  methods: {
    bindinputDes(event) {
      let {totalNum} = this.data
      let {value} = event.detail
      value = value.replace(/\s+/g, '') || ''
      if (value && value.length > totalNum) {
        value = value.substr(0, totalNum)
      }
      this.setData({remark: value})
      this.triggerEvent('bindinputdes', {remark:value})
    },
    bindContentFocus(e) {
      this.setData({
        isFocus: true,//触发焦点
        isInputContentFocus: true,
        isContentFocus: false, //聚焦时隐藏内容文本标签
      })
    },
    bindContentBlur(e) {
      this.setData({
        isFocus: false,//触发焦点
        isInputContentFocus: false,
        isContentFocus: true, //聚焦时隐藏内容文本标签
      })
    },
  }
});
