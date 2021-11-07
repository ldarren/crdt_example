import {EditorView, keymap, highlightSpecialChars, drawSelection, highlightActiveLine} from "@codemirror/view"
import {EditorState, ChangeSet, Annotation, Transaction} from '@codemirror/state'

import {basicSetup} from "@codemirror/basic-setup"
import {history, historyKeymap} from "@codemirror/history"
import {foldGutter, foldKeymap} from "@codemirror/fold"
import {indentOnInput} from "@codemirror/language"
import {lineNumbers, highlightActiveLineGutter} from "@codemirror/gutter"
import {defaultKeymap,indentWithTab} from "@codemirror/commands"
import {bracketMatching} from "@codemirror/matchbrackets"
import {closeBrackets, closeBracketsKeymap} from "@codemirror/closebrackets"
import {searchKeymap, highlightSelectionMatches} from "@codemirror/search"
import {autocompletion, completionKeymap} from "@codemirror/autocomplete"
import {commentKeymap} from "@codemirror/comment"
import {rectangularSelection} from "@codemirror/rectangular-selection"
import {defaultHighlightStyle} from "@codemirror/highlight"
import {lintKeymap} from "@codemirror/lint"

import {javascript} from '@codemirror/lang-javascript'

window.cm = {
	EditorView,
	EditorState,
	basicSetup,
	liteSetup: [
		lineNumbers(),
		highlightActiveLineGutter(),
		highlightSpecialChars(),
		history(),
		foldGutter(),
		drawSelection(),
		EditorState.allowMultipleSelections.of(true),
		indentOnInput(),
		defaultHighlightStyle.fallback,
		bracketMatching(),
		closeBrackets(),
		autocompletion(),
		rectangularSelection(),
		highlightActiveLine(),
		highlightSelectionMatches(),
		keymap.of([
			...closeBracketsKeymap,
			...defaultKeymap,
			...searchKeymap,
			...historyKeymap,
			...foldKeymap,
			...commentKeymap,
			...completionKeymap,
			...lintKeymap,
			indentWithTab,
		])
	],
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
