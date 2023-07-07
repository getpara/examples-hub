# web-sdk

## Setup

Ask a coworker to add you to the "@usecapsule" organization on NPM and ensure you're logged in:
```sh
npm login
```

To run the example locally, navigate to `web-sdk` directory root, and install dependencies:
```sh
yarn
```
Then navigate to `examples` and install dependencies:
```sh
cd examples && yarn
```
Start running the example with:
```sh
yarn start
```
The example should by default use a sandbox hosted backend. To use a locally hosted backend, in `examples/index.tsx` update the instantiation of the `Capsule` class to use `Environment.DEV` instead of `Environment.SANDBOX`, and change `DEFAULT_API_KEY` to `undefined`.

You'll also need to run the web portal locally if the web-sdk example is run locally. To do this, in a separate command line window/tab, navigate to `web-sdk/portal` and install dependencies:
```sh
cd portal && yarn
```
Then run the portal:
```sh
yarn start-dev
```

Once both the example and portal are running locally, the example should be viewable at `http://localhost:3002`.
