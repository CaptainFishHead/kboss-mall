// components/newconmer/newconmer.ts
import {
  newcomerRecord
} from '@models/carrierModel'
import {track, TrackEventName} from "@utils/sa";
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    newcomerList: { //新人引导数据
      type: Array,
      value: []
    },
    newcomerShow: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    newChecked: false,
    selectedList: [] // 新人引导数据选中的列表(多选存储的数组)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 新用户弹窗
    clickNewmoer(e) {
      let this_checked = e.currentTarget.dataset.id // 获取对应的条目id
      let List = this.data.newcomerList // 获取Json数组
      let selectedList = this.data.selectedList // 获取已选中的数据
      for (let i = 0; i < List.length; i++) {
        if (List[i].id == this_checked) {
          if (List[i].ischecked) {
            // 已选中，取消选中状态并从已选列表中移除
            List[i].ischecked = false
            let index = selectedList.findIndex(item => item === List[i].id)
            if (index !== -1) {
              selectedList.splice(index, 1)
            }
          } else {
            // 未选中，设置为选中状态并添加到已选列表中
            List[i].ischecked = true;
            selectedList.push(List[i]);
          }
          break
        }
      }
      this.setData({
        newcomerList: List,
        selectedList: selectedList
      });
    },
    // 关闭新用户弹窗
    closeNewcomer() {
      // 点击提交
      let contentList = []
      let selectidList = []
      this.data.selectedList.forEach((item,index) => {
        contentList.push(item.data)
        selectidList.push(item.id)
      })

      let params = {
        ids: selectidList,
        noMore: this.data.newChecked ? '1' : '0'
      }
      
      track(TrackEventName.Boss_NoviceGuide, { content_text: contentList });
      // 如果本地newChecked为真 则保存本地 下次判断是否勾选过不再提示
      if (this.data.newChecked) {
        wx.setStorageSync('noMore', this.data.newChecked)
      }
      newcomerRecord(params).then((result) => {})
      this.triggerEvent('addInfo',{newcomerShow:false})//通过triggerEvent将参数传给父组件

    },
    // 不再提示
    checkboxChange(e) {
      this.setData({
        newChecked: !this.data.newChecked
      })
    }
  }
})