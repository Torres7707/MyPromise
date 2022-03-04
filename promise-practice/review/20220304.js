function Promise(executor) {
	this.PromiseStatus = 'pending';
	this.PromiseResult = null;
	this.callbacks = [];

	const self = this;
	function resolve(data) {
		if (this.PromiseStatus !== 'pending') return;
		this.PromiseStatus = 'fulfilled';
		this.PromiseResult = data;

		setTimeout(() => {
			self.callbacks.forEach((i) => {
				i.onFulfilled();
			});
		});
	}

	function reject(data) {
		if (this.PromiseStatus !== 'pending') return;
		this.PromiseStatus = 'rejected';
		this.PromiseResult = data;

		setTimeout(() => {
			self.callbacks.forEach((i) => {
				i.onRejected();
			});
		});
	}

	try {
		executor(resolve, reject);
	} catch (e) {
		reject(e);
	}
}

Promise.prototype.then = function (onFulfilled, onRejected) {
	return new Promise((resolve, reject) => {
		const self = this;
		function callback(type) {
			try {
				const result = type(self.PromiseResult);
				if (result instanceof Promise) {
					result.then(
						(v) => {
							resolve(v);
						},
						(r) => {
							reject(r);
						}
					);
				} else {
					resolve(result);
				}
			} catch (e) {
				reject(e);
			}
		}
		if (this.PromiseStatus === 'fulfilled') {
			setTimeout(() => {
				callback(onFulfilled);
			});
		}

		if (this.PromiseStatus === 'rejected') {
			setTimeout(() => {
				callback(onRejected);
			});
		}

		if (this.PromiseStatus === 'pending') {
			this.callbacks.push({
				onFulfilled: function () {
					callback(onFulfilled);
				},
				onRejected: function () {
					callback(onRejected);
				},
			});
		}
	});
};

Promise.prototype.catch = function (onRejected) {
	return this.then(undefined, onRejected);
};

Promise.resolve = function (value) {
	return new Promise((resolve, reject) => {
		if (value instanceof Promise) {
			value.then(
				(v) => {
					resolve(v);
				},
				(r) => {
					reject(r);
				}
			);
		} else {
			resolve(value);
		}
	});
};

Promise.reject = function (reason) {
	return new Promise((resolve, reject) => {
		reject(reason);
	});
};

Promise.all = function (promiseArr) {
	return new Promise((resolve, reject) => {
		let resultArr = [];
		promiseArr.forEach((item, index) => {
			item.then(
				(v) => {
					resultArr[index] = v;
					if (index === promiseArr.length - 1) {
						resolve(resultArr);
					}
				},
				(r) => {
					reject(r);
				}
			);
		});
	});
};

Promise.race = function (promiseArr) {
	return new Promise((resolve, reject) => {
		promiseArr.forEach((item, index) => {
			item.then(
				(v) => {
					resolve(v);
				},
				(r) => {
					reject(r);
				}
			);
		});
	});
};
