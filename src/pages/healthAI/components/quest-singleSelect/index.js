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
    valueIntList: [],
    valueFloatList: [],
    unit: "",
    defaultDateList: [],
    dataIntValue: 0,
    dataFloatValue: 0,
    optionNodes: [],
    initValue: 0,
    floatValue: 0,
    maxValue:0,
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
        userOptionKeys,
        userOptionValues
      } = testData || {};
      // 获取最大值 | 最小值 | 默认值 | 单位
      const maxValue = optionBuilder.maxValue;
      const minValue = optionBuilder.minValue;
      const defaultValue = optionBuilder.defaultValue;
      const stepValue = optionBuilder.step
      const unit = optionBuilder.unit;
      // 生成数据
      const start = minValue;
      const end = maxValue;
      const step = stepValue;
      const length = Math.floor((end - start) / step) + 1;
      const resultListData = [...new Set(Array.from({
        length
      }, (_, i) => (start + i * step).toFixed(0)))]
      const valueIntList = resultListData.map(Number);
      const valueFloatList = Array.from({
        length: 99
      }, (_, index) => ('0' + (index + 1)).slice(-2));
      const defaultData = this.splitNumber(userOptionValues.join() || defaultValue)
      const initValue = defaultData[0];
      const floatValue = defaultData[1] === '00' ? '01' : defaultData[1];
      // 获取默认值对应的下标
      const defaultArrayData = [
        valueIntList.indexOf(initValue),
        valueFloatList.indexOf(floatValue)
      ]
      // 作为选择之后回显的逻辑
      const defaultValueData = userOptionKeys || [];
      const defaultDateValue = defaultValueData.length > 0 ? defaultValueData || [] : defaultArrayData || [];
          this.setData({
            initValue: initValue,
            floatValue: floatValue,
            required: required,
            valueIntList: valueIntList,
            valueFloatList: valueFloatList,
            unit: unit,
            maxValue: maxValue,
            optionNodes: optionNodes,
            isShow: false
          },()=>{
            this.setData({
              defaultDateList: defaultDateValue
            })
          })
    },
    // 将默认值转化成数组 - 0.5 => [0,"50"], 6 => [6,"00"], 3.4 => [3,"40"]
    splitNumber(num) {
      const integerPart = Math.floor(num);
      const decimalPart = Math.round((num - integerPart) * 100);
      const decimalString = decimalPart.toString().padStart(2, '0');
      return [integerPart, decimalString];
    },
    // change
    bindChange(data) {
      if (data.detail.value) {
        // 如果值为最大，则只能选择"01"
        let valueFloatList = []
        if (data.detail.value[0] === this.data.maxValue) {
          valueFloatList = ['01']
        } else {
          valueFloatList = Array.from({
            length: 99
          }, (_, index) => ('0' + (index + 1)).slice(-2));
        }
        // 通过下标查询对应的数据
        const dataIntValue = this.data.valueIntList[data.detail.value[0]];
        const dataFloatValue = valueFloatList[data.detail.value[1]];
        this.setData({
          dataIntValue: dataIntValue,
          dataFloatValue: dataFloatValue,
          initValue: dataIntValue,
          floatValue: dataFloatValue,
          valueFloatList: valueFloatList
        })
      }
    },
    handleSingleSelect() {
      const valueIdx = this.data.valueIntList.indexOf(this.data.initValue)
      const valueIdy = this.data.valueFloatList.indexOf(this.data.floatValue)
      const selectedData = {
        ...this.properties.dataCode,
        userOptionKeys: [valueIdx, valueIdy],
        userOptionValues: [`${this.data.initValue}.${this.data.floatValue}`],
        selectedRes: {},
        questionTypeName: "SingleNumber",
        answerStatus: true
      }
      // 重新渲染数据 - 更新数据
      this.triggerEvent('updateData', selectedData)
    }
  }
})
