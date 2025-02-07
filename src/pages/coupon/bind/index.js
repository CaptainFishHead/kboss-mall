import { TOAST_TYPE } from "../../../const/index";
import { hideToast, showToast } from "../../../components/toast/index";
import { bindCardByPassword } from "../../../models/cardModel";
import env from "../../../config/env";
import { track, TrackEventName } from "@utils/sa";

Page({
  data: {
    // appId: 2001690184,
    appId: 194734300,
    form: {
      password: '',
    },
    errorMsg: '', // 验证表单显⽰错误信息
    rules: [
      {
        name: 'password',
        rules: [{ required: true, message: '请输入礼品卡密码' }]
      }
    ]
  },
  onLoad() {
    if (env.__environment__ === 'pro') {
      this.setData({ appId: 194734300 })
    }
  },
  formInputChange(e) {
    this.setData({ errorMsg: '' })
    let val = e.detail.value.replace(/\s/g, '').replace(/\-/g, '').toUpperCase()
    let len = val.length
    if (len > 4 && len <= 8) {
      val = val.replace(/^(\S{4})/g, '$1-')
    } else if (len > 8 && len <= 12) {
      val = val.replace(/^(\S{4})(\S{4})/g, '$1-$2-')
    } else if (len > 12) {
      val = val.replace(/^(\S{4})(\S{4})(\S{4})/g, '$1-$2-$3-')
    }
    this.setData({ form: { password: val } })
  },
  submitForm() {
    this.selectComponent('#form').validate((valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            errorMsg: errors[firstError[0]].message
          })
        }
      } else {
        this.showBindCode()
      }
    })
  },

  // 验证码弹窗
  showBindCode() {
    this.selectComponent('#captcha').show()
  },
  // 验证码验证结果回调
  handlerVerify(ev) {
    if (ev.detail.ret === 0) {
      // 验证成功
      const { password } = this.data.form
      const psd = password.replace(/\-/g, '')
      const params = {
        cardPwd: psd,
        ticket: ev.detail.ticket
      }
      this.bindCard(params) //请求绑定接口
    } else {
      // 验证失败
    }
  },
  // 验证码出错
  handlerError(ev) {
    showToast({
      title: ev.detail.errMsg || '验证码错误，请重试',
      type: TOAST_TYPE.WARNING
    })
  },

  // 绑定卡 请求接口
  bindCard(params) {
    showToast({ type: TOAST_TYPE.LOADING })
    bindCardByPassword(params)
      .then(({ result }) => {
        hideToast().then(() => {
          const { bindingFlag, bindingMessage } = result
          if (bindingFlag) {
            this.setData({ errorMsg: '' })
            //埋点
            track(TrackEventName.Boss_TieCard)
            showToast({
              title: '绑定成功',
              type: TOAST_TYPE.SUCCESS
            })
            setTimeout(() => {
              this.reLoadPrePage() //执行前一个页面的方法
              wx.navigateBack() //自动返回列表页
            }, 2000)
          } else {
            this.setData({ errorMsg: bindingMessage })
          }
        })
      })
      .catch((err) => {
        showToast({
          title: err.msg || '绑定失败，请重试',
          type: TOAST_TYPE.WARNING
        })
      })
  },

  // 执行前一个页面的方法
  reLoadPrePage() {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if (prevPage.route === "pages/coupon/index") {
      prevPage.tabChange(0) //更新列表数据
    }
  }
})