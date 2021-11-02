# Code Example

## Convert from CodeMirror to AutoMerge

```js
const onUpdate = v => {
	if (!v.docChanged) return
	const arr = v.changes.toJSON()
	if (!Array.isArray(arr)) return
	let insertAt = 0
	let replace = null
	if (Array.isArray(arr[0])){
		replace = arr[0]
	}else{
		insertAt = arr[0]
		replace = arr[1]
	}
	const [deleteCount, insertText] = replace
	let am2 = Automerge.merge(Automerge.init(), am)
	am2 = Automerge.change(am2, doc => {
		if (deleteCount) doc.text.deleteAt(insertAt, deleteCount)
		if (insertText) doc.text.insertAt(insertAt, insertText)
	})

	// create changes and sent to upstream
	console.log('txt2', am2.text.toString())
	const cs = Automerge.getChanges(am, am2)
	const amo1 = Automerge.merge(Automerge.init(), am)
	const [newam1, patch1] = Automerge.applyChanges(amo1, cs)
	console.log('newam1', newam1.text.toString(), Automerge.getAllChanges(newam1, 'text'))
	am = Automerge.merge(Automerge.init(), newam1)

	// receive same changes from upstream
	try{
	const [newam2, patch2] = Automerge.applyChanges(newam1, cs)
	console.log('newam2', newam2.text.toString(), Automerge.getAllChanges(newam2, 'text'))
	}catch(ex){
		console.error(ex)
	}
}
```

## Create new empty CodeMirror ChangeSet
```js
	// create new changeSet
	this.startState = view.state;
	this.changes = ChangeSet.empty(this.startState.doc.length);
```

## Insert at cursor
```js
setInterval(() => {
	const transaction = view.state.replaceSelection('*');
	const update = view.state.update(transaction);
	view.update([update]);
}, 60000);
```

## insert at a given location
```js
setInterval(() => {
	const changes = ChangeSet.fromJSON([[0, '*']])
	view1.dispatch(view1.state.update({
		changes: {from: 0, to: 0, insert: "*"},
		effects: [],
		filter: false
	}));
}, 6000);
```

## From Automerge to CodeMirror
```js
function receiveUpdates(state, updates){
	//const collabReceive = Annotation.define();
	return state.update({
		changes: updates[0],
		effects: [],
		annotations: [
			Transaction.addToHistory.of(false),
			Transaction.remote.of(true),
			collabReceive.of(new CollabState(version,unconfirmed))
		],
		filter: false
	})
}
```
