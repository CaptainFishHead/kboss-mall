import {post} from "@utils/http/index";

/**
 * 重点科室列表
 */
export const  getKeynoteDeptList = (params) => {
  return post(`/scene/app/service/scene/v1/doctor/getKeynoteDeptList`, params)
}

/**
 * 全部科室列表
 */
export const  getDeptList = (params) => {
  return post(`/scene/app/service/scene/v1/doctor/getDeptList`, params)
}

/**
 * 查询区域列表 
 */
export const  getRegionList = (params) => {
  return post(`/scene/app/service/scene/v1/doctor/getRegionList`, params)
}

/**
 * 分页查询医生列表
 */
export const  getPageList = (params) => {
  return post(`/scene/app/service/scene/v1/doctor/pageList`, params)
}

/**
 * 查询医生详情
 */
export const  getDoctorDetail = (params) => {
  return post(`/scene/app/service/scene/v1/doctor/detail`, params)
}

/**
 * 查询医生预约时间
 */
export const  getDoctorSchedule = (params) => {
  return post(`/scene/app/service/scene/v1/doctor/schedule`, params)
}
/**
 * 医生订单上传病例报告图片
 */
export const  uploadFile = (params) => {
  return post(`/scene/app/service/scene/v1/doctor/uploadFile`, params)
}
/**
 * 确认预约
 */
export const  submitApptInfo = (params) => {
  return post(`/order/app/service/order/confirm`, params)
}
/**
 * 健康顾问头像
 */
export const  getAdviserHead= (params) => {
  return post(`/order/app/service/order/relationShip`, params)
}
/**
 * 查询医生地区列表 
 */
export const  getDistrictList = (params) => {
  return post(`/scene/app/service/scene/v1/doctor/getDistrictList`, params)
}
