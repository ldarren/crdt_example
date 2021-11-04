import {lineNumbers} from '@codemirror/gutter'
import {EditorView, keymap} from '@codemirror/view'
import {EditorState, ChangeSet, Annotation, Transaction} from '@codemirror/state'
import {javascript} from '@codemirror/lang-javascript'
import {indentWithTab} from '@codemirror/commands'

window.cm = {
	EditorView,
	EditorState,
	keymap,
	ChangeSet,
	lineNumbers,
	indentWithTab,
	javascript
}

const clients = []

WorkerMaster.register({
	ready(state){
		const server = WorkerMaster.worker()
		clients.push(...['first', 'second'].map(id => new Client(id, state, server)))
	},
	update(changes){
		clients.map(c => c.am2cm(changes))
	}
})

WorkerMaster.require('./server.js')
