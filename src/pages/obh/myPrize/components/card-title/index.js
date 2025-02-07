Component({
  data: {
  },
  properties: {
    imgUrl: {
      type: String,
      value: ''
    },
    des: {
      type: String,
      value: ''
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
    init() {}
  }
})

