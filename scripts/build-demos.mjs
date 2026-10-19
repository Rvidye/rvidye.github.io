// Builds every standalone demo and copies it into the site.
//
//   demos/<id>/          an independent npm package with its own dependencies
//   demos/<id>/dist/     what its `npm run build` produces (must contain index.html)
//   public/lab/<id>/     where this script copies it; Astro then serves it at /lab/<id>/
//
// public/lab/ is generated and git-ignored. This script only ever writes to
// public/lab/<id>/ for ids that have a demos/<id>/ folder, and refuses to touch
// a directory that contains files tracked by git (i.e. hand-managed assets).
//
// Usage: node scripts/build-demos.mjs [id ...]   (no ids = all demos)

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const demosDir = join(root, 'demos');
const labDir = join(root, 'public', 'lab');
const requested = process.argv.slice(2);

function run(command, cwd) {
  // A shell lets Windows resolve npm.cmd. Commands here are fixed strings, never user input.
  const result = spawnSync(command, { cwd, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    throw new Error(`"${command}" failed in ${relative(root, cwd)}`);
  }
}

function trackedFiles(dir) {
  const result = spawnSync('git', ['ls-files', '--', relative(root, dir)], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) return []; // not a git checkout: nothing can be tracked
  return result.stdout.split('\n').filter(Boolean);
}

const ids = existsSync(demosDir)
  ? readdirSync(demosDir).filter(
      (name) => !name.startsWith('.') && !name.startsWith('_') && existsSync(join(demosDir, name, 'package.json')),
    )
  : [];

for (const id of requested) {
  if (!ids.includes(id)) throw new Error(`No demo named "${id}" in demos/.`);
}

// The old editor is retained as source only. It is not part of the portfolio.
const toBuild = requested.length > 0 ? requested : ids.filter((id) => id !== 'shader-study');
if (toBuild.length === 0) {
  console.log('[build-demos] No demos to build.');
}

for (const id of toBuild) {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Demo folder "${id}" must use lowercase letters, digits and hyphens.`);
  const demoDir = join(demosDir, id);
  const distDir = join(demoDir, 'dist');
  const target = join(labDir, id);

  console.log(`\n[build-demos] ${id}`);
  if (!existsSync(join(demoDir, 'node_modules'))) {
    if (!existsSync(join(demoDir, 'package-lock.json'))) {
      throw new Error(`demos/${id} has no package-lock.json. Run "npm install" in that folder and commit the lockfile.`);
    }
    run('npm ci --no-fund --no-audit', demoDir);
  }
  run('npm run build', demoDir);

  if (!existsSync(join(distDir, 'index.html'))) {
    throw new Error(`demos/${id}: "npm run build" must produce dist/index.html.`);
  }

  const tracked = trackedFiles(target);
  if (tracked.length > 0) {
    throw new Error(`Refusing to overwrite ${relative(root, target)}: it contains files tracked by git (${tracked[0]}, …).`);
  }
  rmSync(target, { recursive: true, force: true });
  mkdirSync(labDir, { recursive: true });
  cpSync(distDir, target, { recursive: true });
  console.log(`[build-demos] ${id} → ${relative(root, target)}`);
}

// Leftovers from demos that no longer exist would still be deployed; flag them.
if (existsSync(labDir)) {
  for (const name of readdirSync(labDir)) {
    if (statSync(join(labDir, name)).isDirectory() && !ids.includes(name)) {
      console.warn(`[build-demos] Warning: public/lab/${name}/ has no demos/${name}/ source. Delete it if it is stale.`);
    }
  }
}
