// pages/commission/date-picker/index.js.js
Component({
    /**
     * 组件的初始数据
     */
    data: {
        // 是否显示时间选择器
        visible: false,
        // 所有年份数组
        years: [], 
        // 所有月份数据
        months: [],
        // 当前选中的时间索引 [0,0]
        pickerIndex: [], 
        // 最终选中的时间的索引 [0,0]
        resultDateIndex: []
    },
    ready(){
        this.getYears();
        wx.nextTick(()=> {
            const {years, months} = this.data;
            this.setData({
                pickerIndex: [ years.length-1, months.length-1 ]
            }, () => {
                this.onCompleted();
            });
        })
    },
    /**
     * 组件的方法列表
     */
    methods: {
        onchange({detail}){
            const {value} = detail;
            const {pickerIndex} = this.data;
            if(value[0] !== pickerIndex[0]) this.getMonths(value[0]);
            this.setData({pickerIndex: value});
        },
        // 获取年份数组
        getYears(){
            let currentTime = new Date();
            let startYear = 2021;
            let endYear = currentTime.getFullYear();
            let years = [];
            while (endYear >= startYear) {
                years.push(`${startYear}年`);
                startYear++;
            }
            this.setData({years});
            this.getMonths(years.length-1); // 获取月份
        },
        // 获取月份数组
        getMonths(yIndex){
            const {years} = this.data;
            const selectedYear = years[yIndex];
            const currentTime = new Date();
            const currentYear = currentTime.getFullYear();
            const currentMonth = currentTime.getMonth()+1;
            let startMonth = 0;
            let endMonth = parseInt(selectedYear) === currentYear ? currentMonth : 12;
            let months = [];
            while (endMonth > startMonth) {
                months.push(`${startMonth+1}月`);
                startMonth++;
            }
            this.setData({months});
        },
        // 打开时间选择器
        openDatePicker(){
            this.setData({visible: true});
        },
        // 关闭时间选择器
        closeDatePicker() {
            this.data.visible && this.setData({visible: false});
        },
        // 点击时间选择器完成按钮
        onCompleted() {
            const {years, months, pickerIndex} = this.data;
            const year = parseInt(years[pickerIndex[0]]);
            const month = parseInt(months[pickerIndex[1]]);
            const currentDate =  `${year}/${month}/1`;
            this.setData({
                resultDateIndex: pickerIndex
            }, () => {
                this.closeDatePicker();
                this.triggerEvent('change', {chooseDate: currentDate})
            });
        }
    },
    observers: {
        "visible"(visible){
            if(visible) {
                const {resultDateIndex} = this.data;
               this.setData({pickerIndex: resultDateIndex});
            }
        }
    }
})
