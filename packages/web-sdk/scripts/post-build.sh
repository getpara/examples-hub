sed -i '' -e "s:worker.ts:worker.js:g" dist/workers/workerWrapper.js
cp -R ./src/cryptography/scripts dist/cryptography
