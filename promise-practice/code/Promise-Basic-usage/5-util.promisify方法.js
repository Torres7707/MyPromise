// const util = require('util');
// const fs = require('fs');

// let myReadFile = util.promisify(fs.readFile);

// myReadFile('./resource/contect.txt').then((value) => {
// 	console.log(value.toString());
// });

function MyPromise(executor) {
	this.MyPromiseStatus = 'pending';
	this.MyPromiseResult = null;

	this.callbacks = [];

	const self = this;

	function resolve(value) {
		if (self.MyPromiseStatus !== 'pending') return;

		self.MyPromiseStatus = 'fulfilled';

		self.MyPromiseResult = value;

		self.callbacks.forEach((i) => {
			i.onResolve(value);
		});
	}

	function reject(value) {
		if (self.MyPromiseStatus !== 'pending') return;

		self.MyPromiseStatus = 'rejected';

		self.MyPromiseResult = value;

		self.callbacks.forEach((i) => {
			i.onReject(value);
		});
	}

	try {
		executor(resolve, reject);
	} catch (e) {
		reject(e);
	}
}

MyPromise.prototype.then = function (onResolve, onReject) {
	const self = this;
	return new MyPromise((resolve, reject) => {
		function callback(type) {
			try {
				let result = type(self.MyPromiseResult);
				if (result instanceof MyPromise) {
					result.then(
						(v) => resolve(v),
						(r) => reject(r)
					);
				} else {
					resolve(result);
				}
			} catch (e) {
				reject(e);
			}
		}

		if (this.MyPromiseStatus === 'fulfilled') {
			callback(onResolve);
		}

		if (this.MyPromiseStatus === 'rejected') {
			callback(onReject);
		}

		if (this.MyPromiseStatus === 'pending') {
			this.callbacks.push({
				onResolve: function () {
					callback(onResolve);
				},
				onReject: function () {
					callback(onReject);
				},
			});
		}
	});
};

MyPromise.prototype.catch = function (onReject) {
	return this.then(undefined, onReject);
};

MyPromise.resolve = function (value) {
	return new MyPromise((r, j) => {
		try {
			if (value instanceof MyPromise) {
				value.then(
					(v) => {
						r(v);
					},
					(e) => {
						j(e);
					}
				);
			} else {
				r(value);
			}
		} catch (err) {
			j(err);
		}
	});
};

MyPromise.reject = function (value) {
	return new MyPromise((r, j) => {
		j(value);
	});
};

MyPromise.all = function (promises) {
	return new MyPromise((r, j) => {
		const arr = [];
		promises.forEach((item, index) => {
			item.then(
				(v) => {
					arr[index] = v;
					if (index === promises.length - 1) {
						r(v);
					}
				},
				(e) => {
					j(e);
				}
			);
		});
	});
};

// const p = new Promise((res, rej) => {
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

const p2 = Promise.reject(
	new Promise((r, j) => {
		r('ok');
	})
);
console.log(p2);
