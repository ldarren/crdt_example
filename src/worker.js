importScripts('./TreeNode.js', './worker_module.js')
    
// worker code 
WorkerModule.define({
	work(index, iterations, depth, cb){
		let check = 0;
		for (let i = 1; i <= iterations; i++) {
			check += itemCheck(bottomUpTree(depth));
		}   
		cb(null, index, `${iterations}\t trees of depth ${depth}\t check: ${check}`)
	},          
	exit(cb){   
		close()     
		cb && cb()        
	}            
})
WorkerModule.master.ready()
