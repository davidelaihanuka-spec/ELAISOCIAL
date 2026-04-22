const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const scanDirs = ['.', 'app', 'scripts'];
const ignoreDirs = new Set(['node_modules', '.git']);
const ignoreFiles = new Set(['app-config.local.js']);

function walk(dirPath, collected) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoreDirs.has(entry.name)) continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, collected);
      continue;
    }
    if (!entry.isFile() || path.extname(entry.name) !== '.js') continue;
    const relativePath = path.relative(root, fullPath);
    if (ignoreFiles.has(relativePath) || ignoreFiles.has(entry.name)) continue;
    collected.push(relativePath);
  }
}

function collectFiles() {
  const files = [];
  for (const dir of scanDirs) {
    const absoluteDir = path.join(root, dir);
    if (!fs.existsSync(absoluteDir)) continue;
    walk(absoluteDir, files);
  }
  return [...new Set(files)].sort((a, b) => a.localeCompare(b));
}

function checkFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  try {
    execSync(`node --check "${absolutePath}"`, {
      cwd: root,
      stdio: 'inherit',
    });
    console.log(`OK ${relativePath}`);
    return true;
  } catch (error) {
    console.error(`FAIL ${relativePath}`);
    return false;
  }
}

const files = collectFiles();
if (!files.length) {
  console.error('No JavaScript files found to check.');
  process.exit(1);
}

let allPassed = true;
for (const file of files) {
  if (!checkFile(file)) allPassed = false;
}

if (!allPassed) {
  process.exit(1);
}

console.log(`Checked ${files.length} JavaScript files successfully.`);
