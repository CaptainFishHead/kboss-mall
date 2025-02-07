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
        },
    },
    data: {
      nextSelectors: [],
      required: false,
      optionList: [],
      questionTName: '',
      isShow:false
    },
    methods: {
        initData(testIndex, testData) {
            const {
                question: {options = []}, questionType, userOptionValues
            } = testData || {};
            // 全部置空
            if (userOptionValues) {
                options.forEach((item) => {
                    item.selected = false
                    if (item.optionValue === userOptionValues.join()) {
                        item.selected = true
                    }
                })
            } else {
                options.map((item) => item.selected = false)
            }
            let testType = {1: "单选题", 2: "多选题"}
            this.setData({
                optionList: options,
                questionTName: testType[questionType] || '',
                isShow: false
            })
        },
        // 选择项
        handleSelected(data) {
            const {item, index} = data.currentTarget.dataset;
            const optionList = this.data.optionList
            // 设置选择高亮
            optionList.forEach((item) => {
                item.selected = false
            })
            optionList[index].selected = true
            this.setData({optionList,})
            const selectedData = {
                ...this.properties.dataCode,
                userOptionValues: [item.optionValue],
                questionTypeName: "Single",
                answerStatus: true
            }
            // 重新渲染数据 - 更新数据
            this.triggerEvent('updateData', selectedData)
        }
    }
})