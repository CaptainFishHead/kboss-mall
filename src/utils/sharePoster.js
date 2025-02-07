import {getActorInfo} from "../models/commissionModel";
import {queryWxQRCodeModel} from "../models/wxQRCodeModel";
import {stringify} from "qs";
import { wxFuncToPromise } from "./wxUtils";
import { SOURCE, STORAGE_USER_FOR_KEY } from "../const/index";
import env from "../config/env";

/**
 * 获取分享Id
 * @param _page 页面信息
    * @param pageUrl 页面Url（注：以/开头的地址 /pages/index/index）
    * @param pageOptions 页面携带的参数
 */
export const getPageShareInfo = async(_page) => {
  let pagePath = '';
  let pageParams = {};
  if(!_page) {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length-1];
    pagePath = currentPage.route;
    pageParams = currentPage.options;
  } else {
    pagePath = _page.pageUrl;
    pageParams = _page.pageOptions;
  }
  if(pageParams.reboot) delete pageParams.reboot;
  // 获取用户标识码，有标识码position:'perf',targetId:'获取用户标识码'
  const params = { source: SOURCE.BH_MALL,...pageParams};
  const user = wx.getStorageSync(STORAGE_USER_FOR_KEY)
  if (user && user.userId) {
    const {result:{serialNo}} = await getActorInfo();
    if(serialNo) Object.assign(params,{source:SOURCE.BH_MALL,position:'perf', targetId: serialNo});
  }
  const {result} = await queryWxQRCodeModel({
    path: pagePath,
    params,
    width: 430,
    env: env.envVersion === 'release' ? 'release' : 'trial'
  })
  return result || {};
}
/**
 * 跳转海报页
 * @param type 海报类型 1:海报 2:分享码
 * @param shareParams 海报参数
 * @param shareId 分享ID  通过getPageShareInfo函数获取
 * @param title 分享标题
 * @param imgUrl 分享头图
 *  */
export const toPosterPage = ({type, shareParams, shareId, title, imgUrl}) => {
  wxFuncToPromise(`navigateTo`, {
    url: `/pages/poster/index`,
  })
    .then((res) => {
      res.eventChannel.emit('shareData', {
        type,
        shareParams,
        title,
        imgUrl,
        path: `/pages/index/index?v2_code=${shareId}`
      });
    })
}