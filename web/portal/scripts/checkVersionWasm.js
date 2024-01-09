const fs = require('fs');
const crypto = require('crypto');

const fileToCheck = './public/static/js/main-v0_1_0.wasm';
const wasmHashHex = '9092fb770559a79fb53ad038593609d04bc17205a4429fc6b322f0038c73bb44';

fs.readFile(fileToCheck, (err, data) => {
  if (err) {
    console.error('Error reading version wasm file:', err);
    process.exit(1);
  }

  const hash = crypto.createHash('sha256').update(data).digest('hex');
  if (hash === wasmHashHex) {
    console.log('Hash matches');
  } else {
    console.error(`Hash of\n${hash}\ndoes not match\n${wasmHashHex}`);
    process.exit(1);
  }
});
