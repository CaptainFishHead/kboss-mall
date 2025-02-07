// components/order/doctor-appttime/index.ts
import { getDoctorSchedule } from "@models/healthConsultModel";
import { hideToast, showToast } from "@components/toast/index";
import {  TOAST_TYPE } from "@const/index";

Component({
  externalClasses: ["time-class"],

  /**
   * 组件的属性列表
   */
  properties: {

  },
  /**
   * 组件的初始数据
   */
  data: {
    scheduleData: [], // 全部数据
    dates: [],  // 日期展示数据
    times: [], // 当前展示的时间数据
    selectedDate: '', // 当前选中日期
    selectedDateIndex: 0, // 用来解决横向滚动定位 直接用selectedDate不起作用
    selectedTime: '', // 当前选中的日期
    selectedTimeId: '', // 当前选中的时间ID
    startTime: '', // 起始时间戳
    endTime: '' // 结束时间戳
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 初始化可约时间数据
    initData({doctorId, scheduleId}){
      return new Promise((resolve) => {
        showToast({ type: TOAST_TYPE.LOADING })
        getDoctorSchedule({
          doctorId
        }).then(({result}) => {
          hideToast()
          resolve(result.schedules || []);
          const dates = result.schedules.map(item => item.date);
          this.setData({scheduleData: result.schedules, dates})
          if (scheduleId) return this.onTimeChange(scheduleId);
          const firstTime = result.schedules?.[0]?.times || [];
          this.setData({
            times: firstTime || '',
            selectedDate: result.schedules?.[0]?.date || '',
            selectedDateIndex: 0,
            selectedTimeId: firstTime?.[0]?.scheduleId ||'',
            startTime: firstTime?.[0]?.tmBegin || '',
            endTime: firstTime?.[0]?.tmEnd || '',
            selectedTime: `${firstTime?.[0]?.scheduleStartTime}-${firstTime?.[0]?.scheduleEndTime}`
          }, () => {
            this.sendDataToParent()
          })
        }).catch((err) => {
          showToast({
            title: err.msg || '暂无消息',
            type: TOAST_TYPE.WARNING
          })
        })     
      })
    },

    // 日期切换
    onDateChange(e){
      const { item:currDate, index } = e.target.dataset;
      const times = this.data.scheduleData.find(item => item.date === currDate)?.times;
      this.onTimeChange(times?.[0]?.scheduleId)
    },

    // 点击时间段切换
    handleTime(e){
      const { id } = e.target.dataset;
      this.onTimeChange(id)
    },

    // 监听时间段切换
    onTimeChange(_timeId){
      const {date, times, startTime, endTime, scheduleStartTime, scheduleEndTime, index} = this.data.scheduleData.find((item, index) => {
        const time = item.times.find(unit => unit.scheduleId === _timeId);
        if (time){
          item.startTime = time.tmBegin;
          item.endTime = time.tmEnd;
          item.scheduleStartTime = time.scheduleStartTime;
          item.scheduleEndTime = time.scheduleEndTime;
          item.index = index;
          return item;
        };
      }) || {};
      wx.nextTick(() => {
        this.setData({
          selectedDate: date, selectedDateIndex: index,  selectedTime: `${scheduleStartTime}-${scheduleEndTime}`, selectedTimeId: _timeId, times, startTime, endTime
        }, () => {
          this.sendDataToParent()
        })
      })
    },
     
    // 向父组件返回数据
    sendDataToParent() { 
      const {selectedTimeId, selectedDate, startTime, endTime, selectedTime} = this.data;
      this.triggerEvent('childEvent', { selectedTimeId, selectedDate,  startTime, endTime, selectedTime });  
    }  
  }
})