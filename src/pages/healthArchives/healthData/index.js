import { queryUserHealth } from "@models/healthInfo"
import { queryMetricsCategory, queryAllDataInMetrics } from "@models/healthArchivesModel"
import { hideToast, showToast } from "@components/toast/index";
import { TOAST_TYPE, STORAGE_USER_FOR_KEY, } from "@const/index";
import { getImgBoxSize, debounce, formatDateInt } from '@utils/index'

Page({
  data:{
    toView: '',
    activeIndex: 0,
    title: [],
    isHidden: true,
    scrollLock:false,//滑动枷锁
    isScroll:'',

    top: 0,
    healthData: [],
    currentScrollTop: 0
},
//点击锚点跳转
  jumpTo: async function (e) {
    const { index } = e.detail
    let activeIndex = e.detail.item.type;
    const result = await getImgBoxSize('.health-data', this)
    let top = 0
    for (let i = 0; i < index; i++) {
      top+=result[i].height
    }

    this.setData({ top })
  },
 
  //scroll-view滚动监听事件
  toScroll: debounce(async function (e) {
    const { activeIndex, scrollLock, currentScrollTop } = this.data
  
    const { scrollTop, scrollHeight } = e.detail

    this.setData({ currentScrollTop: scrollTop })

    if(scrollTop <= 50){
      this.setData({ activeIndex: 0 })
      return
    }

    if(scrollLock && currentScrollTop < scrollTop){
      return
    }else{
      this.setData({ scrollLock: false })
    }

    const result = await getImgBoxSize('.health-data', this)
    let height = 0
    let tepmActive = 0

    const maxHeight = result.reduce((accumulator, currentValue) => accumulator + currentValue.height, 0);

    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      height += element.height
      if(scrollTop <= height){
        tepmActive = i
        break
      }
    }

    this.setData({ activeIndex: tepmActive + 1 })
  }, 100),
 
  async onScrolltolower(){
    this.setData({ scrollLock: true })
    const result = await getImgBoxSize('.health-data', this)
    this.setData({ activeIndex: result.length - 1 })
  },
//停止滚动，防止锚点位置过低，界面滚动时无效的情况
  endScroll(e){
    this.setData({
      scrollLock:true
    });
  },

  async getMetricsCategory(){
    try{
      showToast({ type: TOAST_TYPE.LOADING })
      const result = await queryMetricsCategory()
      hideToast()
      return result
    } catch (err){
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }

    this.setData({ isLoading: false })
  },

  async handlerHealthData(){

    try{
      showToast({ type: TOAST_TYPE.LOADING })
      const { result: categories } = await queryMetricsCategory()
      const { result: metrics } = await queryAllDataInMetrics()
      const list = categories.map(category => {
        return {
          ...category,
          content: metrics.filter(metric => metric.categoryId === category.categoryId).map(metric => {
            metric.str = metric.indexName == "血压" ? `${metric.sonIndexList[1].indexData}/${metric.sonIndexList[0].indexData}` : (metric.sonIndexList.sort((a, b) => formatDateInt(b.createdTime) - formatDateInt(a.createdTime)))[0].indexData
            // if(metric.indexName && metric.indexName.length >= 7 || (metric.str + metric.sonIndexList[0].indexUnit).length >= 12){
            //   metric.solt = '1'
            // }
            return {
              ...metric,
              indexUnit: metric.sonIndexList[0].indexUnit,
              indexLevel: !!metric.sonIndexList.filter(item => !!item.indexLevel).length ? 1 : 0,
            }
          })
        }
      })
      const healthData = list.filter(item => item.content.length)
      // console.log(111, healthData)

      this.setData({ healthData })
      hideToast()
    } catch (err){
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }

    this.setData({ isLoading: false })
  },

  onLoad: async function (options) {
    this.handlerHealthData()
  }
});