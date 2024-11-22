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
fixExtensions();
