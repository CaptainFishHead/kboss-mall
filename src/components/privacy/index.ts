import { wxFuncToPromise } from "@utils/wxUtils";

type TPrivacyRes = {
  resolve: ((value: any) => void) | null,
  reject: ((reason?: any) => void) | null
}
type TPrivacySetting = { privacyContractName: string, needAuthorization: boolean }
Component({
  properties: {},
  data: {
    visiblePrivacy: false,
    privacyContractName: <string>'',
    privacyRes: <TPrivacyRes>{ resolve: null, reject: null },
    quadratic: false
  },
  options: {
    virtualHost: true
  },
  behaviors: ['wx://component-export'],
  export() {
    return {
      openPrivacySetting: () => {
        return new Promise((resolve, reject) => {
          wxFuncToPromise(`getPrivacySetting`, {})
            .then((res) => {
              const {
                needAuthorization,
                privacyContractName
              } = res as TPrivacySetting
              if (needAuthorization) {
                this.setData({
                  visiblePrivacy: true,
                  privacyContractName,
                  privacyRes: { resolve, reject }
                })
              } else resolve({})
            })
            .catch(e=>{
              console.error(e)
            })

        })
      },
      isContinuing: async () => {
        const { needAuthorization } = (await wxFuncToPromise(`getPrivacySetting`, {})) as TPrivacySetting
        return !needAuthorization
      }
    }
  },
  methods: {
    close() {
      this.setData({
        visiblePrivacy: false,
      })
      setTimeout(()=>{
        this.setData({
          quadratic: false
        })
      },300)
    },
    handleOpenPrivacyContract() {
      // 打开隐私协议页面
      wxFuncToPromise(`openPrivacyContract`)
    },
    handleAgreePrivacyAuthorization(e: { currentTarget: { id: string } }) {
      const { resolve, reject } = this.data.privacyRes
      const { quadratic } = this.data
      switch (e.currentTarget.id) {
        case 'agree-btn':
          this.close()
          if (resolve) resolve({})
          break
        default:
          if (quadratic && reject) {
            this.close()
            reject()
          } else if (!quadratic) {
            this.setData({
              quadratic: true
            })
          }
      }

    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  }
});
