
import { queryMetricsHistory } from "@models/healthArchivesModel"
import { hideToast, showToast } from "@components/toast/index";
import { TOAST_TYPE, STORAGE_USER_FOR_KEY, CREATOR_TYPE_MAPS } from "@const/index";
import { formatDateInt } from "@utils/index";

Page({
  data: {
    CREATOR_TYPE_MAPS,
    isLoading: false,
    expandedHeight: 0,
    agentCoreIndicatorVOList: [],
    detailVisible: false, // 弹窗是否展示
    currentMetric: null
  },

  // 获取列表高度
  // handleShowAll(e) {
    // const { childindex, index } = e.currentTarget.dataset
    // const { agentCoreIndicatorVOList } = this.data
    // agentCoreIndicatorVOList[index].groups[childindex].isShow = !agentCoreIndicatorVOList[index].groups[childindex].isShow
    // const that = this
    // this.setData({ agentCoreIndicatorVOList }, () => {
    //   if (agentCoreIndicatorVOList[index].groups[childindex].isShow) {
    //     const query = wx.createSelectorQuery().in(that)
    //     query.selectAll('.explain-item').boundingClientRect(rects => {
    //       let expandedHeight = 0
    //       rects.forEach(rect => {
    //         expandedHeight = expandedHeight + rect.height
    //       })
    //       that.setData({
    //         expandedHeight: expandedHeight
    //       })
    //     }).exec();
    //   } else {
    //     this.setData({
    //       expandedHeight: 0
    //     })
    //   }
    // })
  // },
  // 打开弹窗
  openDetail(e){
    const { metric: currentMetric } = e.currentTarget.dataset
    this.setData({ detailVisible: true, currentMetric });
  },
  // 关闭弹窗
  closeDetail(){
    this.setData({ currentDetail: false, currentMetric: null })
  },

  parseDateStr(dateStr){
    const year = parseInt(dateStr.substring(0, 4))
    const month = parseInt(dateStr.substring(5, 7)) - 1
    return new Date(year, month)
  },

  parseTimeStr(timeStr){
    const dateStr = timeStr.replace(" ", "T")
    const date = new Date(dateStr)
    return date.getTime()
  },

  groupByTime(arr){
    const groupByMonth = arr.reduce((acc, item) => {
        const [datePart] = item.createdTime.split(' ');
        const [year, month] = datePart.split('-');
        const monthKey = `${year}年${month}月`;

        if (!acc[monthKey]) {
            acc[monthKey] = [];
        }
        acc[monthKey].push(item);
        return acc;
    }, {});
    return Object.keys(groupByMonth).map(month => {
        const monthGroup = groupByMonth[month];
        const groupByDayAndMinute = monthGroup.reduce((acc, item) => {
            const [datePart, timePart] = item.createdTime.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hour, minute, second] = timePart.split(':');
            const dayAndMinuteKey = `${month}月${day}日 ${hour}:${minute}`;

            if (!acc[dayAndMinuteKey]) {
                acc[dayAndMinuteKey] = [];
            }

            switch (item.indexLevel) {
              case -1:
                item.className = 'num_value_down'
                break;
              case 1:
                item.className = 'num_value_up'
                break;
              default:
                item.className = ''
                break;
            }
            acc[dayAndMinuteKey].push(item);
            return acc;
        }, {});

        const sortedContent = Object.keys(groupByDayAndMinute).map(dayAndMinute => ({
            time: dayAndMinute,
            creatorType: groupByDayAndMinute[dayAndMinute][0].creatorType,
            // isShow: false,
            groups: groupByDayAndMinute[dayAndMinute].sort((a, b) => this.parseTimeStr(b.createdTime) - this.parseTimeStr(a.createdTime))
        }));
        // console.log(10101100, sortedContent)
        return {
            time: month,
            groups: sortedContent
        };
    }).sort((a, b) => this.parseDateStr(b.time) - this.parseDateStr(a.time))
  },
  async getMetricsHistory(indexId){
    try{
      this.setData({ isLoading: true })
      showToast({ type: TOAST_TYPE.LOADING })
      const { result = {} } = await queryMetricsHistory({ str: indexId })
      const agentCoreIndicatorVOList  = this.groupByTime(result.sonIndexList) || []
      // console.log(agentCoreIndicatorVOList)
      this.setData({ agentCoreIndicatorVOList })
    } catch (err){
      showToast({
        title: err.msg || '暂无信息',
        type: TOAST_TYPE.WARNING
      })
    }

    hideToast()
    this.setData({ isLoading: false })
  },
  async onLoad(options) {
    const { indexId } = options
    await this.getMetricsHistory(indexId)
  }
});
