import { queryMetricsDetails, updateArchiveMetricsToDb } from "@models/healthArchivesModel"
import { hideToast, showToast } from "@components/toast/index";
import { TOAST_TYPE, STORAGE_USER_FOR_KEY, } from "@const/index";
import { track, TrackEventName } from "@utils/sa";
import { formatDate } from "@utils/index";

const date = new Date()
const years = []
const months = []
const days = []
const hours = []
const minute = []

for (let i = 1990; i <= date.getFullYear(); i++) {
  years.push(i.toString())
}

for (let i = 1; i <= 12; i++) {
  months.push(i.toString().padStart(2, 0))
}

for (let i = 1; i <= 31; i++) {
  days.push(i.toString().padStart(2, 0))
}

for (let i = 0; i < 24; i++) {
  hours.push(i.toString().padStart(2, 0))
}

for (let i = 0; i < 60; i++) {
  minute.push(i.toString().padStart(2, 0))
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isDisabledSubmit: true,
    formData: {},
    //picker内容
    pickerOptions: {
      type: -1,
      list: [],
      unit: { 0: '年', 1: '月', 2: '日', 3: '时', 4: '分' },
    },

    currentLength: 0,
    maxLength: 1000,
    showDialog: false,
    currentMetric: null,
    currentFormDate: null,
    //BMI 默认身高体重
    // 1、身高：范围 0-300 厘米，默认值 170
    // 2、体重：范围 0-200 公斤，默认值 60
    sonIndexListBMI: [{
      indexId: "cm",
      indexName: "身高",
      indexData: "",
      indexRange: "[0,300]",
      indexDataType: 1,
      indexUnit: "cm",
    }, {
      indexId: "kg",
      indexName: "体重",
      indexData: "",
      indexRange: "[0,200]",
      indexDataType: 1,
      indexUnit: "kg",
    }],
  },

  getDecimalPlaces(rangeStr) {
    const [lowerValue, upperValue] = rangeStr.slice(1, -1).split(',');
    const decimalPointIndex = lowerValue.toString().indexOf('.')
    if (decimalPointIndex === -1) return 0
    return lowerValue.length - decimalPointIndex - 1
  },

  convertRange(rangeStr, digit) {
    const [lowerValue, upperValue] = rangeStr.slice(1, -1).split(',');
    const rate = digit ? `0.${'1'.padStart(digit, '0')}` * 1 : 0
    const upperBound = rangeStr[rangeStr.length - 1] === ']' ? 0 : digit;
    return upperValue - upperBound
  },

  convertRangeStandard(rangeStr) {
    const lowerBound = rangeStr[0] === '[' ? '≥' : '>';
    const upperBound = rangeStr[rangeStr.length - 1] === ']' ? '≤' : '<';
    const [lowerValue, upperValue] = rangeStr.slice(1, -1).split(',');
    return `${lowerBound}${lowerValue.trim()}；${upperBound}${upperValue && upperValue.trim()}`;
  },

  handlerRecord(e) {
    const { formData, currentMetric } = this.data
    const { type = null, metricid: metricId = null } = e && e.currentTarget && e.currentTarget.dataset || {}
    const metric = currentMetric.sonIndexList.find(metric => metric.indexId === metricId) || {}
    const currentFormDate = !type ? null : {
      type, //1数值 2文本带阴性阳性 3文本
      metricId,
      indexUnit: metric.indexUnit,
      value: formData[metricId],
      title: metric.indexName,
      isPicker: type === -1 || type === 2,
      isHighProtein: type === 3,
    }

    if (currentFormDate && !currentFormDate.isHighProtein && !currentFormDate.isPicker) { //数值
      const rangeStr = metric.indexRange
      currentFormDate.digit = this.getDecimalPlaces(rangeStr)
      currentFormDate.maxValue = this.convertRange(rangeStr, currentFormDate.digit) * 10
      currentFormDate.minValue = metric.indexId === '200' ? -10 : 0 //骨密度 minValue为-10，其他为0

      //单位为 % 的，区间范围为 0-100
      if (metric.indexUnit === '%') {
        currentFormDate.maxValue = 100
      }

      currentMetric.standard = this.convertRangeStandard(metric.indexRange)
      currentMetric.indexUnit = metric.indexUnit
      const [lowerValue, upperValue] = rangeStr.slice(1, -1).split(',')
      const indexRangeArr = JSON.parse(`[${lowerValue}, ${upperValue}]`) //不能直接用JSON.parse(rangeStr)，因为[1,2)可能不是正规数组格式

      //BMI
      if (metric.indexId === 'cm' || metric.indexId === 'kg') { //metric.indexId='cm'身高， metric.indexId='kg'体重
        //BMI指标 尺子默认值：身高默认值 170，体重默认值 60
        formData[currentFormDate.metricId] = formData[currentFormDate.metricId] === '' ? (metric.indexId === 'cm' ? 170 : 60) : formData[currentFormDate.metricId]
      }
      //通用指标 尺子默认值：取中 ---------------（不能直接用 !formData[currentFormDate.metricId]判断，因为0也算一个值，只能是 === ''空 判断）
      formData[currentFormDate.metricId] = formData[currentFormDate.metricId] === '' ? ((indexRangeArr[1] + indexRangeArr[0]) / 2).toFixed(currentFormDate.digit) : formData[currentFormDate.metricId] || 0
    }

    if (currentFormDate && currentFormDate.isPicker) {
      const options = this.updatePickerOptions(currentFormDate.type)
      const tempOptions = currentFormDate.type === 2 ? [currentFormDate.value] : currentFormDate.value && currentFormDate.value.match(/\d+/g) || []
      currentFormDate.value = tempOptions.map((option, index) => options.list[index].indexOf(option.toString()))
    }

    const pickerOptions = this.updatePickerOptions(type)
    const currentLength = formData[metricId] && formData[metricId].length || 0

    this.setData({ currentMetric, currentFormDate, currentLength, pickerOptions, showDialog: !!currentFormDate, formData })
  },

  bindChange(e) {
    const { currentFormDate, formData } = this.data
    const chooseOptions = e.detail.value
    if (currentFormDate.isPicker) {
      const options = this.updatePickerOptions(currentFormDate.type)
      const chooseValue = chooseOptions.map((option, index) => options.list[index][option])
      currentFormDate.value = currentFormDate.type === -1 ? this.formatDateFromArray(chooseValue) : chooseValue[0]
    }
  },

  updatePickerOptions(type) {
    return {
      type,
      list: type === -1 ? [years, months, days, hours, minute] : [['阴性', '阳性']],
      unit: this.data.pickerOptions.unit,
    }
  },

  formatDateFromArray(dateArray) {
    const [year, month, day, hour, minute] = dateArray
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  onSure() {
    const { currentMetric, currentFormDate, formData } = this.data
    this.setData({ formData: { ...formData, [currentFormDate.metricId]: currentFormDate.value } })
    this.handlerRecord()
  },

  onInput(event) {
    const currentFormDate = { ...this.data.currentFormDate, value: event.detail.value }
    const currentLength = currentFormDate.value.length;
    this.setData({ currentFormDate, currentLength });
  },

  handleRuler(e) {
    const { currentFormDate } = this.data
    if (!currentFormDate) return
    this.setData({
      currentFormDate: {
        ...currentFormDate,
        value: e.detail.value
      }
    })
    this.verifyForm() //校验表单

    // console.log('11currentFormDate', { ...currentFormDate, value: e.detail.value })
    // console.log('11formData', this.data.formData)
  },

  async getHealthCurrentMetric(indexId) {
    const { sonIndexListBMI } = this.data
    try {
      showToast({ type: TOAST_TYPE.LOADING })
      const { result: currentMetric } = await queryMetricsDetails({ str: indexId })

      // BMI指标 身高体重不取子集展示，前端强制写死
      if (currentMetric.indexId === '1') {
        const cur = currentMetric.sonIndexList[0]
        const { textReferenceValue } = cur
        const valArr = textReferenceValue && textReferenceValue.split(",") || [] //从左到右顺序为：体重 身高
        sonIndexListBMI[0].indexData = valArr[0]
        sonIndexListBMI[1].indexData = valArr[1]

        //赋值后，再替换写死数据
        currentMetric.sonIndexList = sonIndexListBMI
      }

      const child = currentMetric.sonIndexList[0]
      currentMetric.standard = this.convertRangeStandard(child.indexRange)
      currentMetric.indexUnit = child.indexUnit

      this.setData({ currentMetric })
      this.initFormData(currentMetric)

      hideToast()
    } catch (err) {
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }

    this.setData({ isLoading: false })
  },

  initFormData(currentMetric) {
    const formData = { ['-1']: formatDate(Date.now()).dateTimeMM } || null
    for (let i = 0; i < currentMetric.sonIndexList.length; i++) {
      const e = currentMetric.sonIndexList[i];
      formData[e.indexId] = e.indexData
    }

    this.setData({ formData })
    this.verifyForm() //校验表单
  },

  //校验表单
  verifyForm() {
    const { formData } = this.data
    const isDisabledSubmit = Object.keys(formData).filter(key => key !== '-1').some(key => formData[key] === '') //formData[key]也可以等于 0，所以不能用 非判断
    this.setData({ isDisabledSubmit })
  },

  submitForm() {
    const { formData, currentMetric } = this.data
    const updateData = []
    Object.keys(formData).filter(key => key !== '-1').forEach(key => {
      updateData.push({
        indexId: key,
        indexData: formData[key],
        parentIndexId: currentMetric.indexId,
        createdTime: formData['-1']
      })
    })

    // BMI不取子集展示，前端强制写死 
    let updateDataBMI = []
    if (currentMetric.indexId === '1') {
      updateDataBMI = [{
        ...updateData[0],
        indexId: "1",
        indexData: "",
        heightCm: updateData[0].indexData,
        weightKg: updateData[1].indexData,
      }]
    }

    showToast({ type: TOAST_TYPE.LOADING })
    updateArchiveMetricsToDb({ data: currentMetric.indexId === '1' ? updateDataBMI : updateData })
      .then(({ result }) => {
        track(TrackEventName.Boss_Health_loggingData)
        showToast({
          title: '保存成功',
          type: TOAST_TYPE.SUCCESS
        })
        setTimeout(() => {
          hideToast()
          wx.navigateBack({ delta: 1 })
        }, 1000);
      })
      .catch(err => {
        showToast({
          title: err.msg || '暂无信息',
          type: TOAST_TYPE.WARNING
        })
      })

    this.setData({ isLoading: false })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    const { indexId } = options
    await this.getHealthCurrentMetric(indexId)
  }
})