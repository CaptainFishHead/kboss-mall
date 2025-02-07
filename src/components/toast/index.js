import { TOAST_TYPE } from "../../const/index";

const ICONS = {
  [TOAST_TYPE.INFO]: "https://static.tojoyshop.com/images/wxapp-boss/toast/icon-warning.png",
  [TOAST_TYPE.ERROR]: "https://static.tojoyshop.com/images/wxapp-boss/toast/icon-error.png",
  [TOAST_TYPE.SUCCESS]: "https://static.tojoyshop.com/images/wxapp-boss/toast/icon-success.png",
  [TOAST_TYPE.WARNING]: "https://static.tojoyshop.com/images/wxapp-boss/toast/icon-warning.png",
  [TOAST_TYPE.LOADING]: "https://static.tojoyshop.com/images/wxapp-boss/toast/loading.gif?v=1.0.1",
  [TOAST_TYPE.CIRCLE_LOADING]: "https://static.tojoyshop.com/images/kboss-agent/common/loading-circle.png",
};

export const showLoadingToast = () => {
  showToast({
    title: "加载中…",
    type: TOAST_TYPE.CIRCLE_LOADING,
    iconClassName: "loading-circle-img",
    imgMode: "aspectFit",
    loadingClass: "loading-box",
  });
};

const getCurrentPage = () => {
  const pages = getCurrentPages();
  return pages[pages.length - 1];
};
/**
 * 展示弹框
 * @param type  : string : [TOAST_TYPE.INFO|TOAST_TYPE.ERROR|TOAST_TYPE.SUCCESS|TOAST_TYPE.WARNING]
 * @param icon : string : icon图片地址
 * @param title : string : toast文案
 * @param desc
 * @param iconClassName  : string
 * @param titleClassName  : string
 * @param imgMode
 * @param duration  : number : 展示多少毫秒
 */
export const showToast = ({
  type = TOAST_TYPE.INFO,
  icon = ICONS[type],
  title,
  desc,
  iconClassName = "",
  titleClassName = "",
  imgMode = "scaleToFill",
  duration = 2000,
}) => {
  if (!title && type !== TOAST_TYPE.LOADING) return null;
  const page = getCurrentPage();
  clearTimeout(page._timeout);
  page.setData({
    "tj_toast.reveal": true,
  });
  wx.nextTick(() => {
    let animation = wx.createAnimation();
    animation.opacity(1).step();
    page.setData({
      tj_toast: {
        reveal: true,
        animationData: animation.export(),
        title,
        desc,
        type,
        icon,
        iconClassName,
        titleClassName,
        imgMode,
      },
    });
  });
  // loading 手动关闭
  if (type === TOAST_TYPE.LOADING) return null;

  page._timeout = setTimeout(() => {
    hideToast();
  }, duration);
};

export const hideToast = () => {
  return new Promise(resolve => {
    const page = getCurrentPage();

    clearTimeout(page._timeout);

    if (!page.data.tj_toast || !page.data.tj_toast.reveal) {
      resolve();
      return null;
    }

    const animTimer = setTimeout(() => {
      const animation = wx.createAnimation();
      animation.opacity(0).step();
      page.setData({
        "tj_toast.animationData": animation.export(),
      });
      clearTimeout(animTimer);
    }, 10);

    const hideTimer = setTimeout(() => {
      page.setData({
        tj_toast: { reveal: false },
      });
      resolve();
      clearTimeout(hideTimer);
    }, 60);
  });
};
