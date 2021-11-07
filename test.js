global.cm = {}
const c = require('./client')

function Text(arr){
	this.arr = arr
	this.length = arr.length
}

Text.prototype = {
	get(index){
		return this.arr[index]
	}
}

;(function(){
	const [fromAt, countAt, from, count, start, end] = c.char2Ele(new Text(['h','e','l','l','o']), 0, 0)
	const ret = `fromAt[${fromAt}] countAt[${countAt}] from[${from}] count[${count}] start[${start}] end[${end}]`
	if ((fromAt !== 0) ||
		(countAt) ||
		(from !== 0) ||
		(count !== 0) ||
		('h' !== start) ||
		(end)) throw `error ${ret}`
	console.log('insert at 0. result:', ret)
})()

;(function(){
	const [fromAt, countAt, from, count, start, end] = c.char2Ele(new Text(['h','e','l','l','o']), 1, 3)
	const ret = `fromAt[${fromAt}] countAt[${countAt}] from[${from}] count[${count}] start[${start}] end[${end}]`
	if ((fromAt !== 1) ||
		(countAt !== 3) ||
		(from !== 0) ||
		(count !== 0) ||
		('e' !== start) ||
		('l' !== end)) throw `error ${ret}`
	console.log('select 1 to 4. result:', ret)
})()

;(function(){
	const [fromAt, countAt, from, count, start, end] = c.char2Ele(new Text(['{\n','"key":', '"value"\n', '}']), 3, 3)
	const ret = `fromAt[${fromAt}] countAt[${countAt}] from[${from}] count[${count}] start[${start}] end[${end}]`
	if ((fromAt !== 1) ||
		(countAt !== 1) ||
		(-5 !== from) ||
		(-2 !== count) ||
		('"key":' !== start) ||
		('"key":' !== end)) throw `error ${ret}`
	console.log('select key. result:', ret)
})()

;(function(){
	const [fromAt, countAt, from, count, start, end] = c.char2Ele(new Text(['{\n','"key":', '"value"\n', '}']), 1, 15)
	const ret = `fromAt[${fromAt}] countAt[${countAt}] from[${from}] count[${count}] start[${start}] end[${end}]`
	if ((fromAt !== 0) ||
		(countAt !== 2) ||
		(-1 !== from) ||
		(0 !== count) ||
		('{\n' !== start) ||
		('"value"\n' !== end)) throw `error ${ret}`
	console.log('select words span multiple elements. result:', ret)
})()
