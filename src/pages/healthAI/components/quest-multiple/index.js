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
    data: {
        selectedList: [],
        options: [],
        status: false,
        excludeValues: '',
        required: false,
        isShow:false
    },
    observers: {
        'dataIndex': function (label) {
            wx.nextTick(() => {
              this.setData({
                isShow: true
              })
              this.initData(label, this.properties.dataCode)
            })
        },
        'dataCode': function (label) {
            wx.nextTick(() => {
            })
        }
    },
    methods: {
        initData(testIndex, testData) {
            const {
                question: {options = [], required},
                nextSelectors,
                questionType,
                userOptionValues
            } = testData || {};
            // 判断回答状态，如果已回答，则获取回答的列表进行回显，否则全部置空
            if (userOptionValues) {
                const result = options.map(item => ({...item, selected: userOptionValues.includes(item.optionValue)}));
                this.setData({selectedList: userOptionValues, options: result})
            } else {
              options.forEach((item) => {
                  item.selected = false
              })
              this.setData({
                  selectedList: [],
                  options: options
              })
            }
            // 获取 非 选择选项
            const excludeValuesItem = options.find(item => item.excludeOptionValues && item.excludeOptionValues.length) || {}
            let testType = {"1": "单选题", "2": "多选题"}
            this.setData({
                required: required,
                nextSelectors: nextSelectors || [],
                questionType: questionType,
                questionTName: testType[questionType] || '',
                excludeValues: excludeValuesItem ? excludeValuesItem.optionValue : '',
                userOptionValues: userOptionValues,
                isShow: false
            })
        },
        /**点击多选*/
        handleMultiple(data) {
            const {item} = data.target.dataset;
            const optionValue = item.optionValue;
            //选择了 无 ，清理排斥其他值
            if (optionValue === this.data.excludeValues) {
                let selectedList = []
                if (!this.data.selectedList.includes(optionValue)) {
                    selectedList = [optionValue]
                }
                this.setData({selectedList});
            } else { //选择不是 '无'
                const _selectedList = this.data.selectedList
                if (_selectedList.includes(optionValue)) {
                    const index = _selectedList.indexOf(optionValue);
                    if (index > -1) {
                        _selectedList.splice(index, 1);
                    }
                    this.setData({selectedList: _selectedList});
                } else {
                    const index = _selectedList.indexOf(this.data.excludeValues);
                    if (index > -1) {
                        _selectedList.splice(index, 1);
                    }
                    _selectedList.push(optionValue);
                }
                this.setData({selectedList: _selectedList});
            }
            const options = this.data.options
            options.forEach((item) => {
                item.selected = false
                if (this.data.selectedList.includes(item.optionValue)) {
                    item.selected = true
                }
            })
            // 过滤筛选已选中的数据
            const selectedData = {
                ...this.properties.dataCode,
                userOptionValues: this.data.selectedList,
                questionTypeName: "Multiple",
                answerStatus: this.data.selectedList.length > 0
            }
            this.setData({options});
            // 重新渲染数据 - 更新数据
            this.triggerEvent('updateData', selectedData)
        }
    }
})