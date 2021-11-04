const {
	EditorView,
	EditorState,
	keymap,
	ChangeSet,
	lineNumbers,
	indentWithTab,
	javascript
} = cm

function Client(id, state, server){
	this.server = server
	const [merge] = Automerge.applyChanges(Automerge.init(), state)
	this.merge = merge
	this.view = new EditorView({
		state: EditorState.create({
			extensions: [
				lineNumbers(),
//				javascript(),
				EditorView.updateListener.of(v => {
					if (v.transactions.some(t => t.isUserEvent('am'))) return
					const changes = this.cm2am(v)
					if (!changes) return
					server.update(changes)
				}),
//				keymap.of([indentWithTab]),
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
		let insertAt = 0
		let replace = null
		let insertText = null
		// update AutoMerge
		for (let i = 0, l = arr.length; i < l; ){
			if (Array.isArray(arr[i])){
				replace = arr[i++]
			}else{
				insertAt += arr[i++]
				replace = arr[i++]
			}
			if (!replace) break
			const [deleteCount, ...insertTexts] = replace
			insertText = insertTexts.join('\n')

			merge2 = Automerge.change(merge2, doc => {
				if (deleteCount) doc.text.deleteAt(insertAt, deleteCount)
				if (insertText) doc.text.insertAt(insertAt, insertText)
			})
			console.log('cm2am merge2', insertAt, deleteCount, insertText, merge2.text.toString())

			insertAt += insertText.length //- 1 // why need to ignore return?
		}

		const changes = Automerge.getChanges(this.merge, merge2)
		this.merge = merge2
		return changes
	},

	am2cm(patch){
		console.log('client receive ######', patch)
		// create changes and sent to upstream
		const [merge2, patch2] = Automerge.applyChanges(this.merge, patch)
		this.merge = merge2

		const props = patch2.diffs.props
		if (!props.text) return
		console.log('am2cm merge2', props.text, merge2.text.toString())
		const text = props.text
		for (let key in text){
			let offset = 0
			let index
			text[key].edits.forEach(diff => {
				const changes = {}
				index = diff.index //+ offset
				switch (diff.action) {
					case 'insert': {
						changes.from = index
						changes.to = index
						changes.insert = diff.value.value
						break
					}
					case 'remove': {
						changes.from = index
						changes.to = index + diff.count
						changes.insert = ''
						break
					}
				}
				// update codemirror
				this.view.dispatch(this.view.state.update({
					changes,
					effects: [],
					filter: false,
					remote: true,
					userEvent: 'am'
				}))

				offset++ // put back the return key
			})
		}
	},
}
