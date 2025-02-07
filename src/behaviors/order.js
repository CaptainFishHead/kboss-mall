import {buyOrder} from "@models/newCartModel";
import {
  TOAST_TYPE, ORDER_PAY_TYPE, ORDER_SOURCE, MESSAGE_TEMPLATE, WX_PAY_CANCEL
} from "../const/index";
import {templatePushAuthorization, wxPay} from "../utils/wxUtils";
import {hideToast, showToast} from "../components/toast/index";
import {authorizePushTemp} from "@models/messageModel";
import {updateOrderPayStatus} from "@models/orderModel";

export default Behavior({
  data: {
  },
  methods: {
    /* 取消订单 */
    /* 联系客服 */
    /* 查看物流 */
    /* 确认收货 */
    /* 再次购买 */
    /* 删除订单 */
    /* 提醒发货 */
  }
})