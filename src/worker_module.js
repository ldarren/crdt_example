const WorkerModule = function(){
	const Rand = Math.random
	const _cbs = {}

	return {
		master: new Proxy({}, {
			has(target, prop){
				return true
			},
			get(target, prop, receiver){
				if (target[prop]) return target[prop]
				return (...args) => {
					let id = 0
					if (args[args.length-1] instanceof Function) {
						id = (Rand()*1000).toString(36)
						_cbs[id] = args.pop()
					}
					postMessage([id, prop, args])
				}
			}
		}),
		define(obj){
			onmessage = function(e){
				const [id, action, params] = e.data
				let fun =  _cbs[id]
				if (fun){
					_cbs[id] = void 0
					fun(...params)
				}
				fun = obj[action]
				if (!fun) return postMessage([id, null, ['404']])

				fun(...params, (err, ...args) => {
					if (err) {
						if (err instanceof Error) {
							err = {
								name: err.name,
								message: err.message, 
								stack: err.stack
							}
						}
						return postMessage([id, null, [err]])
					}
					postMessage([id, null, [null, ...args]])
				})
			}
		} 
	}
}()
