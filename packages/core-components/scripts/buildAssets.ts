const fs = require('fs');
const fsPromises = require('fs').promises;

function toCamelCase(text) {
  return text.replace(/-\w/g, clearAndUpper);
}

function toPascalCase(text) {
  return text.replace(/(^\w|-\w)/g, clearAndUpper);
}

function clearAndUpper(text) {
  return text.replace(/-/, '').toUpperCase();
}
const buildIconLibrary = () => {
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

const buildImages = async () => {
  const files: string[] = fs.readdirSync('./src/assets/images');

  let objString = 'export const Images = {';

  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];

    if (!fileName.includes('png') && !fileName.includes('jpg') && !fileName.includes('jpeg')) {
      continue;
    }

    const content = await fsPromises.readFile(`./src/assets/images/${fileName}`, { encoding: 'base64' });

    const fileNameSplit = fileName.split('.');
    const ext = fileNameSplit[1];
    const fileNameNoExt = fileNameSplit[0];

    const camelCaseFileName = toCamelCase(fileNameNoExt);

    const dataUrl = `data:image/${ext};base64,${content}`;

    objString += `${camelCaseFileName}: "${dataUrl}",`;
  }

  fs.writeFile('./src/assets/images/index.ts', `${objString}}`, 'utf8', err => {
    if (err) {
      console.error(err);
    }
  });
};

const main = () => {
  buildIconLibrary();
  buildImages();
};
main();
