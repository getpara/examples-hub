const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../src/paraWallet.svg');
const outputPath = path.join(__dirname, '../src/paraWalletImage.js');

fs.readFile(svgPath, 'utf8', function (err, data) {
  if (err) {
    console.error('Error reading SVG file: ', err);
    return;
  }
  const base64Data = Buffer.from(data).toString('base64');
  const moduleContent = `// Auto-generated file\n"use client";\nvar paraWallet_default = "data:image/svg+xml;base64,${base64Data}";\nexport {\n  paraWallet_default as default\n};\n`;

  fs.writeFile(outputPath, moduleContent, 'utf8', function (err) {
    if (err) {
      console.error('Error writing JS module: ', err);
      return;
    }
    console.log('Module created successfully!');
  });
});
