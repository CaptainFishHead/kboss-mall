import { post } from "../utils/http/index";
/**
 * 我的-调理方案 & 我的服务 红点
 */
export const reqtipsMine = (params) => {
  return post(`/member/app/red/tips/mine`, params)
}
/**
 * 上报进入了哪一个二级: 1 调理方案 | 2 我的服务
 */
export const reqtipsRead = (params) => {
  return post(`/member/app/red/tips/read`, params)
}
