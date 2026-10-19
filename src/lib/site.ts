/**
 * Site-wide identity, navigation and contact details.
 *
 * The public URL is not here: it is `site` in astro.config.mjs, and pages read
 * it through `Astro.site`.
 */

const NAME = 'Rushikesh Vidye';

export const SITE = {
  title: NAME,
  author: NAME,
  /** Every spelling of the name used on publications; highlighted in author lists. */
  authorNames: [NAME, 'Rushikesh Ganesh Vidye'],
  description:
    'Research, projects, experiments, and everyday notes by Rushikesh Vidye.',
  lang: 'en',
} as const;

/**
 * Path of the resume PDF inside public/, e.g. '/resume.pdf'.
 * Leave as null until the final PDF is committed.
 */
export const RESUME_PATH: string | null = null;

export interface NavItem {
  label: string;
  /** Items without a destination are omitted from navigation. */
  href: string | null;
}

// Internal paths end in '/' to match trailingSlash: 'always'.
export const NAV: readonly NavItem[] = [
  { label: 'Projects', href: '/projects/' },
  { label: 'Publications', href: '/publications/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Demos', href: '/demos/' },
  { label: 'About', href: '/about/' },
];

export interface ContactLink {
  label: string;
  href: string;
}

export const CONTACT: readonly ContactLink[] = [
  { label: 'Email', href: 'mailto:rvidye@gmail.com' },
  { label: 'GitHub', href: 'https://github.com/Rvidye' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rushikesh-vidye/' },
];
