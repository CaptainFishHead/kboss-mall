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
    dataList: [],
    currentData: [],
    showDialog: false,
    selectedResStatus: true,
    currentValue: 0,
    selectIndex: 0,
    getMaxValue: 0,
    currentIndx: [],
    optionBuilders: [],
    arrayNullList: [],
    isShow:false
  },
  methods: {
    initData(_, testData) {
      const {
        question: {
          optionNodes = [],
          optionBuilders = [],
          required
        },
        nextSelectors,
        userOptionKeys,
        userOptionValues
      } = testData || {};
      this.setData({
        selectedResStatus: userOptionKeys && userOptionKeys.length > 0 ? false : true,
        isShow: false
      })
      // 生成从00-99的数组
      const valueFloatList = Array.from({
        length: 100
      }, (_, i) => i.toString().padStart(2, '0'));
      this.setData({
        valueFloatList: valueFloatList
      })
      // 动态生成数据
      const arraysList = this.generateRangeArrays(optionBuilders);
      this.setData({
        dataList: arraysList,
        optionBuilders: optionBuilders,
        userOptionKeys: userOptionKeys
      })
      // 数据回显
      wx.nextTick(() => {
        this.data.dataList.forEach((item, index) => {
          if (item != null) {
            item.selectKey = userOptionKeys[index]?.key,
              item.selectValue = userOptionKeys[index]?.value
          }
        })
        this.setData({
          dataList: this.data.dataList
        })
      })
      // 根据动态选项题数量生成空数组,以用来根据顺序插入数据 => [null,null,...]
      const arrayNullList = Array.apply(null, {
        length: this.data.dataList.length
      }).map(() => null);
      this.setData({
        arrayNullList: arrayNullList
      })
    },
    // 动态生成数据
    generateRangeArrays(data) {
      const resultData = data.map((item) => {
        const range = []
        for (let i = item.minValue; i <= item.maxValue; i++) {
          range.push(i)
        }
        return {
          typeName: item.optionContent,
          data: range,
          valueFloatList: this.data.valueFloatList,
          optionCode: item.optionCode,
          unit: item.unit,
          unitCn: item.unitCn,
          defaultValue: [item.defaultValue, '00'],
          defaultIdx: [range.indexOf(item.defaultValue), 0],
          placeholder: `请选择${item.optionContent}`
        }
      })
      return resultData
    },
    // 触发选择弹出
    handleSelectDialog(data) {
      const dataIndex = data.currentTarget.dataset.index;
      const dataItem = data.currentTarget.dataset.item;
      const arrayResList = this.data.userOptionKeys.length > 0 ? this.data.userOptionKeys : this.data.arrayNullList
      // 当唤起弹窗时，显示已选中或默认值
      const currentNewIndx = this.data.dataList[dataIndex]?.selectKey || dataItem.defaultIdx;
      this.setData({
        selectIndex: dataIndex,
        currentData: dataItem,
        currentValue: dataItem.defaultValue,
        currentIndx: currentNewIndx,
        getMaxValue: dataItem.data[dataItem.data.length - 1],
        arrayNullList: arrayResList,
        showDialog: true
      })
    },
    // 触发弹窗选择
    bindChange(data) {
      // 获取当前选中的下标
      const currentIndx = data.detail.value
      // 获取下标指定的实际数据
      const currentValueInt = this.data.currentData.data[currentIndx[0]];
      const currentValueFloat = this.data.currentData.valueFloatList[currentIndx[1]];
      // 如果值为最大，则只能选择"00"
      let valueFloatList = []
      if (currentValueInt === this.data.getMaxValue) {
        valueFloatList = ['00'];
      } else {
        valueFloatList = Array.from({
          length: 100
        }, (_, i) => i.toString().padStart(2, '0'))
      }
      this.setData({
        currentIndx: currentIndx,
        currentValue: [currentValueInt, currentValueFloat],
        valueFloatList: valueFloatList
      })
      wx.nextTick(() => {
        const arraysList = this.generateRangeArrays(this.data.optionBuilders);
        const newCurrentData = {
          ...this.data.currentData,
          valueFloatList: valueFloatList
        }
        this.setData({
          // dataList: arraysList,
          optionBuilders: this.data.optionBuilders,
          currentData: newCurrentData
        })
      })
    },
    // 触发弹窗完成
    handleConfirm() {
      // 点击选项弹窗获取知道是点击第几个选项
      const dataIndex = this.data.selectIndex;
      const init = this.data.dataList[dataIndex].data[this.data.currentIndx[0]].toString();
      const float = this.data.dataList[dataIndex].valueFloatList[this.data.currentIndx[1]].toString();
      const sumTotal = `${init}.${float}`;
      const arrayResList = this.data.arrayNullList;
      arrayResList[dataIndex] = {
        index: dataIndex,
        key: this.data.currentIndx,
        value: sumTotal
      }
      // 触发弹窗选择进行数据重新渲染(回显用)
      const dataList = this.data.dataList[dataIndex];
      dataList.selectKey = this.data.currentIndx;
      dataList.selectValue = sumTotal;
      this.setData({
        arrayNullList: [...arrayResList],
        dataList: this.data.dataList,
        selectedResStatus: false
      })
      // 关闭弹窗
      this.bindClose();
    },
    // 触发关闭弹窗
    bindClose() {
      this.setData({
        showDialog: false
      })
    },
    // 根据获取当前选择的数据集合转化为数组
    transObjectToArrayData(data) {
      return data.map(item => {
        if (typeof item === 'object' && item !== null && item.hasOwnProperty('value')) {
          return item.value;
        }
        return item;
      });
    },
    // 确认按钮
    handleMultipleConfirm() {
      // 判断当前是否已答题
      const isArrayNull = this.data.arrayNullList.every(item => item === null);
      // 答题结果(兼容)
      const aswerData1 = this.data.userOptionKeys || this.data.arrayNullList;
      const aswerData2 = this.data.arrayNullList;
      // 重新渲染数据
      this.setData({
        userOptionKeys: isArrayNull ? aswerData1 : aswerData2,
        arrayNullList: this.data.arrayNullList
      })
      // 获取到当前选择的数据集合
      const arrayLatestData = this.data.arrayNullList;
      const selectedData = {
        ...this.properties.dataCode,
        userOptionKeys: this.data.userOptionKeys,
        userOptionValues: this.transObjectToArrayData(this.data.userOptionKeys),
        questionTypeName: "MultipleSelect",
        answerStatus: true
      }
      // 重新渲染数据 - 更新数据
      this.triggerEvent('updateData', selectedData)
    }
  }
})
