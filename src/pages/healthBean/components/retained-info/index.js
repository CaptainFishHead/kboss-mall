import WxValidate from "@utils/WxValidate"
import { TOAST_TYPE, STORAGE_USER_FOR_KEY } from "@const/index";
import { hideToast, showToast } from "@components/toast/index"
Component({
  
  properties: {
    visible: {
      type: Boolean,
      value: false,
    },
    retainedTile: {
      type: String,
      value: '',
    },
    retainedMobile: {
      type: String,
      value: '',
      observer(val) {
        if (val) {
          this.setData({ 'formValue.phoneNumber': val })
        }
      }
    },
  },
  data: {
    formValue: {
      phoneNumber: '',
      name: '',
      fromWhere: ''
    }
  },
  lifetimes: {
    created() {
      this.initValidate()
    },
  },
  methods: {
    initValidate() {
      const rules = {
        phoneNumber: {
          required: true,
          tel: true
        },
        name: {
          required: true,
          rangelength: [1, 20]
        },
        fromWhere: {
          required: true
        },
      };
      const message = {
        phoneNumber: {
          required: '请填写手机号',
          tel: '手机号格式不正确'
        },
        name: {
          required: '请输入姓名',
          rangelength: '请输入长度在1到20之间的字符。',
        },
        fromWhere: {
          required: '请填从何渠道知道康老板',
          minLength: '请输入长度在1到50之间的字符。'
        },
      }
      this.WxValidate = new WxValidate(rules, message);
    },
    /*提示函数*/
    showTips(msg, desc = '') {
      showToast({
        title: msg,
        desc,
      })
    },
    /*留资信息input*/
    inputRetainedInfo(e) {
      const { detail: { value }, currentTarget: { dataset: { title } } } = e
      const formval = `formValue.${title}`
      this.setData({ [formval]: value })
    },
    // 提交留资信息并且去领取康豆
    submit() {
      const { formValue } = this.data
      console.log(formValue, "输入的留资信息", this.WxValidate.addMethod())
      if (!this.WxValidate.checkForm(formValue)) {
        const err = this.WxValidate.errorList[0];
        this.showTips(err.msg || '暂无信息!')
        return
      }
      this.triggerEvent('getReceive', formValue)
    },
  }
})