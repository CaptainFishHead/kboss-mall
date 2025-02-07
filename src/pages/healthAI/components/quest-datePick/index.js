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
        this.initData(label, this.data.dataCode)
      })
    }
  },
  data: {
    yearsList: [],
    monthList: [],
    daysList: [],
    defaultDateList: "",
    yIndex: 0,
    mIndex: 0,
    dIndex: 0,
    optionNodes: [],
    filterOptionNodes: [],
    required: false,
    isShow:false
  },
  methods: {
    initData(testIndex, testData) {
      const {
        question: {
          optionNodes = [],
          optionBuilder = {},
          required
        },
        nextSelectors,
        questionCode,
        questionId,
        userOptionValues,
        userOptionKeys
      } = testData || {};
      // 4 => 生日题
      const myDate = new Date();
      const startYears = myDate.getFullYear() - optionBuilder.minValue;
      const endYears = myDate.getFullYear() - optionBuilder.maxValue;
      // 获取默认显示的年月日
      const defaultShowDate = optionBuilder.defaultDate.split("-").map(Number);
      // 获取默认年份
      const defaultDateLists = myDate.getFullYear() - optionBuilder.defaultValue || defaultShowDate[0];
      // 获取当前年
      const currentYears = myDate.getFullYear();
      // 获取当前月
      const currentMonth = defaultShowDate[1];
      // 获取当前月一共多少日
      const currentMonthOfDaysNum = this.getDaysInMonth(defaultDateLists, currentMonth);
      // 获取今日
      const currentMonthOfDay = defaultShowDate[2];
      // 获取年月一共有多少天
      const selectMonthOfDaysNum = this.getDaysInMonth(currentYears, currentMonth);
      // 获取当前日
      const currentDays = defaultShowDate[2];
      // 年月日下拉数据
      const yearsList = Array.from({ length: startYears - endYears + 1 }, (_, index) => index + endYears);
      const monthList = Array.from({ length: 12 }, (_, index) => index + 1);
      const daysList = Array.from({ length: selectMonthOfDaysNum }, (_, index) => index + 1)
      // 根据指针获取年月日份对应的下标
      wx.nextTick(() => {
        // 获取对应的下标
        const defaultYInx = yearsList.indexOf(defaultDateLists)
        const defaultMInx = monthList.indexOf(currentMonth)
        const defaultDInx = daysList.indexOf(currentDays)
        const yIndex = defaultYInx
        const mIndex = defaultMInx
        const dIndex = defaultDInx
        // 作为选择之后回显的逻辑
        const defaultValueData = userOptionKeys || []
        this.setData({
          // 如果未选择，则获取当前默认数据，否则用已选择的数据进行回显
          defaultDateList: defaultValueData.length > 0 ? defaultValueData : [defaultYInx, defaultMInx, defaultDInx],
          yIndex: yIndex,
          mIndex: mIndex,
          dIndex: dIndex
        })
      })
      this.setData({
        required: required,
        optionNodes: optionNodes,
        userOptionKeys: userOptionKeys,
        yearsList: yearsList,
        // 获取月
        monthList: monthList,
        // 获取月中的日
        daysList: daysList,
        isShow: false
      })
    },
    // 获取指定年月当前月一共有几天
    getDaysInMonth(year, month) {
      return new Date(year, month, 0).getDate()
    },
    // change
    bindChange(data) {
      const selectYears = this.data.yearsList[data.detail.value[0]];
      const selectMonth = this.data.monthList[data.detail.value[1]];
      const selectMonthOfDaysNum = this.getDaysInMonth(selectYears, selectMonth)
      // 逆向推算出当前选择的年份至今多少岁
      const myDate = new Date();
      const toYears = myDate.getFullYear();
      const whenYears = toYears - selectYears
      const currentYears = myDate.getFullYear();
      const currentMonth = myDate.getMonth() + 1;
      const lastOfYears = this.data.yearsList[this.data.yearsList.length - 1]
      const monthList = Array.from({
        length: selectYears == lastOfYears ? currentMonth : 12
      }, (_, index) => index + 1);
      // 判断如果选中的是当月，则显示当月的当日，否则显示不同月份一共有多少日
      const currentMonthOfDay = myDate.getDate();
      const daysList = Array.from({
        length: selectYears == lastOfYears && selectMonth == currentMonth ? currentMonthOfDay : selectMonthOfDaysNum
      }, (_, index) => index + 1);
      // 通过推算出来的岁数去过滤符合的区间数据
      const optionNodes = this.data.optionNodes.filter(item => item.startValue <= whenYears && whenYears <= item.endValue);
      this.setData({
        monthList: monthList,
        daysList: daysList,
        filterOptionNodes: optionNodes,
        yIndex: data.detail.value[0],
        mIndex: data.detail.value[1],
        dIndex: data.detail.value[2]
      })
    },
    handleDatePick() {
      const year = this.data.yearsList[this.data.yIndex];
      const month = this.data.monthList[this.data.mIndex] < 10
        ? `0${this.data.monthList[this.data.mIndex]}` : this.data.monthList[this.data.mIndex];
      const day = this.data.daysList[this.data.dIndex] < 10
        ? `0${this.data.daysList[this.data.dIndex]}` : this.data.daysList[this.data.dIndex];
      const selectedData = {
        ...this.properties.dataCode,
        userOptionKeys:[this.data.yIndex, this.data.mIndex, this.data.dIndex],
        userOptionValues:[`${year}-${month}-${day}`],
        selectedRes: {},
        questionTypeName: "birthday",
        answerStatus: true
      }
      // 重新渲染数据 - 更新数据
      this.triggerEvent('updateData', selectedData)
    }
  }
})