(async () => {
  try {
    const fs = require('fs').promises;

    const distIndexPath = './dist/index.js';
    const distTypesPath = './dist/types/index.d.ts';
    const loaderRelativePath = './loader/index.js';
    const loaderTypesRelativePath = '../loader/index.d.ts';

    // Statements to append
    const exportStatementJS = `\nexport * from '${loaderRelativePath}';\n`;
    const exportStatementTypes = `\nexport * from '${loaderTypesRelativePath}';\n`;

    // Append to the main JS file
    await fs.appendFile(distIndexPath, exportStatementJS, 'utf8');
    console.log(`Successfully appended JavaScript exports to ${distIndexPath}`);

    // Append to the main types file
    await fs.appendFile(distTypesPath, exportStatementTypes, 'utf8');
    console.log(`Successfully appended type exports to ${distTypesPath}`);
  } catch (error) {
    console.error('Error appending loader exports:', error);
    process.exit(1);
  }
})();
