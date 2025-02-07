import { wxFuncToPromise } from '@utils/wxUtils'
import mapNav from '@behaviors/mapNav'
function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
Component({
  properties: {
    outletsInfo: {
      type: Object,
      value: {}
    }
  },
  behaviors: [mapNav],
  options: {
    styleIsolation: 'apply-shared'
  },
  data: {},
  debounceHandleNav: null,
  created(){
    this.debounceHandleNav = debounce(this.handleNav, 500);
  },
  methods: {
    /* 导航 */
    handleNav() {
      this.getLocation({ isShowModal: true, isOpenMap: true })
    },
    /*联系方式*/
    onCallTel() {
      wxFuncToPromise(`navigateTo`, { url: `/pages/services/serviceStaff/index` }).then(({ eventChannel }) => {
        let params = this.data.outletsInfo
        eventChannel.emit(`staff`, params)
      })
    }
  }
})
