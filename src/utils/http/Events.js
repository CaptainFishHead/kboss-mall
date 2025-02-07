class EventsEmitter {
	constructor() {
		this.events = {}
	}

	// 事件监听
	on(event, caller) {
		if (!this.events[event]) {
			this.events[event] = []
		}
		this.events[event].push(caller)
	}

	// 监听一次
	once(event, caller) {
		const on = params => {
			this.off(event, on)
			caller(params)
		}
		// 用于取消订阅
		on.caller = caller
		this.on(event, on)
	}

	// 触发事件
	emit(event, params) {
		const callers = this.events[event]
		if (!callers || callers.length === 0) return null
		callers.forEach(caller => {
			caller(params)
		})
	}

	// 取消订阅
	off(event, caller) {
		const callers = this.events[event]
		if (!callers || callers.length === 0) return null
		if (!caller) {
			callers && callers.length && (callers.length = 0)
		} else {
			for (let i = 0, len = callers.length; i < len; i++) {
				const _caller = callers[i]
				if (caller === _caller) {
					callers.splice(i, 1)
					break
				}
			}
		}
	}
}

const eventEmitter = new EventsEmitter()

export default eventEmitter