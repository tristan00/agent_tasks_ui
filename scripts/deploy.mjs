import {execSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const FILES = ['index.html', 'app.js', 'style.css'];
const url = (process.env.COORDINATOR_URL || 'http://127.0.0.1:4242').replace(/\/$/, '');

execSync('pnpm exec vite build', {stdio: 'inherit'});
const hash = createHash('sha256');
for (const name of FILES) {
  const bytes = readFileSync(join('dist', name));
  const size = Buffer.alloc(8);
  size.writeBigUInt64LE(BigInt(bytes.length));
  hash.update(size);
  hash.update(bytes);
}
const version = hash.digest('hex');
const response = await fetch(`${url}/api/deployment`);
if (!response.ok) throw Error(`Coordinator at ${url} answered ${response.status}`);
const reported = String((await response.json()).dataDirectory);
const data = reported.startsWith('\x5c\x5c?\x5c') ? reported.slice(4) : reported;
const root = join(data, 'ui');
const target = join(root, version);
if (!existsSync(join(target, 'complete'))) {
  mkdirSync(target, {recursive: true});
  for (const name of FILES) copyFileSync(join('dist', name), join(target, name));
  writeFileSync(join(target, 'complete'), version);
}
writeFileSync(join(root, 'current.tmp'), version);
renameSync(join(root, 'current.tmp'), join(root, 'current'));
for (const name of FILES) {
  const served = Buffer.from(await (await fetch(`${url}/${name === 'index.html' ? '' : name}`)).arrayBuffer());
  if (!served.equals(readFileSync(join('dist', name)))) {
    console.error(`${url}/${name} does not serve the deployed ${name}; the coordinator must serve the UI from ${root}`);
    process.exit(1);
  }
}
console.log(JSON.stringify({version: `sha256:${version}`, url, directory: target}));
