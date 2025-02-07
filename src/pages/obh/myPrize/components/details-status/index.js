Component({
  data: {
    pressScale: '0%', // 进度比例
    pressIndex: 0 // 进度索引
  },
  properties: {
    // 进度状态码
    pressStatus: {
      type: Number,
      value: 1,
      observer(val) {
        this.init()
      }
    },
    // 状态列表
    pressList: {
      type: Array,
      value: [{
        name: '已中奖',
        status: 1
      },{
        name: '待兑奖',
        status: 2
      },{
        name: '兑奖中',
        status: 3
      },{
        name: '已兑奖',
        status: 4
      }],
      observer(val) {
        this.init()
      }
    }
  },
  pageLifetimes:{
    show() {
      // 页面被展示
      // this.init()
    }
  },
  lifetimes: {
    ready () {
      this.init()
    },
  },
  methods: {
    // 计算获取 进度比例和进度索引
    init() {
      // 找到进度所在索引
      let index = this.data.pressList.findIndex(item => item.status === this.data.pressStatus)
      // 计算出单位分段的长度比例（按照节点分段，每一段的比例） 例如4个节点就是3段，每一段的比例就是1/3
      let dis = 1 / (this.data.pressList.length - 1)
      // 根据进度index，计算出当前节点的进度比例，由于UI向前突出单位长度的二分之一，所以加上单位分段的二分之一, 最后一项不需要加
      let pressScale = index / (this.data.pressList.length - 1) >= 1 ? 1 : index / (this.data.pressList.length - 1) + dis / 2
      this.setData({pressScale: (pressScale * 100).toFixed() + '%', pressIndex: index})
    }
  }
})

