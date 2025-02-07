/**
 * 时长格式化
 * @param { number } timeInterval 时间区间毫秒数
 * @param { string } format 时间格式 'h:m:s' ｜ 'hh:mm:ss' ｜ 'h小时m分钟s秒'
 * @return { string }  01:35:21
 *
 */
export const formatTimeInterval = (timeInterval: number, format = 'hh:mm:ss'): string => {
	let hDot = timeInterval / 1000 / 60 / 60
	let h = Math.floor(hDot)
	let hTest = h < 10 ? '0' + h : h + ''

	let mDot = (hDot - h) * 60
	let m = Math.floor(mDot)
	let mTest = m < 10 ? '0' + m : m + ''

	let sDot = (mDot - m) * 60
	let s = Number(sDot.toFixed())
	let sTest = s < 10 ? '0' + s : s + ''
	let time = format.replace('hh', hTest).replace('mm', mTest).replace('ss', sTest).replace('h', h + '').replace('m', m + '').replace('s', s + '')
	return time
}

/**
 * 倒计时格式化
 * @param { number } countdown 倒计时毫秒数
 * @return { string } 2天5小时24分 或 5分24秒
 *
 */
export const formatCountdown = (countdown: number, showSecond: boolean = true): string => {

	let dDot = countdown / 1000 / 60 / 60 / 24
	let d = Math.floor(dDot)
	let dText = d > 0 ? d + '天' : ''

	let hDot = (dDot - d) * 24
	let h = Math.floor(hDot)
	let hTest = h + '小时'

	let mDot = (hDot - h) * 60
	let m = Math.floor(mDot)
	let mTest = m + '分钟'

	let sDot = (mDot - m) * 60
	let s = Number(sDot.toFixed())
	let sTest = s + '秒'

	let hShow = h > 0 || h === 0 && (d > 0)
	let mShow = m > 0 || m === 0 && (h > 0 || d > 0)
	let sShow = h === 0 && d === 0 && (s > 0 || s === 0 && m > 0) && showSecond

	return dText + (hShow ? hTest : '') + (mShow ? mTest : '') + (sShow ? sTest : '')
}