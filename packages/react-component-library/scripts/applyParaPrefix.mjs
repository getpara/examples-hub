import fs from 'fs';
import path from 'path';

// Recursively get all JS files in the directory
function getTsxFiles(dir, files = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getTsxFiles(fullPath, files);
    } else if (file.endsWith('.tsx')) {
      files.push(fullPath);
    }
  });
  return files;
}

// Process a file to replace appendParaPrefix calls
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  const regex = /(['"])APPLY_PARA_PREFIX (.+?)\1/g;

  content = content.replace(regex, (match, quoteType, strArg) => {
    const transformed = strArg
      .split(/\s+/) // Split by whitespace
      .map(word => (!word.startsWith('para:') ? `para:${word}` : word)) // Add prefix
      .join(' '); // Join back
    return `${quoteType}${transformed}${quoteType}`; // Replace function call with transformed string
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// Run on a target directory (change `./src` to your actual codebase path)
const targetDir = './src/components'; // Change this to your JS source directory
const files = getTsxFiles(targetDir);

files.forEach(processFile);
console.log('Processing complete.');
