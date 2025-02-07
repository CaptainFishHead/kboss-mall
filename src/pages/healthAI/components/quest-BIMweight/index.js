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
    heightList: [],
    heightUnit: "",
    weightList: [],
    weightUnit: "",
    weightdotList: [],
    defaultDateList: "",
    heightValue: 0,
    weightValue: 0,
    weightdotValue: 0,
    newHeightValue: 0,
    newWeightValue: 0,
    heightMax: 0,
    weightMax: 0,
    required: false,
    isShow: false
  },
  methods: {
    initData(testIndex, testData) {
      const {
        question: {
          optionBuilders = {},
          required
        },
        questionCode,
        questionId,
        userOptionValues,
        userOptionKeys
      } = testData || {};
      // 7 => BMI题
      // 获取身高
      const heightMin = optionBuilders[0].minValue;
      const heightMax = optionBuilders[0].maxValue;
      const heightDefault = userOptionValues && userOptionValues[0] || optionBuilders[0].defaultValue;
      // 生成身高数据
      const heightList = Array.from({
        length: heightMax - (heightMin - 1)
      }, (_, index) => heightMin + index)
      const heightUnit = optionBuilders[0].unit
      // 获取体重
      const weightMin = optionBuilders[1].minValue;
      const weightMax = optionBuilders[1].maxValue;
      let weightDefault = ""
      let weightDefaultArr = [] //默认值为有小数点的情况
      if (!!userOptionValues) {
        weightDefault = optionBuilders[1].defaultValue;
        if (userOptionValues.length > 0) {
          weightDefault = userOptionValues[1];
        }
      } else {
        weightDefault = optionBuilders[1].defaultValue;
      }
      
      if(String(weightDefault).indexOf('.') !== -1){
        weightDefaultArr = String(weightDefault).split('.')
      }
      let weightdotValue = ''
      if(weightDefaultArr.length){
        weightdotValue = weightDefaultArr[1]
      }else{
        weightdotValue = 0
      }
      // 生成体重数据
      const weightList = Array.from({
        length: weightMax - (weightMin - 1)
      }, (_, index) => weightMin + index)
      const weightUnit = optionBuilders[1].unit
      // 获取体重小数点
      const weightdotList = Array.from({
        length: 10
      }, (_, index) => index);
      // 数据回显
      wx.nextTick(() => {
        // 获取身高默认值对应的下标
        const defaultHeight = heightList.indexOf(heightDefault)
        // 获取体重默认值对应的下标
        let defaultWeight = []
        if(weightDefaultArr.length){
          defaultWeight.push(weightList.indexOf(Number(weightDefaultArr[0])))
          defaultWeight.push(weightdotList.indexOf(Number(weightDefaultArr[1])))
        }else{
          defaultWeight.push(weightList.indexOf(weightDefault))
        }
        // 作为选择之后回显的逻辑
        const defaultValueData = userOptionKeys || []
        let defaultDateList = []
        if(defaultValueData.length > 0){
          defaultDateList = defaultValueData
        }else{
          defaultDateList = [defaultHeight, ...defaultWeight]
        }
        this.setData({
          newHeightValue: heightDefault,
          newWeightValue: weightDefaultArr.length ? weightDefaultArr[0] : weightDefault,
          weightdotValue: weightdotValue,
          heightValue: heightDefault,
          weightValue: weightDefaultArr.length ? weightDefaultArr[0] : weightDefault,
          defaultDateList: defaultDateList,
        })
      })
      this.setData({
        required: required,
        heightList: heightList,
        heightUnit: heightUnit,
        weightList: weightList,
        weightUnit: weightUnit,
        heightMax: heightMax,
        weightMax: weightMax,
        weightdotList: weightdotList,
        userOptionKeys: userOptionKeys,
        isShow: false
      })
    },
    // change
    bindChange(data) {
      // 通过下标查询对应的数据
      const heightValue = this.data.heightList[data.detail.value[0]];
      const weightValue = this.data.weightList[data.detail.value[1]];
      const weightdotValue = this.data.weightdotList[data.detail.value[2]];
      let weightdotList = []
      if (weightValue == this.data.weightMax) {
        // 获取体重小数点
        weightdotList = [0];
      } else {
        // 获取体重小数点
        weightdotList = Array.from({
          length: 10
        }, (_, index) => index);
      }
      this.setData({
        heightValue: heightValue,
        weightValue: weightValue,
        weightdotValue: weightdotValue,
        weightdotList
      })
    },
    handleBMIConfirm() {
      const heightIdx = this.data.heightList.indexOf(this.data.heightValue)
      const weightIdx = this.data.weightList.indexOf(this.data.weightValue)
      const weightdotIdx = this.data.weightdotList.indexOf(this.data.weightdotValue)
      const selectedData = {
        ...this.properties.dataCode,
        userOptionKeys: [heightIdx, weightIdx, weightdotIdx],
        userOptionValues: [
          String(this.data.heightValue), `${this.data.weightValue}.${this.data.weightdotValue}`
        ],
        selectedRes: {},
        questionTypeName: "BMI",
        answerStatus: true
      }
      // 重新渲染数据 - 更新数据
      this.triggerEvent('updateData', selectedData)
    }
  }
})