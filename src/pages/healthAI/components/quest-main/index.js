Component({
  properties: {
    dataCode: {
      type: Object,
      value: {},
    },
    dataIndex: {
      type: Number,
      value: 0
    },
    dataAll: {
      type: Array,
      value: [],
    }
  },
  options: {
    // 在组件定义时的选项中启用多slot支持
    // multipleSlots: true,
    styleIsolation: 'apply-shared',
    // virtualHost: true
  },
  observers: {
    'dataIndex': function (label) {
      wx.nextTick(() => {
        this.initData(label, this.properties.dataCode)
      })
    }
  },
  data: {},
  methods: {
    initData(testIndex, testData) {
      const {
        questionType
      } = testData
      if (testIndex) {
        this.setData({
          questionType: questionType,
          testIndex: testIndex,
          testData: testData
        })
      }
    },
    handleQuestion(data){
      this.triggerEvent('updateData', {
        ...data.detail
      })
    },
  }
})