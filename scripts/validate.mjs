import { spawnSync } from 'node:child_process';

const checks = [
  ['Lint', 'lint'],
  ['Typecheck', 'typecheck'],
  ['Tests', 'test'],
  ['Build', 'build'],
];

const results = [];
for (const [label, script] of checks) {
  console.log(`\n=== ${label} ===\n`);
  const result = spawnSync('npm', ['run', script], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  const passed = !result.error && result.status === 0;
  results.push({ label, passed });
  if (result.error) console.error(result.error.message);
}

console.log('\n=== Orbiter validation summary ===');
for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'}  ${result.label}`);
}
const failures = results.filter(result => !result.passed).length;
console.log(`\n${results.length - failures}/${results.length} checks passed.`);
process.exitCode = failures ? 1 : 0;
