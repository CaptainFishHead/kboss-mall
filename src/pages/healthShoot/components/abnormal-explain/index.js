

Component({
  properties: {
    indicatorList: {
      type: Array,
      value: []
    },
    metricsPanels: {
      type: Object,
      value: {}
    }
  },
  options: {
    styleIsolation: "apply-shared",
    virtualHost: true,
    multipleSlots: true,
  },
  data: {
    outlier: 0,  //异常指标
  },
  observers: {
    // 监听initialData属性的变化
    'indicatorList': function (newVal) {
      let filteredObjects = newVal.filter(obj => obj.indexLevel !== 0)
      let count = filteredObjects.length
      this.setData({
        outlier: count || 0
      });
    }
  },

  methods: {
    handleShowAll () {
      wx.navigateTo({
        url: '/pages/chatai/index?from=health',
      })
    },
  },
});
