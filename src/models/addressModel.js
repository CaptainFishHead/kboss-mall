import {post} from "../utils/http/index";
import {AUTHENTICATION_MODE} from "../const/index";
/**
 * 添加收货地址
 * @param acceptName 真实姓名
 * @param address  详细地址
 * @param areaId 区ID
 * @param areaName 区名称
 * @param cityId 市ID
 * @param cityName 市名称
 * @param provinceId 省ID,
 * @param provinceName 省名称
 * @param isDefault 是否是默认地址 1:默认 0:不默认
 * @param mobile 手机号
 */
export const createAddress = (params) => {
	return post(`/member/app/customer/address/save`, params, {
        authenticationMode: AUTHENTICATION_MODE.afterLoginContinue
    })
}
/**
 * 更新收货地址
 * @param id 收货地址ID 修改地址时必填
 */
export const updateAddress = (params) => {
	return post(`/member/app/customer/address/update`, params, {
        authenticationMode: AUTHENTICATION_MODE.afterLoginContinue
    })
}
/**
 * 查询我的地址信息
 * @param addressId 收货地址ID
 */
export const queryMyAdress= (params) => {
	return post(`/member/app/customer/address/info`, params, {
        authenticationMode: AUTHENTICATION_MODE.afterLoginContinue
    })
}
/**
 * 查询收货地址列表
 */
export const queryAddressList = (params) => {
	return post(`/member/app/customer/address/list`, params, {
        authenticationMode: AUTHENTICATION_MODE.afterLoginContinue
    })
}
/**
 * 查询默认收货地址
 */
export const queryDefaultAddress = (params, config = {authenticationMode: AUTHENTICATION_MODE.afterLoginContinue}) => {
	return post(`/member/app/customer/address/getDefault`, params, {
        authenticationMode: AUTHENTICATION_MODE.afterLoginContinue,
        ...config
    })
}
/**
 * 设置地址为默认地址
 * @param addressId 收货地址ID
 */
export const setDefaultAddress = (params) => {
	return post(`/member/app/customer/address/isDefault`, params, {
        authenticationMode: AUTHENTICATION_MODE.afterLoginContinue
    })
}
/**
 * 删除收货地址
 * @param addressId 收货地址ID
 */
export const delAddress = (params) => {
	return post(`/member/app/customer/address/delete`, params, {
        authenticationMode: AUTHENTICATION_MODE.afterLoginContinue
    })
}
