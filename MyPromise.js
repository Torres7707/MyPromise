/**
 * 资源链接：https://www.bilibili.com/video/BV1BK4y1D7Wc?p=3&share_source=copy_web
 */

// 状态常量
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
	// 状态 + 结果 需要node 10+
	PromiseState = PENDING;
	PromiseResult = undefined;

	// 保存两组回调函数
	fulfilledCbs = [];
	rejectedCbs = [];

	// 构造方法执行器函数
	constructor(executor) {
		try {
			executor(this.resolve.bind(this), this.reject.bind(this));
		} catch (err) {
			this.reject(err);
		}
	}

	// 成功的方法，设置成功状态，保存结果
	resolve(val) {
		// 状态从pending改变后就不能再改了
		if (this.PromiseState !== PENDING) {
			return;
		}
		this.PromiseState = FULFILLED;
		this.PromiseResult = val;
		// 判断保存的回调数组历史否有值，如果有则依次弹出并执行
		while (this.fulfilledCbs.length) {
			this.fulfilledCbs.shift()();
		}
	}

	// 失败的方法，设置失败状态，保存结果
	reject(reason) {
		// 状态从pending改编后就不能再改了
		if (this.PromiseState !== PENDING) {
			return;
		}
		this.PromiseState = REJECTED;
		this.PromiseResult = reason;
		while (this.rejectedCbs.length) {
			this.rejectedCbs.shift()();
		}
	}

	/**
	 * 接收两个回调
	 * 如果当前promise对象为成功状态，执行第一个回调
	 * 如果当前promise对象为失败状态，执行第二个回调
	 * 如果当前promise对象为待定状态，暂时保存两个回调
	 *
	 * then会返回一个新的Promise对象，该对象的状态和结果由回调函数的返回值决定；
	 * 如果回调函数的返回值是Promise对象：
	 *      1.返回值为成功，新Promise就是成功；
	 *      2.返回值为失败，新Promise就是失败；
	 * 如果返回值非Promise对象：
	 *      新Promise就是成功，它的值就是返回值
	 */
	then(onFulfilled, onRejected) {
		onFulfilled =
			typeof onFulfilled === 'function' ? onFulfilled : (val) => val;
		onRejected =
			typeof onRejected === 'function'
				? onRejected
				: (reason) => {
						throw reason;
				  };

		const thenPromise = new MyPromise((resolve, reject) => {
			const resolvePromise = (cb) => {
				queueMicrotask(() => {
					// 异步里边的异常外层无法捕捉
					try {
						let x = cb(this.PromiseResult);
						if (x === thenPromise) {
							throw new Error('不能返回自身!');
						}
						if (x instanceof MyPromise) {
							x.then(resolve, reject);
						} else {
							resolve(x);
						}
					} catch (err) {
						reject(err);
					}
				});
			};
			if (this.PromiseState === FULFILLED) {
				resolvePromise(onFulfilled);
			} else if (this.PromiseState === REJECTED) {
				resolvePromise(onRejected);
			} else if (this.PromiseState === PENDING) {
				// bind返回一个函数（没执行）
				// this.fulfilledCbs.push(onFulfilled.bind(this, this.PromiseResult));
				this.fulfilledCbs.push(resolvePromise.bind(this, onFulfilled));
				// this.rejectedCbs.push(onRejected.bind(this, this.PromiseResult));
				this.rejectedCbs.push(resolvePromise.bind(this, onRejected));
			}
		});

		return thenPromise;
	}

	/**
	 * all 是一个静态方法，需要一个数组作为参数
	 * 参数数组中，如果所有Promise对象都为成功，返回成功状态的Promise
	 * 参数数组中，只要有一个失败的Promise对象，返回失败状态的Promise
	 */
	static all(arr) {
		const result = [];
		let n = 0;

		return new MyPromise((resolve, reject) => {
			const addResult = (val, index) => {
				result[index] = val;
				n++;
				if (n === arr.length) {
					resolve(result);
				}
			};
			arr.forEach((item, index) => {
				if (item instanceof MyPromise) {
					item.then((val) => {
						addResult(val, index);
					}, reject);
				} else {
					addResult(item, index);
				}
			});
		});
	}

	/**
	 * race 是一个静态方法，需要一个数组作为参数，返回一个Promise
	 * 数组中的字面量被视为成功的Promise
	 * Promise的状态和结果，由参数数组中最快得到的结果决定
	 */
	static race(arr) {
		return new MyPromise((resolve, reject) => {
			arr.forEach((item) => {
				if (item instanceof MyPromise) {
					item.then(resolve, reject);
				} else {
					// then为异步，直接resolve肯定会直接执行，速度肯定最快
					queueMicrotask(() => {
						resolve(item);
					});
				}
			});
		});
	}

	/**
	 * resolve 是一个静态方法
	 * 参数是个Promise对象就原封不动的返回该对象
	 * 参数为非Promise对象，就返回一个成功状态的Promise对象
	 */
	static resolve(val) {
		if (val instanceof MyPromise) return val;
		return new MyPromise((resolve) => resolve(val));
	}

	/**
	 * reject 是一个静态方法
	 * 返回一个Promise对象
	 * 不管是什么，都会被包裹为失败的Promise
	 */
	static reject(val) {
		return new MyPromise((resolve, reject) => reject(val));
	}

	/**
	 * A对象.finally(p1).then()
	 * 等p1执行毕后，才会执行then
	 * 如果p1为成功Promise，then接收 A对象 的结果
	 * 如果p1为失败Promise，then接受 p1对象 的结果
	 */
	finally(callback) {
		let x = typeof callback === 'function' ? callback() : callback;
		return MyPromise.resolve(x).then(
			() => this
			// (reason) => {
			// 	throw reason;
			// }
		);
	}

	/**
	 * catch
	 */
	catch(callback) {
		return this.then(null, callback);
	}
}
