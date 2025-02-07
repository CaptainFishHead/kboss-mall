Component({
  properties: {
    brandInfo: {
      type: Object,
      value: {}
    }
  },
  data: {
    logistics: ['']
  },
  methods: {
    createLogis(){
      const {brandId, logistics} = this.data;
      logistics.push('');
      this.setData({logistics});
    },
    fillHandler(e) {
      const {index} = e.currentTarget.dataset;
      const {value} =  e.detail;
      const {logistics} = this.data;
      logistics[index] = value || '';
      this.updateLogis(logistics);
    },
    onDelLogis(e){
      const {index} = e.currentTarget.dataset;
      const newLogs = this.data.logistics.filter((item, key) => key !== index);
      this.updateLogis(newLogs);
    },
    updateLogis(data){
      const {brandInfo: {brandId}} = this.data;
      this.setData({logistics: data});
      this.triggerEvent('addressChange', {
        brandId,
        logistics: data
      });
    }
  }
});
