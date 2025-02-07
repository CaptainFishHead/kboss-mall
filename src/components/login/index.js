import {STORAGE_USER_FOR_KEY, USER_SOURCE_KEY, TOAST_TYPE, RECEIVER_ADDRESS, PLAT_FORM} from "../../const/index";
import {hideToast, showToast} from "../toast/index";
import {holdUpAdv, queryUserInfo, registerAndLogin} from "../../models/userModel";
import env from "../../config/env";
import {saLogin, track, TrackEventName} from "../../utils/sa";
import {wxFuncToPromise} from "../../utils/wxUtils";
import {clearCallback} from "../LoginPage/callbacks";
import { getCaptcha, login } from "../../models/loginModel";
import { get, post } from "../../utils/http/index";
const app = getApp()
Component({
	properties: {
		hideClose: {
			type: Boolean,
			value: false
    },
    pageSource: {
      type: String,
      value: ''
    }
	},
	data: {
		agreementProtocol: encodeURIComponent('https://static.tojoyshop.com/html/boss/wxapp/agreement_protocol.html?v=1.0.0'),
		privateProtocol: encodeURIComponent('https://static.tojoyshop.com/html/boss/wxapp/private_protocol.html?v=1.0.0'),
    mobile: '', // 手机号
		code: '', // 验证码
		msg: '获取验证码',
    seconds: 60,
    defaultSeconds: 60,
    isMoblieLogin: false
	},
	options: {
		virtualHost: true
  },
  lifetimes: {
		attached() {
      this.setData({
        isMoblieLogin: app.globalData.isMoblieLogin
      })
    }
  },
	methods: {
		hideLogin() {
			this.setData({
				isChecked: false,
			})
			this.triggerEvent('close')
			clearCallback()
		},
		prevWxAuth() {
			if (!this.data.isChecked) {
				showToast({
					title: '请先勾选用户协议',
					type: TOAST_TYPE.WARNING,
					duration: 1000
				})
			}
		},
		setCheck(e) {
			const isChecked = e.currentTarget.dataset.ischeck;
			this.setData({
				isChecked: !isChecked
			})
		},
		async getPhoneNumber(e) {
			const {code: loginKey} = e.detail
			const {system: sysVersion, model: unitType} = wx.getSystemInfoSync()
      const {openId, sessionKey, unionId, nickname, userHeadIcourl} = wx.getStorageSync(STORAGE_USER_FOR_KEY) || {}
      const { pageSource } = this.data
			showToast({type: TOAST_TYPE.LOADING})
			try {
				const {code:captcha} = await wxFuncToPromise('login')
				const {query} = wx.getLaunchOptionsSync()
        const params = {
          captcha, loginKey, redMallFlag: 3,
          openId, sessionKey, unionId,
          sysVersion, unitType,
          // registerType: 9,
          appVersion: env.version, platform: '3',
          deviceId: '', ip: '', nickname, userHeadIcourl
        }
        if (query.gdt_vid) {
          params.registerType = 80
        }
        const {result, code: resCode, msg, group} = await registerAndLogin(params)
				const user = await queryUserInfo()
        track(`kboss_applet_login_logs`,{group , message:`USER_ID:【${user.userId}】`,steps:2,actionUrl :`/api/v1/cs/app/crmuser/getUserInfo`})
				saLogin(user.userId, false, pageSource)
        track(`kboss_applet_login_logs`,{group, message:`登录神策完成后：USER_ID:【${user.userId}】`,steps:3})
				await hideToast()
				this.triggerEvent('success', {result, user, code: resCode, msg})
				holdUpAdv()
				this.hideLogin()
			} catch (err) {
        console.error(err)
				hideToast().then(() => {
          track(TrackEventName.Boss_Msso, {page_source: pageSource || '其他', is_success: 0})
          this.triggerEvent('fail', err)
          showToast({
            type: TOAST_TYPE.WARNING,
            title: err.msg ? err.msg : '登录失败，请稍候再试。',
            duration:1000
          })
          //账户禁用
          if(err.code === 101301){
            setTimeout(() => {
              wx.navigateTo({ url: '/pages/accountBan/index' })
            }, 1000)
          }
        })
			}
    },
    inputPhone(e) {
      let value = e.detail.value
      value = value.replace(/[^\d]/g, '')
      value = value.replace(/\s+/g, '') // 去掉空格
      this.setData({
        mobile: value
      })
    },
    inputCode(e) {
      let value = e.detail.value
      value = value.replace(/\s+/g, '') // 去掉空格
      this.setData({
        code: value
      })
    },
    onSendCode() {
      let { mobile, seconds } = this.data
      if (mobile == '' || mobile.length != 11) {
        wx.showToast({
          title: '请输入正确手机号',
          icon: 'none'
        })
        return false
      }
      if (this.timer != null|| (seconds < 60 && seconds > 0)) return false
      this.codeCountdown()
      // 发送验证码
      getCaptcha({ loginKey: mobile, usedFor: 'buy'}).then(res => {
        if(res.code != 200){
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
    // 验证码倒计时
    codeCountdown() {
      let that = this
      let { seconds, defaultSeconds } = this.data
      if(seconds <= 0){
        clearInterval(that.timer)
        that.timer = null
        that.setData({
          msg: '获取验证码',
          seconds: defaultSeconds
        })
      }else{
        seconds--
        that.setData({
          msg: `验证码(${seconds}s)`,
          seconds: seconds
        })
        that.timer = setInterval(() => {
          let secondsNow = that.data.seconds
          if (secondsNow <= 0) {
            clearInterval(that.timer)
            that.timer = null
            that.setData({
              msg: '获取验证码',
              seconds: defaultSeconds
            })
            return false
          }
          secondsNow--
          that.setData({
            msg: `验证码(${secondsNow}s)`,
            seconds: secondsNow
          })
        }, 1000)
      }
    },

    async saveKangBossUser() {
      try {
        const res1 = await wxFuncToPromise('login')
        const openIdRes = await post('/api/v1/obh/program/nl/getWxInfoByCode', {code: res1.code}, {headers:{ platformId: PLAT_FORM.OBH}, baseURL:env.YUNSHANG_API})
        if (openIdRes && openIdRes.code  === 200) {
          const saveRes = await post('/api/v1/obh/program/saveKangBossUser', {wxOpenId: openIdRes.result.openid}, {headers:{ platformId: PLAT_FORM.OBH}, baseURL:env.YUNSHANG_API})
        }
      } catch(err) {
      }
    },

    // 登录
    async onSubmit() {
      let { mobile, code, pageSource } = this.data
      if (mobile == '' || mobile.length != 11) {
        wx.showToast({
          title: '请输入正确手机号',
          icon: 'none'
        })
        return false
      }
      if (code == '') {
        wx.showToast({
          title: '请输入验证码',
          icon: 'none'
        })
        return false
      }
      try {
        const {result, code: resCode, msg} = await login({ loginKey: mobile, captcha:code, usedFor: 'buy', extra: {"channel":"","channelId":"","registerType":"20"}})
        wx.setStorageSync(USER_SOURCE_KEY, null)
        wx.removeStorageSync(RECEIVER_ADDRESS)
        let userInfo = {
            ...result.baseMember,
            userId: result.baseMember.memberId,
            token: result.token
        }
        wx.setStorageSync(STORAGE_USER_FOR_KEY, {...userInfo})
        this.saveKangBossUser()

        const _user = await queryUserInfo()
        saLogin(_user.userId, false, pageSource)
        // try {
        //   if (_user.mobile) {
        //     const plugin = requirePlugin('Kboss')
        //     await plugin.initializeUser(_user.mobile)
        //   }
        // } catch (e) {
        //   console.error('插件登录失败', e)
        // }
        this.triggerEvent('success', {result, _user, code: resCode, msg})
        holdUpAdv()
        this.hideLogin()
      } catch (err) {
        wx.showToast({
          title: err.msg,
          icon: 'none'
        })
        track(TrackEventName.Boss_Msso, {page_source: pageSource || '其他', is_success: 0})
        console.error('登录异常', err)
        this.triggerEvent('fail', err)
        //账户禁用
        if(err.code === 101301){
          setTimeout(() => {
            wx.navigateTo({ url: '/pages/accountBan/index' })
          }, 1000)
        }
      } finally {

      }
    },
	}
});
