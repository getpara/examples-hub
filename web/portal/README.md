# web portal

## Setup

Make sure to have the go-sdk repo (https://github.com/capsule-org/go-sdk) cloned in a directory adjacent to the web-sdk directory. To run the portal locally you'll need to run

```
yarn setup-worker
```
once to compile the wasm and worker files. Any time changes are made to the wasm file, you'll need to run this command again.

After run
```
yarn start-dev
```
to run the portal locally at http://localhost:3003.
