// Watches all package src directories for changes and automatically rebuilds only the
// affected packages using 'yarn build' when a change is detected.

const { execSync } = require('child_process');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

const packagesDir = path.resolve(__dirname, '../packages');
const packageNames = fs.readdirSync(packagesDir).filter(dir => fs.statSync(path.join(packagesDir, dir)).isDirectory());

for (const pkg of packageNames) {
  const srcPath = path.join(packagesDir, pkg, 'src');
  if (!fs.existsSync(srcPath)) continue;

  chokidar.watch(`${srcPath}/**/*`, { ignoreInitial: true }).on('all', () => {
    console.log(`[${pkg}] change detected — rebuilding...`);
    console.log(`[${pkg}] running 'yarn build' in:`, path.join(packagesDir, pkg));
    try {
      execSync(`yarn build`, { cwd: path.join(packagesDir, pkg), stdio: 'inherit' });
    } catch (err) {
      console.error(`[${pkg}] build failed:`, err.message);
    }
  });
}
