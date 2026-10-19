/**
 * Every page queries content through these helpers, so the draft rule and the
 * sort orders live in one place.
 */
import { getCollection, getEntries, getEntry, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'work'>;
export type Post = CollectionEntry<'writing'>;
export type Publication = CollectionEntry<'publications'>;
export type Demo = CollectionEntry<'demos'>;

/**
 * Drafts are visible in `npm run dev` (marked as drafts) and absent from
 * production builds: no listing, no route, no link.
 */
export function isVisible(entry: { data: { draft: boolean } }): boolean {
  return import.meta.env.DEV || !entry.data.draft;
}

// URLs. Internal paths end in '/' to match trailingSlash: 'always'.
export const workUrl = (entry: Work) => `/work/${entry.id}/`;
export const postUrl = (entry: Post) => `/blog/${entry.id}/`;

/** Built from demos/<id>/ in this repo, as opposed to hosted elsewhere. */
export function isLocalDemo(demo: Demo): boolean {
  if (!demo.data.url.startsWith('/')) return false;
  if (demo.data.url !== `/lab/${demo.id}/`) {
    throw new Error(`demos/${demo.id}: a local demo's url must be /lab/${demo.id}/ (got ${demo.data.url}).`);
  }
  return true;
}

/** Where a demo's title links: its embed page here, or the external host. */
export const demoUrl = (demo: Demo) => `/demos/${demo.id}/`;

export const KIND_LABEL: Record<Work['data']['kind'], string> = {
  research: 'Research',
  project: 'Project',
  experiment: 'Experiment',
};

export const STATUS_LABEL: Record<Work['data']['status'], string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  archived: 'Archived',
};

/** The index page a piece of work belongs to; also used for nav highlighting. */
export const SECTION_FOR_KIND: Record<Work['data']['kind'], { label: string; href: string }> = {
  research: { label: 'Projects', href: '/projects/' },
  project: { label: 'Projects', href: '/projects/' },
  experiment: { label: 'Projects', href: '/projects/' },
};

export interface LinkItem {
  label: string;
  url: string;
  /** Text before the link, e.g. "Related:". */
  prefix?: string;
}

// Fixed order and wording for the owner's own outputs.
const WORK_LINK_LABELS = [
  ['paper', 'Paper'],
  ['poster', 'Poster'],
  ['code', 'Code'],
  ['video', 'Video'],
  ['slides', 'Slides'],
  ['demo', 'Demo'],
  ['website', 'Website'],
] as const;

/** A work entry's own links, then its related links, in display order. */
export function workLinks(entry: Work): LinkItem[] {
  const own = WORK_LINK_LABELS.flatMap(([key, label]) => {
    const url = entry.data.links[key];
    return url ? [{ label, url }] : [];
  });
  const related = entry.data.related.map((r) => ({ label: r.label, url: r.url, prefix: 'Related:' }));
  return [...own, ...related];
}

const STATUS_RANK: Record<Work['data']['status'], number> = { ongoing: 0, completed: 1, archived: 2 };

/** Newer first; entries without a date go last. */
function byDateDesc(a?: Date, b?: Date): number {
  return (b?.getTime() ?? -Infinity) - (a?.getTime() ?? -Infinity) || 0;
}

/**
 * By `order` (set in each entry, lowest first), then ongoing before finished,
 * then most recent, then alphabetical. Entries without an order come last.
 */
function compareWork(a: Work, b: Work): number {
  return (
    a.data.order - b.data.order ||
    STATUS_RANK[a.data.status] - STATUS_RANK[b.data.status] ||
    byDateDesc(a.data.endDate ?? a.data.startDate, b.data.endDate ?? b.data.startDate) ||
    a.data.title.localeCompare(b.data.title)
  );
}

export async function getWork(kinds?: Work['data']['kind'][]): Promise<Work[]> {
  const work = await getCollection('work', (entry) => isVisible(entry) && (!kinds || kinds.includes(entry.data.kind)));
  return work.sort(compareWork);
}

/**
 * Optional featured selection: ascending `order`, then by title.
 * Published entries only, even in dev. Home uses its own curated threads.
 */
