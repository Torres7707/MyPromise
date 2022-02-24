/**
 * 封装一个函数myReadFile 读取文件内容
 * param:path
 * return:promise 对象
 */

function myReadFile(path) {
	return new Promise(function (resolve, reject) {
		require('fs').readFile(path, (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	});
}

myReadFile('./resource/contect.txt').then(
	(value) => {
		console.log(value.toString());
	},
	(reason) => {
		console.log(reason);
	}
);
