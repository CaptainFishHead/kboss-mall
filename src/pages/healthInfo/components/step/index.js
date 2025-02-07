Component({
  properties: {
    // 每步的文字
    stepText: {
      type: String,
      value: '',
    },
    // 第几步
    stepNum: {
      type: String,
      value: '',
    },
    // 是否当前步骤
    isActive: {
      type: Boolean,
      value: false,
    },
    // 是否显示右箭头
    isShowArrow: {
      type: Boolean,
      value: true,
    },

  },
  data: {

  },
  methods: {

  }
})