export async function getFeaturedWork(): Promise<Work[]> {
  const work = await getWork();
  return work
    .filter(({ data }) => data.featured && !data.draft)
    .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

/** Newest first. Drafts have no date until published, so they sort last in dev. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('writing', isVisible);
  return posts.sort((a, b) => byDateDesc(a.data.date, b.data.date) || a.data.title.localeCompare(b.data.title));
}

/** Newest year first, then by title. */
export async function getPublications(): Promise<Publication[]> {
  const pubs = await getCollection('publications', isVisible);
  return pubs.sort((a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title));
}

export async function getDemos(): Promise<Demo[]> {
  // Keep the old scaffold on disk, but never present it as the owner's work.
  const demos = await getCollection('demos', (entry) => entry.id !== 'shader-study' && isVisible(entry));
  return demos.sort((a, b) => byDateDesc(a.data.date, b.data.date) || a.data.title.localeCompare(b.data.title));
}

/*
 * Astro only logs a reference to a missing entry; the build still succeeds.
 * These helpers throw instead, so a typo in an ID fails the build of any page
 * that uses it.
 */
function assertResolved<T>(entries: (T | undefined)[], refs: { collection: string; id: string }[], from: string): T[] {
  const missing = refs.filter((_, i) => entries[i] === undefined);
  if (missing.length > 0) {
    const list = missing.map((ref) => `${ref.collection}/${ref.id}`).join(', ');
    throw new Error(`${from} references entries that don't exist: ${list}`);
  }
  return entries as T[];
}

/** The project page each publication belongs to, by publication id. */
export async function getPublicationProjects(): Promise<Map<string, { title: string; href: string }>> {
  const map = new Map<string, { title: string; href: string }>();
  for (const work of await getWork()) {
    for (const ref of work.data.relatedPublications) {
      if (!map.has(ref.id)) map.set(ref.id, { title: work.data.title, href: workUrl(work) });
    }
  }
  return map;
}

/** A work entry's publications, dropping drafts in production. */
export async function getRelatedPublications(entry: Work): Promise<Publication[]> {
  const refs = entry.data.relatedPublications;
  const pubs = assertResolved(await getEntries(refs), refs, `work/${entry.id}`);
  return pubs.filter(isVisible);
}

/** The work entries an article is about, dropping drafts in production. */
export async function getRelatedWork(post: Post): Promise<Work[]> {
  const refs = post.data.relatedWork;
  const work = assertResolved(await getEntries(refs), refs, `writing/${post.id}`);
  return work.filter(isVisible);
}

/** The work entry a demo belongs to, if it has one and it is visible. */
export async function getDemoWork(demo: Demo): Promise<Work | undefined> {
  const ref = demo.data.work;
  if (!ref) return undefined;
  const [work] = assertResolved([await getEntry(ref)], [ref], `demos/${demo.id}`);
  return work && isVisible(work) ? work : undefined;
}

/** Posts and demos that point at this piece of work. */
export async function getWorkBacklinks(entry: Work): Promise<{ posts: Post[]; demos: Demo[] }> {
  const [posts, demos] = await Promise.all([getPosts(), getDemos()]);
  return {
    posts: posts.filter((p) => p.data.relatedWork.some((ref) => ref.id === entry.id)),
    demos: demos.filter((d) => d.data.work?.id === entry.id),
  };
}

/** Recognition across work and demos, for the About page. */
export async function getRecognition(): Promise<
  { label: string; url?: string; year?: number; source: string; sourceUrl: string }[]
> {
  const [work, demos] = await Promise.all([getWork(), getDemos()]);
  return [
    ...work.flatMap((w) =>
      w.data.recognition.map((r) => ({ ...r, source: w.data.title, sourceUrl: workUrl(w) })),
    ),
    ...demos.flatMap((d) =>
      d.data.recognition.map((r) => ({ ...r, source: d.data.title, sourceUrl: demoUrl(d) })),
    ),
  ];
}

/** Dates in content are calendar dates, so format them in UTC. */
export function formatDate(date: Date, month: 'short' | 'long' = 'long'): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month, year: 'numeric', timeZone: 'UTC' });
}

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
