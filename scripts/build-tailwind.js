const { execSync } = require('child_process');
const path = require('path');

const input = path.resolve(__dirname, '../src/webparts/intranetHub/assets/tailwind-input.css');
const output = path.resolve(__dirname, '../src/webparts/intranetHub/assets/tailwind.css');
const config = path.resolve(__dirname, '../tailwind.config.js');

console.log('[Tailwind] Compiling CSS...');
execSync(`npx tailwindcss -c "${config}" -i "${input}" -o "${output}" --minify`, {
  stdio: 'inherit',
  cwd: path.resolve(__dirname, '..')
});
console.log('[Tailwind] Done.');
