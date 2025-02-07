import { isLogged } from "@utils/index";

type TProperties = {
  pageSource: typeof String
}
type TData = {
  visible: boolean
}
type ICustomInstanceProperty = {
  loginSuccess: null | ((value: any | PromiseLike<any>) => void),
  loginFail: null | ((reason?: any) => void)
}
type TMethods = {
  closeHandler: () => void,
  successHandler: (params: { result: any, user: any, msg: string, code: number }) => void,
  failHandler: (err: any) => void,
  clearPromise: () => void,
}
Component<TData, TProperties, TMethods, ICustomInstanceProperty>({
  properties: {
    pageSource: String
  },
  data: {
    visible: false
  },
  behaviors: ['wx://component-export'],
  export() {
    return {
      openLoginModal: () => {
        if (isLogged()) return Promise.resolve({})
        this.setData({
          visible: true
        })
        return new Promise((resolve, reject) => {
          this.loginSuccess = resolve
          this.loginFail = reject
        })
      }
    }
  },
  methods: {
    closeHandler() {
      this.setData({
        visible: false
      })
      this.clearPromise()
    },
    clearPromise() {
      this.loginSuccess = null
      this.loginFail = null
    },
    successHandler(params) {
      if (this.loginSuccess) {
        this.loginSuccess(params)
      }
      this.closeHandler()
    },
    failHandler(err) {
      if (this.loginFail) {
        this.loginFail(err)
      }
    }
  }
});
