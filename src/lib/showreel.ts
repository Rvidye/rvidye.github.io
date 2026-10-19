import type { ImageMetadata } from 'astro';
import { getEntry } from 'astro:content';

/** Entries selected by intro.md's existing `showreel` configuration. */
export interface ShowreelRef {
  work?: string;
  demo?: string;
}

export interface ShowreelFrame {
  src: ImageMetadata;
  alt: string;
  caption: string;
}

/**
 * Take one gallery frame from each configured entry in turn. Draft entries are
 * always excluded, and a missing entry fails the build instead of losing media.
 */
export async function getShowreelFrames(refs: readonly ShowreelRef[] = []): Promise<ShowreelFrame[]> {
  const sources = await Promise.all(refs.map(async (ref) => {
    const entry = ref.work ? await getEntry('work', ref.work) : ref.demo ? await getEntry('demos', ref.demo) : undefined;
    if (!entry) throw new Error(`intro.md showreel: no entry for ${JSON.stringify(ref)}.`);
    if (entry.data.draft) return [];

    const name = entry.data.title.split(':')[0];
    return entry.data.gallery.map((frame) => ({
      src: frame.src,
      alt: frame.alt,
      caption: frame.caption && frame.caption !== name ? `${frame.caption} · ${name}` : name,
    }));
  }));

  return Array.from({ length: Math.max(0, ...sources.map((source) => source.length)) }, (_, index) =>
    sources.map((source) => source[index]).filter((frame) => frame !== undefined),
  ).flat();
}
