import * as glob from 'glob';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

async function fixExtensions() {
  try {
    const files = [
      ...glob.sync('./lib/components/stencil-generated/**/*.ts'),
      ...glob.sync('./lib/components/stencil-generated/**/*.tsx'),
    ];
    for (const file of files) {
      // Read the file content
      let content = await fs.readFile(file, 'utf8');

      // Replace relative imports to include correct extensions
      content = content.replace(/(from\s+['"])(\.\.?(\/[^\s'"]+)?)/g, (match, prefix, importPath) => {
        const resolvedPath = path.resolve(path.dirname(file), importPath);
        console.log('Resolved path:', resolvedPath);
        try {
          // Check if the path resolves to a file
          if (existsSync(`${resolvedPath}.ts`) || existsSync(`${resolvedPath}.tsx`)) {
            return `${prefix}${importPath}.js`;
          }

          // Check if the path resolves to a directory with an index.js
          if (existsSync(path.join(resolvedPath, 'index.ts')) || existsSync(path.join(resolvedPath, 'index.tsx'))) {
            return `${prefix}${importPath}/index.js`;
          }

          return match;
        } catch (err) {
          console.error(`Error resolving path for ${importPath} in ${file}:`, err);
          return match;
        }
      });

      // Write the updated content back to the file
      await fs.writeFile(file, content, 'utf8');
    }

    console.log('File extensions fixed successfully!');
  } catch (error) {
    console.error('Error fixing file extensions:', error);
    process.exit(1);
  }
}

async function fixFunctionTyping() {
  try {
    const indexFile = './lib/components/stencil-generated/react-component-lib/index.ts';
    const brokenFile = './lib/components/stencil-generated/react-component-lib/createOverlayComponent.tsx';
    const indexContentToFix = `export { createOverlayComponent } from './createOverlayComponent.js';`;

    const indexContent = await fs.readFile(indexFile, 'utf-8');
    await fs.writeFile(indexFile, indexContent.replace(indexContentToFix, ''), 'utf-8');
    try {
      await fs.unlink(brokenFile);
    } catch (error) {
      console.error('Error deleting broken file:', error);
    }

    const utilsFile = './lib/components/stencil-generated/react-component-lib/utils/index.tsx';
    const utilsContentToFix = 'return React.forwardRef(forwardRef);'
    const utilsFixedContent = 'return React.forwardRef<any, any>(forwardRef);';

    const utilsContent = await fs.readFile(utilsFile, 'utf-8');
    await fs.writeFile(utilsFile, utilsContent.replace(utilsContentToFix, utilsFixedContent), 'utf-8');

    console.log('Function typing fixed successfully!');
  } catch (error) {
    console.error('Error fixing file types:', error);
    process.exit(1);
  }
}

fixExtensions().then(fixFunctionTyping);
