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
    }
  },
  data: {
    optionNodes: [],
    filterOptionNodes: [],
    answerStatus: false,
    //===============================================
    years: [],
    months: [],
    days: [],
    year: 0,
    month: 0,
    day: 0,
    askLink: { year: null, month: null, day: null }, // 默认值/回显: 有值显示，否则当前时间
    value: [0, 0, 0], // 跟随askLink控制显示下标
    yIndex: 0, // 年下标
    mIndex: 0, // 月下标
    dIndex: 0, // 日下标
    isShow:false
  },
  methods: {
    initData(testIndex, testData) {
      const { year, month, day } = this.data.askLink;
      let nowYear, nowMonth, nowDay;
      const date = new Date();
      if (year != null && month != null && day != null) {
        nowYear = year
        nowMonth = month
        nowDay = day
      } else {
        nowYear = String(date.getFullYear());
        nowMonth = String(date.getMonth() + 1).padStart(2, '0');
        nowDay = String(date.getDate()).padStart(2, '0');
      }
      let { years = [], months = [], days = [] } = this.data;
      years = [];
      months = [];
      for (let i = 1950; i <= parseInt(nowYear, 10) + 31; i++) {
        years.push(String(i));
      }
      for (let i = 1; i <= 12; i++) {
        months.push(String(i).padStart(2, '0'));
      }
      wx.nextTick(() => {
        this.setData({
          years: years,
          months: months,
          year: nowYear,
          month: nowMonth,
          day: nowDay,
          isShow: false
        });
        this.getMonth(nowYear, nowMonth, nowDay)
      })
    },
    getMonth(year, month, day) {
      let daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      let dayNum = 0;
      if (month === 2) {
        dayNum = ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0) ? 29 : 28;
      } else {
        dayNum = daysInMonth[month - 1];
      }
      let days = [];
      for (let i = 1; i <= dayNum; i++) {
        days.push(String(i).padStart(2, '0'));
      }
      this.setData({
        days: days,
        day: day,
        askLink: [year, month, day],
      })
      let yearIdx = parseInt(JSON.stringify(this.data.years.findIndex(v => v === year)), 10);
      let monthIdx = parseInt(JSON.stringify(this.data.months.findIndex(v => v === month)), 10);
      let dayIdx = parseInt(JSON.stringify(this.data.days.findIndex(v => v === day)), 10);
      wx.nextTick(() => {
        this.setData({
          yIndex: yearIdx,
          mIndex: monthIdx,
          dIndex: dayIdx,
          value: [yearIdx, monthIdx, dayIdx],
        })
      })
    },
    bindChange(e) {
      const valIndex = e.detail.value;
      const year = this.data.years[valIndex[0]];
      const month = this.data.months[valIndex[1]];
      const day = this.data.days[valIndex[2]];
      this.setData({
        yIndex: valIndex[0],
        mIndex: valIndex[1],
        dIndex: valIndex[2],
      })
      this.getMonth(year, month, day);
    },

    handleEmit() {
      // console.log(this.data.value, this.data.askLink);
    },
  },
})