global.cm = {}
const c = require('./client')

function Text(arr){
	this.arr = arr
}

Text.prototype = {
	get(index){
		return this.arr[index]
	}
}

;(function(){
	const [fromAt, countAt, from, count, start, end] = c.char2Ele(new Text(['h','e','l','l','o']), 0, 0)
	if ((fromAt !== 0) ||
		(countAt !== 0) ||
		(from !== 0) ||
		(count !== 0) ||
		(!start) ||
		(!end)) throw `error fromAt[${fromAt}] countAt[${countAt}] from[${from}] count[${count}] start[${start}] end[${end}]`
})()
