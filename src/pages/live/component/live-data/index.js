// import { IRoomInfo } from '../../../models/types/live'
// import {formatTimeInterval} from '../../utils/index'
// import { liveRecommendList } from "../../models/live"

Component({
    properties: {
      liveState: {
        type: Number,
        value: 0
      },
      roomId: {
        type: String,
        value: ''
      }
    },
    data: {
      activeType: 'live',
    },
    lifetimes: {
      ready() {}
    },
    methods: {
      tabChange(e) {
        this.setData({activeType: e.currentTarget.dataset.type})
      },
    }
  })
