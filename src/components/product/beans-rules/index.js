
import { queryHealthBeanRules } from "@models/commonModels"
Component({
  data: {
    visible: false,
    awardNum: 0,
    rewardType: 1, //1商品奖励，2会员奖励
    levelName: '',
    beansRules: {},
  },
  options: {
    styleIsolation: 'apply-shared'
  },
  methods: {
    // 获取康豆奖励明细
    showRules(e) {
      const { awardnum, rewardtype, levelname } = e
      console.log(levelname)
      this.setData({
        awardNum: awardnum,
        rewardType: rewardtype,
        levelName: levelname||''
      })
      queryHealthBeanRules()
        .then(({ result }) => {
          this.setData({ beansRules: result })
          this.setData({ visible: true }) //显示
        })
    },
    close() {
      this.setData({ visible: false }) //关闭
    },
    touchMove() {
      return // 解决蒙层下页面滚动问题
    }
  }
});
