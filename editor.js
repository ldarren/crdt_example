import {basicSetup} from "@codemirror/basic-setup"
import {EditorView, keymap} from "@codemirror/view"
import {Facet, ChangeSet, StateField, Annotation, EditorState, StateEffect, Transaction, combineConfig, Extension} from "@codemirror/state"
import {javascript} from "@codemirror/lang-javascript"
import {indentWithTab} from "@codemirror/commands"

window.cm = {
	EditorView,
	EditorState,
	basicSetup,
	ChangeSet,
	Annotation,
	Transaction,
	keymap,
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
