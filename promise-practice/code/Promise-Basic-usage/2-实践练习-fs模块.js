const fs = require('fs');

// 回调函数
// fs.readFile('./resource/contect.txt', (err, data) => {
// 	if (err) throw err;
// 	console.log(data.toString());
// });

// Promise
const p = new Promise((resolve, reject) => {
	fs.readFile('./resource/contect.txt', (err, data) => {
		if (err) reject(err);
		resolve(data);
	});
});

p.then(
	(value) => {
		console.log(value.toString());
	},
	(reason) => {
		console.log(reason);
	}
);
