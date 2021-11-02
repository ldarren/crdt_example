const WorkerMaster = (function(){
	const me = {}
	const workers = {};
	const Rand = Math.random

	const WorkerProxy = {
		has(target, prop){
			return true
		},
		get(target, prop, receiver){
			if (target[prop]) return target[prop]
			return (...args) => {
				let id = 0
				if (args[args.length-1] instanceof Function) {
					id = (Rand()*1000).toString(36)
					target._commands[id] = args.pop()
				}
				target.postMessage([id, prop, args])
			}
		}
	}

	function onWorkerMessage(e){
		const [id, prop, params] = e.data
		const worker = workers[this.id]
		let fun = me[prop]
		if (fun instanceof Function) return fun.apply(worker, params)
		fun = this._commands[id]
		if (!fun) return 
		delete this._commands[id]
		fun.apply(worker, params)
	}       

	return {
		register(obj){
			Object.assign(me, obj)
		},
		require(fname, options){
			const worker = new Worker(fname, options) 
			worker.id = (Rand()*1000).toString(36)
			worker._commands = {}
			worker.onmessage = onWorkerMessage
			const p = new Proxy(worker, WorkerProxy)
			workers[worker.id] = p
			return p
		},
		worker(id){
			if (!id) return workers[Object.keys(workers)[0]]
			return worker[id]
		},
		unrequire(worker){
			delete workers[worker.id]
		},
		count(){
			return Object.keys(workers).length
		}
	}           
})() 
