const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

const requiredFiles = [
  'index.html',
  'style.css',
  'core.js',
  'clients.js',
  'calendar.js',
  'pipeline.js',
  'scripts.js',
  'tracking.js',
];

const requiredDirectories = ['app'];

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function copyFile(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(dist, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function copyDirectory(relativePath) {
  const source = path.join(root, relativePath);
  const target = path.join(dist, relativePath);
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const childRelativePath = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(childRelativePath);
    } else if (entry.isFile()) {
      copyFile(childRelativePath);
    }
  }
}

function jsString(value) {
  return JSON.stringify(value);
}

function writeRuntimeConfig() {
  const url = requireEnv('REEL_SUPABASE_URL');
  const anonKey = requireEnv('REEL_SUPABASE_ANON_KEY');
  const bucket = (process.env.REEL_SUPABASE_BUCKET || 'reel-files').trim() || 'reel-files';

  const config = `window.REEL_APP_CONFIG = {
  url: ${jsString(url)},
  anonKey: ${jsString(anonKey)},
  bucket: ${jsString(bucket)},
};
`;

  fs.writeFileSync(path.join(dist, 'app-config.local.js'), config, 'utf8');
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of requiredFiles) {
  copyFile(file);
}

for (const directory of requiredDirectories) {
  copyDirectory(directory);
}

writeRuntimeConfig();

console.log(`Netlify build written to ${dist}`);
