Component({
  properties: {
    dataCode: {
      type: Object,
      value: {},
    },
    dataIndex: {
      type: Number,
      value: 0
    }
  },
  observers: {
    'dataIndex': function (label) {
      wx.nextTick(() => {
        this.setData({
          isShow: true
        })
        this.initData(label, this.properties.dataCode)
      })
    },
  },
  data: {
    optionList: [],
    isShow:false
  },
  methods: {
    initData(testIndex, testData) {
      const {question: { options = [] }, userOptionValues} = testData || {};
      if (userOptionValues) {
        options.forEach((item) => {
          item.selected = false
          if (item.optionValue === userOptionValues.join()) {
            item.selected = true
          }
        })
      } else {
        options.forEach((item) => item.selected = false)
      }
      this.setData({
        optionList:options,
        isShow: false
      })
    },
    // 选择项
    handleSelected(data) {
      const { item, index } = data.currentTarget.dataset;
      // 设置选择高亮
      this.data.optionList.forEach((item) => {
        item.selected = false
      })
      this.data.optionList[index].selected = true
      this.setData({
        optionList: this.data.optionList,
      })
      const selectedData = {
        ...this.properties.dataCode,
        userOptionValues:[item.optionValue],
        questionTypeName: "Genger",
        answerStatus: true
      }
      // 重新渲染数据 - 更新数据
      this.triggerEvent('updateData', selectedData)
    }
  }
})