// Checks every external link (<a href="http…">) in the built site.
// Run after `npm run build`:  npm run check:links
//
// GitHub repository links are checked through the GitHub API, so a private or
// deleted repository is reported instead of silently 404-ing for visitors.
// Some sites refuse automated requests; those links are reported as
// "unverified" so you can open them by hand. Exits with 1 if any link is broken.

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const dist = join(resolve(import.meta.dirname, '..'), 'dist');
const TIMEOUT_MS = 15000;
const CONCURRENCY = 4;
// Statuses that mean "this server blocks scripts", not "this page is gone".
const BOT_BLOCK_STATUSES = new Set([401, 403, 429, 999]);

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

/** url → pages it appears on */
const links = new Map();
for (const file of htmlFiles(dist)) {
  const page = '/' + relative(dist, file).replace(/\\/g, '/').replace(/index\.html$/, '');
  for (const [, url] of readFileSync(file, 'utf8').matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"]+)"/g)) {
    const decoded = url.replace(/&amp;/g, '&');
    if (!links.has(decoded)) links.set(decoded, new Set());
    links.get(decoded).add(page);
  }
}

async function request(url, method) {
  return fetch(url, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'User-Agent': 'Mozilla/5.0 (link check for rvidye.github.io)', Accept: '*/*' },
  });
}

async function checkGitHub(url) {
  const [owner, repo] = new URL(url).pathname.split('/').filter(Boolean);
  const api = repo ? `https://api.github.com/repos/${owner}/${repo}` : `https://api.github.com/users/${owner}`;
  const response = await request(api, 'GET');
  if (response.status === 404) return { result: 'broken', detail: repo ? 'private or missing repository' : 'no such user' };
  if (!response.ok) return { result: 'unverified', detail: `GitHub API returned ${response.status} (rate limit?)` };
  return { result: 'ok', detail: '' };
}

async function check(url) {
  try {
    if (new URL(url).hostname === 'github.com') return await checkGitHub(url);
    let response = await request(url, 'HEAD');
    if (!response.ok && response.status !== 999) response = await request(url, 'GET');
    if (response.ok) return { result: 'ok', detail: '' };
    if (BOT_BLOCK_STATUSES.has(response.status)) {
      return { result: 'unverified', detail: `${response.status}: the site refuses automated requests; open it by hand` };
    }
    return { result: 'broken', detail: `HTTP ${response.status}` };
  } catch (error) {
    return { result: 'broken', detail: error.cause?.code ?? error.name ?? String(error) };
  }
}

const queue = [...links.keys()].sort();
const results = [];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      results.push({ url, ...(await check(url)) });
    }
  }),
);

const LABEL = { ok: 'ok        ', unverified: 'UNVERIFIED', broken: 'BROKEN    ' };
for (const { url, result, detail } of results.sort((a, b) => a.url.localeCompare(b.url))) {
  const pages = [...links.get(url)].join(', ');
  console.log(`${LABEL[result]}  ${url}${detail ? `  (${detail})` : ''}\n            on ${pages}`);
}

const broken = results.filter((r) => r.result === 'broken').length;
const unverified = results.filter((r) => r.result === 'unverified').length;
console.log(`\n${results.length} external links: ${results.length - broken - unverified} ok, ${unverified} unverified, ${broken} broken.`);
process.exitCode = broken > 0 ? 1 : 0;
