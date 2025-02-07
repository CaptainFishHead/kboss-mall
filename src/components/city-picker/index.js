import {queryProvinceData} from "@models/commonModels";
Component({
	properties: {
		value: {
			type: Object,
			value: {}
    },
    sourceData: {
      type: Array,
      value: [],
      observer: function(value){
        if(value && value.length) this.setData({provinceData: value});
      }
    }
	},
	data: {
		buttons: [{
			className: 'complete-gray-btn',
			text: '完成'
		}],
		isVisible: false,
		provinceData: [], // 省份列表
		cityData: [],  // 市区列表
		areaData: [], // 区列表
		selectedAddress: {}, // 选中的省市区
		selectedNavIndex: 0 //当前选中导航索引
  },
	ready: function() {
    // setTimeout(() => {
    //   this.init();
    // }, 1800)
	},
	methods: {
    init(){
      if(!this.data.provinceData.length){
        queryProvinceData().then(({result}) => {
          this.setData({provinceData: result});
        });
      }
    },
		open () {
      this.setData({ isVisible: true })
      this.init(); // 解决有时接口为200 数据不返回的情况
		},
		close () {
			this.setData({isVisible: false})
		},
		onConfirm({detail}) {
			const {className} = detail.item;
			if(className === 'complete-gray-btn') return;
			this.close();
			this.triggerEvent("change", this.data.selectedAddress)
		},
		onTab(e) {
			const {id} = e.target.dataset;
			this.setData({selectedNavIndex: id});
		},
		onCheckedProvince(e) {
			const {selectedAddress} = this.data;
			const {id, name} = e.target.dataset;
			this.setData({
				cityData:[],
				areaData: [],
				selectedAddress: {...selectedAddress, provinceId: id, provinceName: name, cityId: 0, cityName: '', areaId: 0, areaName: ''}
			});
		},
		onCheckedCity(e) {
			const {selectedAddress} = this.data;
			const {id, name} = e.target.dataset;
			this.setData({
				areaData: [],
				selectedAddress: {...selectedAddress, cityId: id, cityName: name, areaId: 0, areaName: ''}
			});
		},
		onCheckedArea(e) {
			const {selectedAddress} = this.data;
			const {id, name} = e.target.dataset;
			this.setData({
				selectedAddress: {...selectedAddress, areaId: id, areaName: name}
			});

		}
	},
	observers: {
		"isVisible" (isVisible) {
			if(isVisible){
				const {value} = this.data;
				this.setData({selectedAddress: value, selectedNavIndex: 0})
			}
		},
		"selectedAddress.provinceId" (provinceId) {
			if(!provinceId) return;
			const {buttons} = this.data;
			const cityData = this.data.provinceData.filter(item => item.id === provinceId);
			if(cityData.length && cityData[0].city.length) {
				buttons[0].className = 'complete-gray-btn';
				this.setData({cityData: cityData[0].city, selectedNavIndex: 1, buttons});
				return;
			}
			buttons[0].className = 'complete-btn';
			this.setData({buttons});
		},
		"selectedAddress.cityId" (cityId) {
			if(!cityId) return;
			const {buttons} = this.data;
			const areaData = this.data.cityData.filter(item => item.id === cityId);
			if(areaData.length && areaData[0].area.length){
				buttons[0].className = 'complete-gray-btn';
				this.setData({areaData: areaData[0].area, selectedNavIndex: 2, buttons});
				return;
			}
			buttons[0].className = 'complete-btn';
			this.setData({buttons});
		},
		"selectedAddress.areaId" (areaId) {
			if(!areaId) return;
			const {buttons} = this.data;
			buttons[0].className = 'complete-btn';
			this.setData({buttons});
		}
	}

})
