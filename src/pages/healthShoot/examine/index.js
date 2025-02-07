import { getLoggedUser } from "@utils/index";
import { getJkpParameter } from "../models/healthShootModel";
import env from "@config/env";

Page({
  data: {
    src_url: "",
    entry: "0", // 默认0
  },

  onShow() {
    this.getJkpData()
  },

  getJkpData() {
    getJkpParameter().then(({ result, code }) => {
      const user = getLoggedUser();
      let entry = this.data.entry;
      let outUserId = user.userId
      const { appId, nonce, sign, timestamp } = result;
      let url = `${env.FACE_DETECT_API}?appId=${appId}&timestamp=${timestamp}&nonce=${nonce}&sign=${sign}&entry=${entry}&outUserId=${outUserId}`;
      this.setData({
        src_url: url
      });
    })
  },
});
