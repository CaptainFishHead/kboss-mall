Component({
  /**
   * 组件的属性列表
   */
  properties: {
    min: {
      type: Number,
      value: 0,
    },
    max: {
      type: Number,
      value: 0,
    },
    value: {
      type: Number,
      value: 0,
      observer(val) {
        let currValue = val;
        if (val) {
          const valArr = val.toString().split(".");
          if (valArr.length === 2) {
            currValue = val.toFixed(2);
          }
        }
        this.setData({ currValue });
      },
    },
  },

  ready() {
    this.update();
  },

  /**
   * 组件的初始数据
   */
  data: {
    spacing: 0,
    currValue: 0,
    // isLimitType: 0 // 是否查处限制 0:正常值 1:超出最小限制 2:超出最大限制
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update() {
      const { min, max, currValue } = this.data;
      var query = wx.createSelectorQuery().in(this);
      query
        .selectAll(".progress-bar, .progress, .num")
        .boundingClientRect(data => {
          if (data) {
            const progressBar = data[0].width; // 整个进度条的宽度
            const progressWidth = data[1].width; // 正常区域的宽度
            const numWidth = data[2].width + 24; // 数字的宽度+箭头的宽度
            const offsetLeftMax = (progressBar - progressWidth) / 2; // 获取左右两边红色区域的宽度
            const valueRatio = progressWidth / (max - min); // 正常区每一份的宽度
            const progressRatio = valueRatio * (currValue - min); // 标记点位置
            let valueLimt = 0;
            if (progressRatio > progressWidth + offsetLeftMax - numWidth) {
              valueLimt = progressWidth + offsetLeftMax - numWidth / 2;
            } else if (progressRatio <= -offsetLeftMax + numWidth) {
              valueLimt = -offsetLeftMax + numWidth / 2;
            } else {
              valueLimt = progressRatio;
            }
            this.setData({ spacing: valueLimt });
          }
        })
        .exec();
    },
  },
});
