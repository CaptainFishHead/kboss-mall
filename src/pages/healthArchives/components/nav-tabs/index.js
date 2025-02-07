import { nextTick, getRect, getAllRect } from "@utils/index"

Component({
  properties: {
    list: {
      type: Array,
      value: [],
      observer(v) {
        this.setData({ isDataLoad: !!v.length })
        this.initLine()
      }
    },
    customStyle: {
      type: String,
      value: ''
    },
    active: {
      type: Number,
      value: 0,
      observer(val) {
        this.change(val);
      }
    },
    scrollable: {
      type: Boolean,
      value: true
    }
  },
  data: {
    scrollLeft: 0,
    currentIndex: 0,
    lineOffsetLeft: 0,
    lineWidth: 16,
    isDataLoad: false
  },
  lifetimes: {
    //在组件在视图层布局完成后执行
    ready: function () {
      if (this.data.isDataLoad) {
        this.initLine()
      }
    }
  },
  methods: {
    initLine() {
      let that = this;
      this.setData({
        currentIndex: this.data.active,
        scrollable: this.data.list.length >= 5
      }, function () {
        const currentIndex = that.data.currentIndex;
        Promise.all([
          getAllRect(this, '.cl-tab'),
          getRect(this, '.cl-tabs__line'),
        ]).then(([rects = [], lineRect]) => {

          const rect = rects[currentIndex];
          if (rect == null) {
            return;
          }
          let lineOffsetLeft = rects.slice(0, currentIndex).reduce((prev, curr) => prev + curr.width, 0);
          lineOffsetLeft += (rect.width - lineRect.width + 20) / 2;
          that.setData({
            lineOffsetLeft
          });
        });
      });
    },
    //切换组件
    swich: function (e) {
      console.log(e, '======>>>>>')
      const { data } = this;
      const currentIndex = e.currentTarget.dataset.index;
      const item = e.currentTarget.dataset.item;
      if (currentIndex === data.currentIndex) {
        return;
      }
      const shouldEmitChange = data.currentIndex !== null;
      this.setData({ currentIndex });
      nextTick(() => {
        this.resize(false);
        this.scrollIntoView();
        if (shouldEmitChange) {
          //绑定事件到change
          this.triggerEvent('change', {
            index: currentIndex,
            item: item
          })
        }
      });
    },
    change: function (index) {
      this.setData({
        currentIndex: index
      }, () => {
        this.resize(false);
        this.scrollIntoView();
      })
    },
    resize() {
      const { currentIndex } = this.data;
      Promise.all([
        getAllRect(this, '.cl-tab'),
        getRect(this, '.cl-tabs__line'),
      ]).then(([rects = [], lineRect]) => {
        const rect = rects[currentIndex];
        if (rect == null) {
          return;
        }
        let lineOffsetLeft = rects.slice(0, currentIndex).reduce((prev, curr) => prev + curr.width, 0);
        lineOffsetLeft += (rect.width - lineRect.width + 20) / 2;
        this.setData({
          lineOffsetLeft
        });
      });
    },
    scrollIntoView() {
      const { currentIndex, scrollable } = this.data;
      if (!scrollable) {
        return;
      }
      Promise.all([
        getAllRect(this, '.cl-tab'),
        getRect(this, '.cl-tabs-nav'),
      ]).then(([tabRects, navRect]) => {
        const tabRect = tabRects[currentIndex];
        const offsetLeft = tabRects
          .slice(0, currentIndex)
          .reduce((prev, curr) => prev + curr.width, 0);
        this.setData({
          scrollLeft: offsetLeft - (navRect.width - tabRect.width) / 2,
        });
      });
    },
  }
})