Component({
  properties: {
    metaList: {
      type: Array,
      value: [],
    },
    // 2多选1单选
    isCheckbox: {
      type: Number,
      value: 0
    },
    // 第几个分类
    index: {
      type: Number,
      value: 0
    }
  },
  data: {
    visible: false,
    curItem: {},
    multiple: 0,
    optionIndex: 0,//optionList 第几个元素
  },
  methods: {
    // 单选
    genderChange(e) {
      console.log('genderChange', e.detail.value)
      const { metaList } = this.data;
      for (let i = 0; i < metaList.length; i++) {
        metaList[i].checked = (metaList[i].optionName === e.detail.value);
        if (metaList[i].optionName === e.detail.value) {
          this.triggerEvent('onMedicalSelect', { lists: metaList[i], index: this.data.index, multiple: 1 })
        }
      }
      this.setData({
        metaList,
        // formData: { ...formData, gender: e.detail.value },
      });
    },
    // data-item
    getCurrentItem(e) {
      const { item, multiple, optionIndex } = e.currentTarget.dataset
      this.setData({ curItem: item, multiple, optionIndex })
    },
    // 其他
    onInputOther(e) {
      const { optionIndex } = e.currentTarget.dataset
      this.setData({ optionIndex })
      // return
      const { value } = e.detail
      const { multiple, curItem } = this.data
      this.triggerEvent('onMedicalOther', { curItem, value, index: this.data.index, multiple, optionIndex })
    },
    showMedicalHistory(e) {
      const { title, list, medical } = e;
      const metaList = medical.metaList || [];

      this.initCheckedItem(list, metaList);
      this.setData({
        title,
        list, //选中的病史
        metaList, //全部病史列表
        visible: true //显示
      })
    },

    //多选
    checkboxChange(e) {
      const { value } = e.detail;
      const { metaList } = this.data;
      this.initCheckedItem(value, metaList);
      this.setData({ metaList });
    },

    //数据回显格式化
    initCheckedItem(activeList, baseList) {
      let selectedArray = []
      for (let i = 0; i < baseList.length; i++) {
        baseList[i].checked = false

        for (let j = 0; j < activeList.length; j++) {
          if (baseList[i].optionName === activeList[j]) {
            baseList[i].checked = true
            if (baseList[i].checked) {
              selectedArray.push(baseList[i])
            }
            break
          }
        }
      }
      this.triggerEvent('onMedicalSelect', { lists: selectedArray, index: this.data.index, multiple: 2 })
    },
    close() {
      this.setData({
        visible: false //关闭
      })
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    },

  }
});
