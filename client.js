const {
	EditorView,
	EditorState,
	basicSetup,
	liteSetup,
	javascript
} = cm 

function char2Ele(ele, from, count){
	let fromAt, countAt, start, end
	for (fromAt = 0; (start = ele.get(fromAt)); fromAt++){
		if (from > 0){
			from -= start.length
			continue
		}
		for (countAt = fromAt; (end = ele.get(countAt)); countAt++){
			if (count <= 0) break
			count -= end.length
		}
	}
	return [fromAt, countAt, from, count, start, end]
}

function index2At(text, index, deleteCount, insertText){
	const updates = []
	let val
	let valLen
	let insertAt = 0	
	for (val of text) {
		if (index <= 0) break
		valLen = val.length
		index -= valLen
		insertAt++
	}
	if (deleteCount){
		if (1 === valLen){
			updates.push({insertAt, deleteCount: 1})
			if (deleteCount != val.length) updates.push({insertAt, insertText: val.slice(0, val.length + index)})
		}else{
			updates.push({insertAt, deleteCount: 1})
			if (deleteCount != val.length) updates.push({insertAt, insertText: val.slice(val.length + index)})
		}
	}
	if (insertText){
		if (index){
			updates.push({insertAt, deleteCount: 1})
			updates.push({insertAt: insertAt, insertText: val.slice(0, val.length + index) + insertText + val.slice(val.length + index)})
		}else{
			updates.push({insertAt, insertText})
		}
	}
	return updates
}

function at2Index(text, at){
	let index = 0
	for (val of text) {
		if (!at) break
		index += val.length
		at--
	}
	return index
}

function count2Char(text, at, count){
	let chr = 0
	for (val of text) {
		if (!at) chr += val.length
		if (!count) break
		if (at) at--
		else count--
	}
	return chr
}

function Client(id, state, server){
	this.server = server
	const [merge] = Automerge.applyChanges(Automerge.init(), state)
	this.merge = merge
	this.view = new EditorView({
		state: EditorState.create({
			extensions: [
				//basicSetup,
				liteSetup,
				//javascript(),
				EditorView.updateListener.of(v => {
					if (v.transactions.some(t => t.isUserEvent('am'))) return
					const changes = this.cm2am(v)
					if (!changes) return
					server.update(changes)
				}),
			]
		}),
		parent: document.getElementById(id)
	})
}

Client.prototype = {

	cm2am(v){
		// validation
		if (!v.docChanged) return
		const arr = v.changes.toJSON()
		if (!Array.isArray(arr)) return

		let merge2 = Automerge.merge(Automerge.init(), this.merge)
		let index = 0
		let replace = null
		let insertText = null
		let updates
		// update AutoMerge
		for (let i = 0, l = arr.length; i < l; ){
			if (Array.isArray(arr[i])){
				replace = arr[i++]
			}else{
				index += arr[i++]
				replace = arr[i++]
			}
			if (!replace) break
			const [deleteCount, ...insertTexts] = replace
			insertText = insertTexts.join('\n')

			updates = index2At(merge2.text, index, deleteCount, insertText)

			console.log('cm2am merge2 before', index, deleteCount, insertText, merge2.text.toString())
			merge2 = Automerge.change(merge2, doc => {
				updates.forEach(u => {
					if (u.deleteCount) doc.text.deleteAt(u.insertAt, u.deleteCount)
					if (u.insertText) doc.text.insertAt(u.insertAt, u.insertText)
				})
			})
			console.log('cm2am merge2 after', merge2.text.toString())

			index += insertText.length
		}

		const changes = Automerge.getChanges(this.merge, merge2)
		this.merge = merge2
		return changes
	},

	am2cm(patch){
		console.log('client receive ######', patch)
		// create changes and sent to upstream
		const [merge2, patch2] = Automerge.applyChanges(Automerge.merge(Automerge.init(), this.merge), patch)

		const props = patch2.diffs.props
		if (!props.text) return
		console.log('am2cm merge2', props.text, merge2.text.toString())
		const text = props.text
		const cm = this.view
		for (let key in text){
			let index
			text[key].edits.forEach(diff => {
				const changes = {}
				index = at2Index(this.merge.text, diff.index)
				switch (diff.action) {
					case 'insert': {
						changes.from = index
						changes.to = index
						changes.insert = diff.value.value
						break
					}
					case 'remove': {
						changes.from = index
						changes.to = index + count2Char(this.merge.text, index, diff.count)
						changes.insert = ''
						break
					}
				}
				console.log('cm', changes, cm.state.doc.toString())
				// update codemirror
				cm.dispatch(cm.state.update({
					changes,
					//effects: [],
					//filter: false,
					remote: true,
					userEvent: 'am'
				}))
			})
		}
		this.merge = merge2
	},
}

if ('object' === typeof module){
	module.exports = {
		char2Ele
	}
}
