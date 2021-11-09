importScripts('./dist/automerge.js', './src/worker_module.js')
	
let merge = Automerge.change(Automerge.init(), doc => {
	doc.method = 'POST'
	doc.url = 'https://httpbin.org/post'
	doc.headers = ['{"Content-Type":"application/json"}']
	doc.req= new Automerge.Text()
	doc.req.insertAt(0, '{"foo":"bar"}')
})
    
// worker code 
WorkerModule.define({
	update(changes, cb){
	console.log('server receive ######', changes)
		if (!changes) return
		// receive same changes from upstream
		try{
			const [merge2, patch] = Automerge.applyChanges(merge, changes)
			console.log('server merge2', patch.diffs.props.req, merge2.req.toString())
			WorkerModule.master.update(changes)
			merge = merge2
		}catch(ex){
			console.error(ex)
		}
	},          
	exit(cb){   
		close()     
		cb && cb()        
	}            
})

// https://github.com/automerge/automerge/issues/273
WorkerModule.master.ready(Automerge.getAllChanges(merge))
