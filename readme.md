# CRDT With CodeMirror and Automerge

## Setup
- npm ci
- npm start

### Setup Automerge
At the time of creating this example, automerge 1.0 is not stable yet. hence build from source is the best to get latest bug fix

Automerge build steps
- git clone https://github.com/automerge/automerge.git automerge && cd automerge
- npm ci
- npm run build
- cp ./dist/\* {your}/{path}/dist/

## Test
```sh
npm test
```

## Run
open `index.html` in browser

## Test
[Sample](https://ldarren.github.io/crdt_example/)
