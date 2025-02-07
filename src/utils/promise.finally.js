function _finally(callback) {
	const constructor = this.constructor;

	if (typeof callback === 'function') {
		return this.then(value => constructor.resolve(callback()).then(() => value),
			reason => constructor.resolve(callback()).then(() => {
				throw reason;
			}));
	}

	return this.then(callback, callback);
}

Promise.prototype.finally = Promise.prototype.finally || _finally