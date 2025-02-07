import eventEmitter from "./Events";

const DELAY = 5000
export const fnv32a = (str) => {
	const FNV1_32A_INIT = 0x811c9dc5;
	let hval = FNV1_32A_INIT;
	for (let i = 0; i < str.length; ++i) {
		hval ^= str.charCodeAt(i);
		hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
	}
	return hval >>> 0;
}
const PROMISE = {PENDING: `PENDING`, RESOLVE: 'resolve', REJECT: 'reject'}

class HttpTask {
	constructor() {
		// 任务集合
		this.tasks = {}
	}

	// 创建任务
	createTask(caller, {url, params}, delay = DELAY) {
		// 生成任务id
		const taskId = fnv32a(`${url}${params ? JSON.stringify(params) : ''}`)
		const task = this.tasks[taskId]

		return new Promise((resolve, reject) => {
			// 如果任务不存在，那么添加一个新的任务
			if (!task || task.status === PROMISE.REJECT || (task.lastTime + delay) < Date.now()) {
				const _task = {
					// 最后一次请求的时间
					lastTime: Date.now(), resp: {}, status: PROMISE.PENDING
				}
				this.tasks[taskId] = _task
				caller()
					.then(resp => {
						_task.resp = resp
						_task.status = PROMISE.RESOLVE
						resolve(resp)
					})
					.catch(err => {
						_task.resp = err
						_task.status = PROMISE.REJECT
						reject(err)
					})
					.finally(() => {
						eventEmitter.emit(taskId, _task)
					})
			} else if (task.status !== PROMISE.PENDING) {
				;(task.status === PROMISE.RESOLVE ? resolve : reject)(task.resp);
			} else {
				function _caller({status, resp}) {
					;(status === PROMISE.RESOLVE ? resolve : reject)(resp)
					eventEmitter.off(taskId, _caller)
				}

				eventEmitter.on(taskId, _caller)
			}
		})

	}

}

const httpTask = new HttpTask()

export default httpTask