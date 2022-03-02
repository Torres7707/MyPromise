function Promise(executor) {
	this.PromiseStatus = 'pending';
	this.PromiseResult = null;
	this.callbacks = [];

	const self = this;

	function resolve(data) {
		if (this.PromiseStatus !== 'pending') return;
		this.PromiseStatus = 'fulfilled';
		this.PromiseResult = data;

		// then的回调函数的异步执行
		setTimeout(() => {
			this.callbacks.forEach((item) => {
				item.onFulfilled();
			});
		});
	}

	function reject(data) {
		if (this.PromiseStatus !== 'pending') return;
		this.PromiseStatus = 'rejected';
		this.PromiseResult = data;

		setTimeout(() => {
			this.callbacks.forEach((item) => {
				item.onRejected();
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
	const self = this;
	return new Promise((resolve, reject) => {
		function callback(type) {
			try {
				let result = type(self.PromiseResult);
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

Promise.reject = function (value) {
	return new Promise((resolve, reject) => {
		reject(value);
	});
};

Promise.all = function (promiseArr) {
	return new MyPromise((resolve, reject) => {
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

Promise.retry = function (fn, times) {
	return new Promise(async (resolve, reject) => {
		while (times--) {
			try {
				let result = await fn(); // 1.若fn失败，则返回一个失败的promise，会被catch捕捉到
				resolve(result);
				break; // 成功则跳出循环
			} catch (err) {
				// 2.catch捕捉到fn的失败结果，若times没到0，则继续循环，若times到0，则reject，改变new Promise的状态为失败
				if (!times) {
					reject(err);
				}
			}
		}
	}).catch(() => {
		// 3. new Promise的状态为失败，被catch捕捉到
		console.log(`${times}次数耗尽，请求仍失败`);
	});
};
