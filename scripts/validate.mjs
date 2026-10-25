import { spawnSync } from 'node:child_process';

const checks = [['Lint', 'lint'], ['Typecheck', 'typecheck'], ['Tests', 'test'], ['Build', 'build']];
const MAX_OUTPUT = 2 * 1024 * 1024;
const MAX_LINES = 12;
const MAX_LINE_LENGTH = 220;
const results = [];

function compactErrors(output) {
  const lines = output
    .replace(/\x1b\[[0-9;]*m/g, '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  const matches = lines.filter(line =>
    /error|fail|exception|fatal|cannot|not found|invalid|✖|×|×|\bTS\d{4}\b/i.test(line)
  );
  const selected = matches.length ? matches : lines.slice(-MAX_LINES);
  const excerpt = selected.slice(0, MAX_LINES).map(line =>
    line.length > MAX_LINE_LENGTH ? line.slice(0, MAX_LINE_LENGTH) + '… [truncated]' : line
  );
  if (selected.length > MAX_LINES) excerpt.push(`… ${selected.length - MAX_LINES} more matching lines omitted`);
  if (output.length >= MAX_OUTPUT) excerpt.push('… process output reached the 2 MiB capture limit');
  return excerpt;
}

for (const [label, script] of checks) {
  const start = Date.now();
  // On Windows, cmd.exe resolves npm.cmd without shell:true (and its security warning).
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', `npm run ${script}`]
    : ['run', script];
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    maxBuffer: MAX_OUTPUT,
    windowsHide: true,
  });
  const passed = !result.error && result.status === 0;
  const output = (result.stdout ?? '') + '\n' + (result.stderr ?? '');
  const errors = passed ? [] : compactErrors(output || result.error?.message || 'No diagnostic output');
  if (result.error) errors.unshift(`Process error: ${result.error.message}`);
  results.push({ label, passed, errors, seconds: ((Date.now() - start) / 1000).toFixed(1) });
}

console.log('\n=== ORBITER VALIDATION REPORT (copy this block) ===');
for (const { label, passed, errors, seconds } of results) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${label} (${seconds}s)`);
  for (const error of errors.slice(0, MAX_LINES + 2)) console.log(`  ${error}`);
}
const failed = results.filter(result => !result.passed).length;
console.log(`RESULT: ${results.length - failed}/${results.length} passed`);
console.log('=== END ORBITER REPORT ===');
process.exitCode = failed ? 1 : 0;
