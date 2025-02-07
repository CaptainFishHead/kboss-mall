// pages/user/index.js
import { cosUploadTempSecret } from "@models/commonModels";
import Cos from "cos-wx-sdk-v5";
import env from "../../../config/env";
import { TOAST_TYPE, STORAGE_USER_FOR_KEY } from "../../../const/index";
import { updateUserInfo, queryUserInfo, getMemberLevel } from "../../../models/userModel";
import { hideToast, showToast } from "../../../components/toast/index";
import { formatMobile } from "../../../utils/index";
import { wxFuncToPromise } from "@utils/wxUtils";
const defaultAvatarUrl = "https://static.tojoyshop.com/images/wxapp-boss/healthInfo/archives/icon-default-head.png";

import { uploadHealthReport } from "@models/healthArchivesModel";

Page({
  data: {
    avatarUrl: "", // 用户头像
    nickname: "", // 用户昵称
    levelName: "", // 会员等级
    mobile: "", // 用户手机号
    serverAvatarUrl: "",
    showNicknameInput: false, // 是否显示昵称输入框
  },

  onLoad() {
    // 获取本地的用户信息
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY);
    this.getLevel();
    this.setData({
      avatarUrl: user.avatarUrl || defaultAvatarUrl,
      serverAvatarUrl: user.avatarUrl || defaultAvatarUrl,
      nickname: user.nickName || user.mobile,
      mobile: user.mobile ? formatMobile(user.mobile) : "",
    });
  },

  //获取会员等级
  getLevel() {
    getMemberLevel({}).then(({ result }) => {
      this.setData({ levelName: result.levelName || "" });
    });
  },

  // 当用户选择了头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData(
      {
        avatarUrl,
      },
      () => {
        this.uploadImg();
      }
    );
  },

  // 上传头像
  async uploadImg() {
    // 初始化实例
    const cos = new Cos({
      SimpleUploadMethod: "postObject",
      async getAuthorization(options, callback) {
        const { result } = await cosUploadTempSecret({
          dir: "image",
        });
        callback({
          TmpSecretId: result.secretId,
          TmpSecretKey: result.secretKey,
          SecurityToken: result.token,
          StartTime: result.startTime, // 时间戳，单位秒，如：1580000000
          ExpiredTime: result.endTime, // 时间戳，单位秒，如：1580000900
        });
      },
      Domain: env.VITE_DOMAIN,
      Protocol: env.VITE_PROTOCOL,
    });

    let tempFilePath = this.data.avatarUrl;
    let fileType = "image";

    cos.postObject(
      {
        Bucket: env.VITE_BUCKET,
        /* 必须 */
        Region: env.VITE_REGION,
        /* 存储桶所在地域，必须字段 */
        Key: `/${fileType}/${tempFilePath.substr(tempFilePath.lastIndexOf(".") + 1)}/${tempFilePath.substr(
          tempFilePath.lastIndexOf("/") + 1
        )}`,
        FilePath: tempFilePath,
        onProgress(info) {},
      },
      (err, data) => {
        console.log(data, "data");
        hideToast();
        // 上传成功，调用接口更新用户头像
        // this.updateUser(url)
        this.setData({
          serverAvatarUrl: `https://${data.Location}`,
        });
      }
    );
  },
  async handleUpload() {
    // 初始化实例
    const cos = new Cos({
      SimpleUploadMethod: "postObject",
      async getAuthorization(options, callback) {
        const { result } = await cosUploadTempSecret({
          dir: "image",
        });
        callback({
          TmpSecretId: result.secretId,
          TmpSecretKey: result.secretKey,
          SecurityToken: result.token,
          StartTime: result.startTime, // 时间戳，单位秒，如：1580000000
          ExpiredTime: result.endTime, // 时间戳，单位秒，如：1580000900
        });
      },
      Domain: env.VITE_DOMAIN,
      Protocol: env.VITE_PROTOCOL,
    });

    wxFuncToPromise(`chooseMedia`, {
      count: 1,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      camera: "back",
    }).then(res => {
      let tempFilePath = res.tempFiles[0].tempFilePath;
      let fileType = "image";
      cos.postObject(
        {
          Bucket: env.VITE_BUCKET,
          /* 必须 */
          Region: env.VITE_REGION,
          /* 存储桶所在地域，必须字段 */
          Key: `/${fileType}/${tempFilePath.substr(tempFilePath.lastIndexOf(".") + 1)}/${tempFilePath.substr(
            tempFilePath.lastIndexOf("/") + 1
          )}`,
          FilePath: tempFilePath,
          onProgress(info) {},
        },
        (err, data) => {
          console.log("cos回调--err", err);
          console.log("cos回调--data", data);
          let imgUrl = `https://${data.Location || ""}`;
          console.log("cos-imgUrl", imgUrl);
          uploadHealthReport({ str: imgUrl })
            .then(({ result }) => {
              this.setData({ isUpload: true });
            })
            .catch(err => {
              console.log(err);
            });
        }
      );
    });
  },
  // 更新用户头像
  // updateUser(avatarUrl) {
  //   const user = wx.getStorageSync(STORAGE_USER_FOR_KEY)
  //   updateUserInfo({
  //     avatarUrl,
  //     nickName: user.nickName
  //   }).then(() => {
  //     showToast({
  //       title: '已保存',
  //       type: TOAST_TYPE.SUCCESS
  //     })
  //     this.requestUserInfo()
  //   }).catch(({
  //     msg
  //   }) => {
  //     showToast({
  //       title: msg || '保存头像失败，请稍候再试。',
  //       type: TOAST_TYPE.WARNING
  //     })
  //   })
  // },

  // 更新本地的用户数据
  requestUserInfo() {
    queryUserInfo()
      .then(res => {})
      .catch(err => {});
  },

  // 清空昵称输入框
  clearNickname() {
    this.setData({
      nickname: "",
    });
  },

  // 更新用户昵称
  saveNickname(e) {
    // if (!this.data.showNicknameInput) return
    let { serverAvatarUrl, nickname } = this.data;
    const user = wx.getStorageSync(STORAGE_USER_FOR_KEY);
    let nickName = e.detail.value.nickName || nickname;
    const _nickName = nickName.replace(/[\u4e00-\u9fa5]/gu, "aa");
    const reg = /^[\w\S]{4,20}$/;

    if (!nickName || nickName.length === 0) {
      showToast({
        type: TOAST_TYPE.WARNING,
        title: "请输入昵称",
      });
      return;
    }

    if (!reg.test(_nickName)) {
      showToast({
        type: TOAST_TYPE.WARNING,
        title: "昵称输入内容应为（2-10个汉字4-20个字符）！",
      });
      return;
    }

    if (this.isEmojiCharacter(nickName)) {
      showToast({
        type: TOAST_TYPE.WARNING,
        title: "昵称中含有特殊字符，修改下吧",
      });
      return;
    }

    updateUserInfo({
      nickName,
      avatarUrl: serverAvatarUrl,
    })
      .then(() => {
        showToast({
          title: "已保存",
          type: TOAST_TYPE.SUCCESS,
        });
        // this.setData({
        //   showNicknameInput: false,
        //   nickname: nickName
        // })
        // this.requestUserInfo()

        queryUserInfo()
          .then(res => {
            wx.navigateBack();
          })
          .catch(err => {});
      })
      .catch(({ msg }) => {
        showToast({
          title: msg || "保存失败，请稍候再试。",
          type: TOAST_TYPE.WARNING,
        });
      });
  },

  // 显示用户昵称输入框
  showNicknameInput() {
    this.setData({
      showNicknameInput: true,
    });
  },

  // 修改输入框内容回调
  changeNickname(e) {
    this.setData({
      nickname: e.detail.value,
    });
  },

  isEmojiCharacter(substring) {
    for (var i = 0; i < substring.length; i++) {
      var hs = substring.charCodeAt(i);
      if (0xd800 <= hs && hs <= 0xdbff) {
        if (substring.length > 1) {
          var ls = substring.charCodeAt(i + 1);
          var uc = (hs - 0xd800) * 0x400 + (ls - 0xdc00) + 0x10000;
          if (0x1d000 <= uc && uc <= 0x1f77f) {
            return true;
          }
        }
      } else if (substring.length > 1) {
        var ls = substring.charCodeAt(i + 1);
        if (ls == 0x20e3) {
          return true;
        }
      } else {
        if (0x2100 <= hs && hs <= 0x27ff) {
          return true;
        } else if (0x2b05 <= hs && hs <= 0x2b07) {
          return true;
        } else if (0x2934 <= hs && hs <= 0x2935) {
          return true;
        } else if (0x3297 <= hs && hs <= 0x3299) {
          return true;
        } else if (
          hs == 0xa9 ||
          hs == 0xae ||
          hs == 0x303d ||
          hs == 0x3030 ||
          hs == 0x2b55 ||
          hs == 0x2b1c ||
          hs == 0x2b1b ||
          hs == 0x2b50
        ) {
          return true;
        }
      }
    }
  },
});
