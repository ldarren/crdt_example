const {
	EditorView,
	EditorState,
	basicSetup,
	ChangeSet,
	Annotation,
	Transaction,
	keymap,
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
				basicSetup,
				javascript(),
				EditorView.updateListener.of(v => {
					if (v.transactions.some(t => t.isUserEvent('am'))) return
					const changes = this.cm2am(v)
					if (!changes) return
					server.update(changes)
				}),
				keymap.of([indentWithTab]),
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

		// update AutoMerge
		let insertAt = 0
		let replace = null
		if (Array.isArray(arr[0])){
			replace = arr[0]
		}else{
			insertAt = arr[0]
			replace = arr[1]
		}
		const [deleteCount, insertText] = replace

		let merge2 = Automerge.merge(Automerge.init(), this.merge)
		merge2 = Automerge.change(merge2, doc => {
			if (deleteCount) doc.text.deleteAt(insertAt, deleteCount)
			if (insertText) doc.text.insertAt(insertAt, insertText)
		})

		const changes = Automerge.getChanges(this.merge, merge2)
		console.log('cm2am merge2', arr, merge2.text.toString())
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
			text[key].edits.forEach(diff => {
				const changes = {}
				switch (diff.action) {
					case 'insert': {
						changes.from = diff.index
						changes.to = diff.index
						changes.insert = diff.value.value
						break
					}
					case 'remove': {
						changes.from = diff.index
						changes.to = diff.index
						changes.replace = ''
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
			})
		}
	},
}
