// 自定义封装Promise
function MyPromise(executor) {
	// 添加属性
	this.PromiseState = 'pending';
	this.PromiseResult = null;
	// 添加回调属性
	this.callbacks = [];

	// 预先保存实例对象this的值
	const self = this;

	// resolve
	function resolve(data) {
		// 判断状态
		if (self.PromiseState !== 'pending') return;
		// 1. 修改对象状态（promiseState）
		self.PromiseState = 'fulfilled';
		// 2.设置对象结果值（promiseResult）
		self.PromiseResult = data;

		// 调用成功的回调函数
		// if (self.callback.onFulfilled) {
		// 	self.callback.onFulfilled(data);
		// }
		setTimeout(() => {
			self.callbacks.forEach((i) => {
				i.onFulfilled(data);
			});
		});
	}

	// reject
	function reject(data) {
		// 判断状态
		if (self.PromiseState !== 'pending') return;
		// 1. 修改对象状态（promiseState）
		self.PromiseState = 'rejected';
		// 2.设置对象结果值（promiseResult）
		self.PromiseResult = data;

		// 调用失败的回调函数
		// if (self.callback.onRejected) {
		// 	self.callback.onRejected(data);
		// }
		setTimeout(() => {
			self.callbacks.forEach((i) => {
				i.onRejected(data);
			});
		});
	}
	try {
		// 同步调用「执行器函数」
		executor(resolve, reject);
	} catch (e) {
		// 修改promise对象状态为「失败」
		reject(e);
	}
}

// 添加then方法
MyPromise.prototype.then = function (onFulfilled, onRejected) {
	const self = this;

	// 判断回调函数参数（第二个参数）是否传入--异常穿透
	if (typeof onRejected !== 'function') {
		onRejected = (reason) => {
			throw reason;
		};
	}

	// 判断回调函数参数（第一个参数）是否传入--值传递
	if (typeof onFulfilled !== 'function') {
		onFulfilled = (value) => value;
	}
	return new MyPromise((resolve, reject) => {
		// 封装函数
		function callback(type) {
			try {
				let result = type(self.PromiseResult);
				if (result instanceof MyPromise) {
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

		// 调用回调函数--'成功'
		if (this.PromiseState === 'fulfilled') {
			setTimeout(() => {
				callback(onFulfilled);
			});
		}

		// 调用回调函数--'失败'
		if (this.PromiseState === 'rejected') {
			setTimeout(() => {
				callback(onRejected);
			});
		}

		// 判断pending状态
		if (this.PromiseState === 'pending') {
			// 保存回调函数
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

// 添加catch方法
MyPromise.prototype.catch = function (onRejected) {
	return this.then(undefined, onRejected);
};

// 添加resolve方法
MyPromise.resolve = function (value) {
	return new MyPromise((resolve, reject) => {
		if (value instanceof MyPromise) {
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

// 添加reject方法
MyPromise.reject = function (value) {
	return new MyPromise((resolve, reject) => {
		reject(value);
	});
};

// 添加all方法
MyPromise.all = function (promiseArr) {
	return new MyPromise((resolve, reject) => {
		let resultArr = [];
		let count = 0;
		promiseArr.forEach((item, index) => {
			item.then(
				(v) => {
					//  得知对象的状态是成功
					count++;
					resultArr[index] = v;
					// 判断是否每个promise对象都成功
					if ((count = promiseArr.length)) {
						// 修改状态
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

// 添加race方法
MyPromise.race = function (promiseArr) {
	return new MyPromise((resolve, reject) => {
		promiseArr.forEach((item, index) => {
			item.then(
				(v) => {
					// 修改状态
					resolve(v);
				},
				(r) => {
					reject(r);
				}
			);
		});
	});
};

// 添加retry方法
MyPromise.retry = function (fn, times) {
	new MyPromise(async (resolve, reject) => {
		let n = times;
		while (n--) {
			try {
				const result = await fn();
				console.log('执行成功，结果为：', result);
				resolve(result);
				break;
			} catch (err) {
				console.log(`执行失败第${times - n}次，结果为：`, err);
				if (!n) {
					reject(err);
				}
			}
		}
	}).catch(() => {
		console.log(`执行了${times}次，仍为失败！`);
	});
};

// test
// const p = new MyPromise((res, rej) => {
// 	// setTimeout(() => {
// 	// res('ok');
// 	throw 'err';
// 	// }, 1000);
// });

// const result = p.then(
// 	(v) => {
// 		console.log('v', v);
// 	},
// 	(r) => {
// 		console.log('r', r);
// 	}
// );

// console.log('p:', p, 'result:', result);
// console.log(p, res);

// const p2 = MyPromise.reject(
// 	new MyPromise((r, j) => {
// 		j('qq');
// 	})
// );
// console.log(p2);

function fn() {
	return new MyPromise((resolve, reject) => {
		let n = Math.random();
		if (n > 0.8) {
			resolve(n);
		} else {
			reject(n);
		}
	});
}

MyPromise.retry(fn, 10);
