import { favoriteProductAdd, favoriteProductDel } from "../../models/productModel";
import { showToast } from "../toast/index";
import { TOAST_TYPE, FAVORITE_TYPE, SUBJECT_TYPE, PAGE_SOURCES } from "../../const/index";
import { track, TrackEventName } from "../../utils/sa";

Component({
	properties: {
		extClass: {
			type: String,
			value: ''
		}
	},
	methods: {

		//收藏触发
		/* 			isFavorite: 收藏动作
								index: 栏目索引、板块索引
										i: 元素索引（首页多模块才有）
				showAnimation: 是否展示收藏动画
				  subjectType: 标的物的类型
		*/
		favoriteBtn({ product, productId, isFavorite, index, i, showAnimation, subjectType }) {

      const pages = getCurrentPages()
      const currentPage = pages.at(-1) || {}
      const current_page = (PAGE_SOURCES[currentPage.route] || {}).title || ''
			//埋点（心愿单商品）
			track(TrackEventName.Boss_Favourite, {
				module_id: index || '',	//模块id
				module_name: product.code || product.productCode,	//模块名称
        commodity_name: product.title || product.name || product.productName,	//商品标题
        curr_page_info: {
          page_source: current_page,	//页面来源
        },
				action_time: new Date(),	//操作时间
				action_type: !isFavorite ? 'add' : 'remove',	//操作类型
			})

			const params = {
				subjectId: productId,
				favoriteType: FAVORITE_TYPE.LIKE, //收藏
				subjectType,
			}
			if (!isFavorite) {
				return this.favoriteAdd({ index, i, showAnimation, params })
			} else {
				return this.favoriteDel({ index, i, showAnimation, params })
			}
		},

		//收藏 添加
		favoriteAdd({ index, i, showAnimation, params }) {
			return favoriteProductAdd(params)
				.then((res) => {
					this.setData({ isFavorite: 1 })
					if (showAnimation) {
						const animation = wx.createAnimation()
						animation.rotateY(180).step()
						this.setData({
							favoriteAnimation: animation.export()
						})
					}
					this.triggerEvent('success', {
						index,
						i,
						isFavorite: 1
					})
					showToast({
						title: '已关注该商品，您可以在',
						desc: '我的-关注的商品中查看',
						type: TOAST_TYPE.SUCCESS,
						duration: 1000
					})
				})
				.catch((err) => {
					showToast({
						title: err.msg || '添加失败，请重试',
						type: TOAST_TYPE.WARNING,
						duration: 1000
					})
				})
		},
		//收藏 取消
		favoriteDel({ index, i, showAnimation, params }) {
			return favoriteProductDel(params)
				.then((res) => {
					this.setData({ isFavorite: 0 })
					if (showAnimation) {
						const animation = wx.createAnimation()
						animation.rotateY(0).step()
						this.setData({
							favoriteAnimation: animation.export()
						})
					}
					this.triggerEvent('success', {
						index,
						i,
						isFavorite: 0
					})
					showToast({
						title: '取消成功',
						type: TOAST_TYPE.SUCCESS,
						duration: 1000
					})
				})
				.catch((err) => {
					showToast({
						title: err.msg || '取消失败，请重试',
						type: TOAST_TYPE.WARNING,
						duration: 1000
					})
				})
		}
	}
});
