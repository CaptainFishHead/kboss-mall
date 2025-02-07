/**
 * 将数字格式化为两位数
 * @param num
 * @returns {string}
 */
const dNumber = (num) => {
	return num < 10 ? ('0' + num) : num
}
Date.prototype.dateFormat = Date.prototype.dateFormat || function (format) {
	/* eslint-disable no-useless-escape */
	if (isNaN(this.getTime())) {
		return ''
	}
	let formatString = format.match(/[A-Za-z]{1,4}|[\--\/-年-月-日-时-分-秒-\s-:]/g)
	let date = []
	for (let i = 0, len = formatString.length; i < len; i++) {
		switch (formatString[i]) {
			case 'yyyy':
				date.push(this.getFullYear())
				break
			case 'YYYY':
				date.push(this.getFullYear())
				break
			case 'yy':
				date.push(this.getYear())
				break
			case 'MM':
				let month = this.getMonth() + 1
				date.push(dNumber(month))
				break
			case 'M':
				date.push(this.getMonth() + 1)
				break
			case 'dd':
				date.push(dNumber(this.getDate()))
				break
			case 'DD':
				date.push(dNumber(this.getDate()))
				break
			case 'd':
				date.push(this.getDate())
				break
			case 'HH':
				date.push(dNumber(this.getHours()))
				break
			case 'hh':
				let hours = this.getHours()
				date.push(dNumber(Math.abs(hours > 12 ? (hours - 12) : hours)))
				break
			case 'H':
				date.push(this.getHours())
				break
			case 'mm':
				date.push(dNumber(this.getMinutes()))
				break
			case 'm':
				date.push(this.getMinutes())
				break
			case 'ss':
				date.push(dNumber(this.getSeconds()))
				break
			case 's':
				date.push(this.getSeconds())
				break
			default:
				date.push(formatString[i])
				break
		}
	}
	return date.join('')
}