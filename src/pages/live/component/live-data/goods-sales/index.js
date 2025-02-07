import { liveRoomDataInfo } from '../../../models/live'
Component({
    properties: {
      roomId: {
        type: String,
        value: ''
      }
    },
    data: {
      dataInfo: {
        totalCommodityEposureCount: 0, // 商品总曝光数		
        totalClickCount: 0, // 商品总点击量			
        orderProductNum: 0, // 总成交商品成交件数			
        totalOrderPrice: 0 // 总成总交金额 单位:元	
      },
      productDataList: [],
      sortType: 'num', // num money
      sort: 'desc', // asc desc
      sortMap: {
        default: 'https://static.tojoyshop.com/images/wxapp-boss/live/sort-default-icon.png',
        asc: 'https://static.tojoyshop.com/images/wxapp-boss/live/sort-up-icon.png',
        desc: 'https://static.tojoyshop.com/images/wxapp-boss/live/sort-down-icon.png'
      },
    },
    lifetimes: {
      ready() {
        this.getData()
      }
    },
    methods: {
      // 获取商品数据
      getData() {
        liveRoomDataInfo({roomId: this.data.roomId}).then(({result}) => {
          this.setData({dataInfo: result})
          let list = result.productDataList.sort((a,b) => b.orderProductNum - a.orderProductNum)
          // list.sort((a,b) => b.orderProductNum - a.orderProductNum)
          this.setData({productDataList: list})
        })
      },
      // 商品排序
      sortData(e) {
        let type = e.currentTarget.dataset.type
        let list = []
        this.setData({sortType: type})
        let sort = this.data.sort === 'asc' ? 'desc' : 'asc'
        this.setData({sort})
        if (type === 'num') { // 按照销售数量排序
          list = this.data.productDataList.sort((a,b) => {
            if (sort === 'asc') { // 有小到大升序
              return a.orderProductNum - b.orderProductNum
            } else { // 由大到小降序
              return b.orderProductNum - a.orderProductNum
            }
          })
        } else { // 按照销售金额排序
          list = this.data.productDataList.sort((a,b) => {
            if (sort === 'asc') { // 有小到大升序
              return a.orderTotalPrice - b.orderTotalPrice
            } else { // 由大到小降序
              return b.orderTotalPrice - a.orderTotalPrice
            }
          })
        }
        this.setData({productDataList: list})
      }
    }
  })
