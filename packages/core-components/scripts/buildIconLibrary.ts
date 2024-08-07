const fs = require('fs');

function toCamelCase(text) {
  return text.replace(/-\w/g, clearAndUpper);
}

function toPascalCase(text) {
  return text.replace(/(^\w|-\w)/g, clearAndUpper);
}

function clearAndUpper(text) {
  return text.replace(/-/, '').toUpperCase();
}
const main = () => {
  let files: string[] = fs.readdirSync('./src/assets/icons');
  let flagFiles = fs.readdirSync('./src/assets/icons/flags');

  let importString = '';
  let objString = 'export const Icons = {';

  for (const fileName of files) {
    if (!fileName.includes('.svg')) {
      continue;
    }

    const fileNameNoExt = fileName.split('.')[0];

    const camelCaseFileName = toCamelCase(fileNameNoExt);
    const pascalCaseFileName = toPascalCase(fileNameNoExt);

    importString += `import ${pascalCaseFileName} from './${fileName}';`;
    objString += `${camelCaseFileName}: ${pascalCaseFileName},`;
  }

  for (const fileName of flagFiles) {
    if (!fileName.includes('.svg')) {
      continue;
    }

    const fileNameNoExt = fileName.split('.')[0];

    const camelCaseFileName = toCamelCase(fileNameNoExt);
    const pascalCaseFileName = toPascalCase(fileNameNoExt);

    importString += `import ${pascalCaseFileName} from './flags/${fileName}';`;
    objString += `${camelCaseFileName}: ${pascalCaseFileName},`;
  }

  const codeStr = `${importString}\n${objString}}`;
  fs.writeFile('./src/assets/icons/index.ts', codeStr, 'utf8', err => {
    if (err) {
      console.error(err);
    }
  });
};

main();
