function mergeAndCount (array) {
  const map = new Map();
  array.forEach(item => {
    const key = `${item.expirationDate}-${item.serviceId}`;
    if (!map.has(key)) {
      map.set(key, {
        ...item,
        sum: 1
      });
    } else {
      map.get(key).sum++;
    }
  });
  return Array.from(map.values());
}



Component({
  properties: {
    expirationDetailList: {
      type: Array,
      value: [],
    },
    serviceUseExplain: {
      type: String,
      value: "",
    },
  },
  data: {
    visible: false,
    isUpload: false,
    explainList: [],
    mergedList:[]
  },
  methods: {
    showUpload () {
      let list = this.properties.serviceUseExplain.split("/");
      let mergedArray =mergeAndCount(this.data.expirationDetailList);
      this.setData({ visible: true, explainList: list ,mergedList:mergedArray });
    },
    close () {
      this.setData({ visible: false, explainList: [] });
    },

    touchMove () {
      return; // 解决蒙层下页面滚动问题
    },
  },
});
