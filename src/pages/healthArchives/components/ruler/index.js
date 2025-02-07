import { addDecimal, debounce, getDecimalPlaces, getImgBoxSize, getDecimalRound } from '@utils/index'
import { hideToast, showToast } from "@components/toast/index";
import { TOAST_TYPE } from "@const/index";

Component({
  properties: {
    minValue: {
      type: Number,
      value: 0
    },
    maxValue: {
      type: Number,
      value: 1
    },
    initialValue: {
      type: Number,
      value: 0
    },
    particle: {
      type: Number,
      value: 1
    },
    digit: {
      type: Number,
      value: 0
    },
    isShow: {
      type: Boolean,
      value: false
    }
  },

  data: {
    scales: [],
    currentValue: 0,
    initialPosition: 0,
    paddingStyle: '',
    rate: 1,
    showScale: '0', //标尺显示动画
    isScrolling: false, // 新增一个齿轮是否正在滚动的状态
  },

  observers: {
    'isShow': async function (newValue) {

      if (!newValue) return
      showToast({ type: TOAST_TYPE.LOADING })
      this.setData({ showScale: '150rpx' })
      this.calcRate()
      const { width } = (await getImgBoxSize('.container-box', this))[0]
      const scales = this.calcScales()
      const paddingStyle = `padding: 20rpx ${width / 2}px 50rpx ${width / 2}px;`
      this.setData({
        scales,
        currentValue: this.data.initialValue,
        initialPosition: this.data.initialValue * 10 / this.data.rate - this.data.minValue * 10 / this.data.rate,
        paddingStyle
      })
      hideToast()
      this.setData({ showScale: '0' })
    },
  },
  methods: {
    calcScales() {
      const scales = []
      let crurrentScale = this.data.minValue
      while (crurrentScale <= this.data.maxValue) {
        scales.push(crurrentScale)
        crurrentScale = addDecimal(crurrentScale, this.data.particle * this.data.rate)
      }
      return scales
    },

    scrollStart(e) {
      this.scroll(e); //----滚动开始前，需单独再调用一次
      this.setData({ isScrolling: true }); //滚动开始
    },
    scrollEnd(e) {
      this.setData({ isScrolling: false }); //滚动结束
      this.scroll(e); //----滚动结束后，需单独再调用一次
    },

    scroll(e) {
      const { scrollLeft } = e.detail
      const { isScrolling, minValue, rate } = this.data;

      if (isScrolling) return; //如果正在滚动，则不再处理新的数据

      const num = scrollLeft / 10 * rate + minValue
      const fixed = getDecimalPlaces(rate)
      const currentValue = num.toFixed(fixed) * 1
      this.setData({ currentValue })
      this.triggerEvent('sendCurrentValue', { value: currentValue })
    },

    calcRate() {
      const { digit } = this.data
      if (!digit) return
      const rate = `0.${'1'.padStart(digit, '0')}` * 1
      this.setData({ rate })
    }

  }
});
