const fs = require('fs');
const crypto = require('crypto');

const filesWithHash = [
  {
    file: './public/static/js/main-v0_1_0.wasm',
    hash: '9092fb770559a79fb53ad038593609d04bc17205a4429fc6b322f0038c73bb44',
  },
  {
    file: './public/static/js/main-v0_2_0.wasm',
    hash: 'bba36ed91e17582c23718a9183a557da1112878d4cfbbb3fdf940e65b992eb59',
  },
];

for (const { file, hash } of filesWithHash) {
  checkFileHash(file, hash);
}

function checkFileHash(fileToCheck, wasmHashHex) {
  let data;
  try {
    data = fs.readFileSync(fileToCheck);
  } catch (err) {
    console.error(`Error reading version wasm file for file ${fileToCheck}:`, err);
    process.exit(1);
  }

  const hash = crypto.createHash('sha256').update(data).digest('hex');
  if (hash === wasmHashHex) {
    console.log(`Hash matches for file ${fileToCheck}`);
  } else {
    console.error(`Hash of\n${hash}\ndoes not match\n${wasmHashHex}\nfor file ${fileToCheck}`);
    process.exit(1);
  }
}
