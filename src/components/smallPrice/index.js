import { isLogged } from "../../utils/index";

Component({
  behaviors: ['wx://component-export'],
  properties: {
    color: '',
    info: { //商品价格信息
      type: Object,
      value: {}
    }
  },
  options: {virtualHost: true},
  data: {
    isLogged: isLogged(),
  },
  lifetimes: {
    attached() {
      this.setData({
        isLogged: isLogged()
      })
    }
  },
  export() {
    return {
      updateIsLogged: () => {
        this.setData({
          isLogged: isLogged()
        })
      }
    }
  }
});
