const queues: { delay: number, callback: any }[] = []
type QueueTypeOptions = { isStart?: boolean, delay: number }
export const queuePush = (arg: any, options: QueueTypeOptions = {isStart: false, delay: 30}) => {
	queues.push({delay: queues.length * options.delay, callback: arg})
	if (options.isStart) {
		setTimeout(() => {
			queuePop()
		}, queues.length * options.delay)
	}
}

export const queuePop = () => {
	const queue = queues.shift()
	if (!queue) return null
	if (typeof queue.callback === 'function') {
		queue.callback()
	}
	return queue
}