// pages/address/index.js
import { queryAddressList, delAddress, setDefaultAddress } from "../../models/addressModel";
import { formatMobile } from "../../utils/index";
import { wxFuncToPromise } from "../../utils/wxUtils";
import { hideToast, showToast } from "../../components/toast/index";
import { TOAST_TYPE, RECEIVER_ADDRESS } from "../../const/index";

const app = getApp()

const default_btn = {
	text: '设为默认',
	extClass: 'default-btn'
}

const delete_btn = {
	text: '删除',
	extClass: 'delete-btn'
}

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		addressButtons: [default_btn, delete_btn],
		deleteBtn: [delete_btn],
		addressList: [],
		visible: false, // 删除确认弹窗是否展示
		checkedAddressId: 0, // 当前选中的地址ID
		addressId: 0, // 当前操作的地址ID
		isCheckbox: true, // 是否展示选择框
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onLoad(options) {
		const { isCheckbox } = options;
		isCheckbox === 'false' && this.setData({ isCheckbox: false })
	},
	onShow() {
		this.getAddress();
	},
	/**
	 * 查询收货地址列表
	 */
	getAddress() {
		showToast({ type: TOAST_TYPE.LOADING })
		queryAddressList().then(({ result }) => {
      const {addressList} = result || {};
			if (addressList && addressList.length) {
				addressList.forEach(item => {
					item.encryMobile = formatMobile(item.receiveMobile);
					item.unid = `${item.id}_${item.isDefault}`
				})
			}
			this.defaultChooseAddress(addressList);
			this.setData({ addressList });
		}).finally(() => {
			hideToast()
		})
	},
	/**
	 * 设置默认选中收货地址 更新storage
	 */
	defaultChooseAddress(data) {
		const chooseAddress = wx.getStorageSync(RECEIVER_ADDRESS);
		if (chooseAddress) {
			const chooseData = data.filter(item => item.addressId === chooseAddress.addressId);
			chooseData.length ? wx.setStorageSync(RECEIVER_ADDRESS, chooseData[0]) : wx.removeStorageSync(RECEIVER_ADDRESS);
			this.setData({ checkedAddressId: chooseAddress.addressId });
		} else {
      wx.removeStorageSync(RECEIVER_ADDRESS)
      this.setData({ checkedAddressId: 0 });
    }
	},
	/**
	 * 列表设为默认、删除按钮点击
	 */
	onButtonTap({ target, detail }) {
		const { index } = detail;
		const { isdefault } = target.dataset;
		if (!index && !isdefault) {
			this.onSetDefaultAddress();
			return;
		}
		this.openDialog();
	},
	/**
	 * 设置默认地址
	 */
	onSetDefaultAddress() {
		const { addressId } = this.data;
		showToast({ type: TOAST_TYPE.LOADING })
		setDefaultAddress({addressId }).then(() => {
			this.getAddress();
		}).finally(() => {
			hideToast()
			this.setData({ addressId: 0 })
		})
	},
	/**
	 * 删除地址
	 */
	onDelAddress() {
		const { addressId } = this.data;
		showToast({ type: TOAST_TYPE.LOADING })
		delAddress({ addressId }).then(() => {
      this.setData({ visible: false });
			showToast({
				title: '删除成功!',
				type: TOAST_TYPE.SUCCESS,
				duration: 2000
			})
			setTimeout(() => this.getAddress(), 1500)
    })
    .catch(() => {
      hideToast()
    })
    .finally(() => {
			this.setData({ addressId: 0 });
		})
	},
	/**
	 * 打开删除弹窗
	 */
	openDialog() {
		this.setData({ visible: true });
	},
	/**
	 * 关闭确认删除弹窗
	 */
	onCloseDelDialog() {
		this.setData({ visible: false });
	},
	/**
	 * 点击编辑按钮
	 */
	onEditAddress({ target }) {
		const { id } = target.dataset;
		wx.navigateTo({
			url: `/pages/address/createAddress/index?id=${id}`
		})
	},
	/**
	 * 选中默认地址后反显
	 */
	onChoseAddress({ currentTarget }) {
		const { isCheckbox } = this.data;
		if (!isCheckbox) return;
		const { addressinfo } = currentTarget.dataset;
		wx.setStorageSync(RECEIVER_ADDRESS, addressinfo);
		const eventChannel = this.getOpenerEventChannel()
		wxFuncToPromise('navigateBack')
			.then(() => {
				eventChannel.emit('updateFreight', addressinfo)
			})
	},
	/**
	 * slide显示时调用
	 */
	onShowSlide({ target }) {
		const { id } = target.dataset;
		this.setData({ addressId: id });
	},
	/**
	 * slide隐藏时调用
	 */
	onHideSlide() {
		this.setData({ addressId: 0 });
	},
	/**
	 * 跳转新增地址
	 */
	onCreateAddress() {
		wx.navigateTo({
			url: '/pages/address/createAddress/index',
		})
	},
	//分享
	onShareAppMessage(res) {
		return app.globalData.shareInfo
	},
})