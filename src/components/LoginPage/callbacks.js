const callbackQueue = []
export const addCallback = (func) => {
	callbackQueue.push(func)
}

export const clearCallback = ()=>{
	callbackQueue.length = 0
}

export const executeCallbacks = (arg) => {
	callbackQueue.forEach((item, index, arr) => {
		if (item instanceof Function) {
			callbackQueue.splice(index, 1)
			item(arg)
		}
	})
	clearCallback()
}