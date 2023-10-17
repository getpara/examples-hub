sed -i '' -e "s:worker.ts:worker.js:g" dist/workers/workerWrapper.js
cp -R ./src/cryptography/scripts dist/cryptography
cp -r ./src/modal/css dist/modal/css
cp -r ./src/modal/public dist/modal/public
