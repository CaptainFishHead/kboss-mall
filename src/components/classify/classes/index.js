// components/classify/goods-classify/index.js
import {queryClassify} from "../../../models/classifyModel";
import {track, TrackEventName} from "../../../utils/sa";

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		value: {
			type: String,
			value: ''
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		classifyList: [],
		currClassifyId: 0
	},
	lifetimes: {
		ready() {
			queryClassify()
				.then(({result}) => {
					if (result.length) {
						const {currClassifyId} = this.data;
						this.setData({classifyList: result || []});
						currClassifyId ? this.eventCheckedClassifyId(currClassifyId) : this.eventCheckedClassifyId(result[0].id);
						this.getHtmlHeight().then(({scrollViewHeight, scrollItem}) => {
							this.setData({scrollViewHeight, scrollItem});
						})
					}
				})
		}
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		handleClassify({currentTarget}) {
			const {dataset} = currentTarget;
      const {currClassifyId} = this.data;
      dataset.id !== currClassifyId && this.eventCheckedClassifyId(dataset.id);
		},
		/* 更新当前分类信息 */
		eventCheckedClassifyId(classifyId, classifyName) {
      const {classifyList} = this.data;
      const currentClassify = classifyList.filter(item => item.id === classifyId);
      const currentClassifyName = currentClassify.length ? currentClassify[0].categoryName : null;
			const currentIndex = classifyList.findIndex(item => item.id === classifyId);
			const preId = currentIndex > 0 ? classifyList[currentIndex - 1].id : undefined;
			const nextId = currentIndex < classifyList.length - 1 ? classifyList[currentIndex + 1].id : undefined;
			this.scrollViewCenter(currentIndex); // 设置当前选中的分类垂直居中
			this.setData({currClassifyId: classifyId}); //更新data中当前分类值
      this.triggerEvent("change", {preId, currId: classifyId, currName: currentClassifyName, nextId});// 抛出当前分类ID、上个分类ID、下个分类ID
      track(TrackEventName.Boss_TabClick, {
        cate_1: currentClassifyName,
      });
		},
		scrollViewCenter(index) {
			const {scrollViewHeight, scrollItem} = this.data;
			if (!scrollViewHeight && !scrollItem) {
				this.getHtmlHeight().then(({scrollViewHeight, scrollItem}) => {
					this.setData({
						scrollTop: index * scrollItem - scrollViewHeight / 2
					});
				})
				return;
			}
			this.setData({
				scrollTop: index * scrollItem - scrollViewHeight / 2
			});
		},
		getHtmlHeight() {
			return new Promise(resolve => {
				const query = this.createSelectorQuery();
				query.selectAll('.scrollbox, .scroll-view-item').boundingClientRect((rect) => {
					if (rect.length && rect.length > 2) {
						resolve({
							scrollViewHeight: rect[0].height,
							scrollItem: rect[1].height
						});
					}
				}).exec();
			})
		}
	},
	observers: {
		"value" (value) {
			Number(value) && this.eventCheckedClassifyId(value);
		}
	}
})
