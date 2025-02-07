import { queryReplaceSuitList } from "../../../models/productModel";
import { hideToast, showToast } from "../../../components/toast/index";
import { TOAST_TYPE } from "../../../const/index";

Component({
  properties: {
  },
  options: {
    multipleSlots: true,
  },
  data: {
    spuList: [],
    spu: {}, //选中的spu
    spuOld: {}, //要替换的商品
    index: 0, //要替换的商品的索引
    visible: false,
    dialogShow: false,
    buttonsConfim: [{
      text: '取消'
    }, {
      text: '确认替换'
    }],
  },
  methods: {

    //获取替换商品列表
    getReplaceList(params, spu, index) {
      showToast({ type: TOAST_TYPE.LOADING })
      queryReplaceSuitList(params)
        .then(({ result }) => {
          const { productList } = result
          this.setData({
            index,
            spuOld: spu,
            spuList: productList,
            visible: true,  //showList
          })
          hideToast()
        })
        .catch((err) => {
          console.error(err, '列表获取失败')
          showToast({
            title: err.msg || '列表获取失败',
            type: TOAST_TYPE.WARNING
          })
        })
    },
    // checkbox 单选
    changeCheckbox(e) {
      const { pid } = e.detail
      const { spuList } = this.data
      let spu = {}
      spuList.forEach(item => {
        if (pid === item.spuId) {
          if (item.disabled) return
          item.checked = !item.checked
          if (item.checked) {
            spu = item
          }
        } else {
          item.checked = false
        }
      })
      this.setData({
        spuList,
        spu
      })
    },
    submit() {
      const { spu } = this.data
      if (!spu.spuId) return showToast({ title: '请选择要替换的商品', type: TOAST_TYPE.WARNING })
      this.setData({ dialogShow: true })
    },
    close() {
      this.setData({
        dialogShow: false,
        spu: {} //清空选中的spu
      })
    },
    tapDialogButton(e) {
      if (e.detail.index) {
        // 确认替换
        const { spu, index } = this.data
        this.triggerEvent('success', { spu, index })
        this.setData({
          visible: false,
          spu: {} //清空选中的spu
        })
      }
      this.setData({ dialogShow: false })
    }
  },
  touchMove() {
    return // 解决蒙层下页面滚动问题
  }
});
