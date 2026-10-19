# Adding things to the site

Pages come from Markdown or MDX in `src/content/`. Use `.mdx` when adding an
image or an embedded video. The file name becomes the permanent page ID.

| What you are adding | Copy this starting point | Save it in | Page URL |
| --- | --- | --- | --- |
| Personal project | `templates/personal-project.mdx` | `src/content/work/<id>.mdx` | `/work/<id>/` |
| Research project | `templates/research-project.mdx` | `src/content/work/<id>.mdx` | `/work/<id>/` |
| Blog post | `templates/blog-post.mdx` | `src/content/writing/<id>.mdx` | `/blog/<id>/` |
| Technical writing | `templates/technical-post.mdx` | `src/content/writing/<id>.mdx` | `/blog/<id>/` |
| Personal note or life update | `templates/personal-note.mdx` | `src/content/writing/<id>.mdx` | `/blog/<id>/` |

Run `npm run dev` and open `/dev/templates/` to compare all five page templates.
They use the same layouts as the real pages, with clearly labelled example text.
The templates and their preview routes are excluded from production builds.

Replace the prompts, title, and description. Delete sections that do not fit.
Headings in the body start at `##`; the layout supplies the page title.

## Editing and previewing a page

An `.mdx` file is Markdown with a few extras: a frontmatter block at the top
(between `---` lines), `import` lines, and components such as `<Figure>` that
place images, video and embeds exactly where they sit in the text.

1. Run `npm run dev` in the repository folder and leave it running.
2. Open the page in your browser, for example <http://localhost:4321/work/foxrt/>
   or <http://localhost:4321/demos/mayasabha/>.
3. Edit the file, for example `src/content/work/foxrt.mdx` or
   `src/content/demos/mayasabha.mdx`, and save. The page reloads by itself.
4. If something is wrong (a typo in a field, a missing image, an unclosed tag),
   the error appears in the browser and in the terminal, naming the file and line.

In VS Code, the **Astro** extension (`astro-build.astro-vscode`) highlights
`.astro` and `.mdx` files and checks component props as you type.

Every project and demo page uses the same shell (`src/layouts/ProjectPage.astro`):
back link, kind, title, facts and recognition, with a fact sheet beside them
(links, made with, related), then your MDX body. The `description` is used for
search results, link previews and listings, and is not repeated on the page.

### The page grid

Every page sits on one 12-column grid across the site's width (`.grid` in
`src/styles/global.css`), so things line up from page to page, like a poster:

- **Left line:** the logo, and every title, paragraph, caption and picture.
- **Aside line** (column 9): fact sheets, dates on the About page, the portrait,
  and each project's picture on the Projects page.
- **Right line:** where the menu ends; pictures, video, sliders and embeds run
  to it.

In an MDX body you don't need to do anything: text stays on the text column at a
comfortable line length, and every `<Figure>`, `<Video>`, `<YouTube>`,
`<FigureGrid>` and `<CompareSlider>` spans the full width. Square or portrait
videos stop at the text column, with their caption on the aside line. In new
page code, use `class="grid"` on a container and `col-text` / `col-aside` on
its children. On phones everything is one column.

## Drafts and publication

- Keep `draft: true` until a page is ready. Drafts are visible and labelled in
  local development, and omitted from production pages, lists, sitemap, and RSS.
- Work, publications, and demos default to published; all copied templates
  explicitly start as drafts. Posts default to drafts.
- A post needs `date: YYYY-MM-DD` before setting `draft: false`. Add `updated:`
  for a later revision if useful.
- Run `npm run build`, then `npm run preview`, before publishing. Check the
  changed pages at both phone and desktop widths.
- Use confirmed facts and public links. Leave optional fields out rather than
  guessing dates, roles, publication details, or results.

## Projects and research

Both appear under **Projects**. `kind: research | project | experiment` selects
the small label on the detail page. `status: ongoing | completed | archived`
describes its state. Optional fields include `role`, `startDate`, `endDate`,
`tags`, and `technologies`.

`order: 1`, `order: 2`, … sets the position on the Projects page, lowest first;
entries without an `order` follow, newest first. Give every project a
`heroImage` (see below): it is the picture beside the project on that page.
Awards and posters listed under `recognition` get a star under the project's
title, and the first one becomes a ribbon on its picture on the Projects page.
Give each a short `badge` for that ribbon:

```yaml
recognition:
  - label: Juror Choice Award, Teapot Rendering Competition 2025
    url: https://graphics.cs.utah.edu/trc/?year=2025
    year: 2025
    badge: TRC 2025 Juror Choice
```

Choose homepage links explicitly in `src/content/home/explore.md` (see "The
homepage" below). `featured` and `order` do not control that list, and completed
or archived work can be chosen alongside ongoing work. Homepage destinations
must be published.

Optional `links` keys are `paper`, `poster`, `code`, `video`, `slides`, `demo`, and
`website`. They appear near the title. Other references go in
`related: [{ label: ..., url: ... }]`. A `links.video` URL is a text link;
use the `video` field below for an embedded lead video.

### Thumbnail and link preview

Put originals in `src/assets/work/<id>/`. Astro creates responsive images.
Paths in frontmatter are relative to the content file:

```yaml
heroImage:
  src: ../../assets/work/my-project/render.jpg
  alt: Describe what the image shows.
```

`heroImage` is the project's thumbnail on the Projects page and its picture in
link previews. It is not placed on the project page itself: put images in the
body with `<Figure>`, in the section of the story they belong to (see "Images
and media inside any page"). `mediaSlot` is an optional private authoring note
and does not create a placeholder on the page.

### A lead video

For YouTube, add a video ID or a regular YouTube watch/share URL:

```yaml
video:
  type: youtube
  id: https://www.youtube.com/watch?v=YOUR_VIDEO_ID
  title: A descriptive title for the video
  caption: Optional caption.
```

For a local recording, put it in `public/media/<id>/` and use its public path:

```yaml
video:
  type: local
  src: /media/my-project/demo.mp4
  title: Describe what the recording demonstrates
  poster: ../../assets/work/my-project/poster.jpg  # optional
  width: 1920                                   # optional; default 1920
  height: 1080                                  # optional; default 1080
  caption: Optional caption.
  captions:                                     # optional WebVTT captions
    src: /media/my-project/captions.vtt
    srclang: en
    label: English
```

A `video` in the frontmatter is shown at the top of the page, before the body;
`heroImage` stays the thumbnail and social preview. Local video uses native controls, `preload="none"`,
and no autoplay. Videos are not transcoded; use reasonably sized MP4 files or
set `mimeType: video/webm` for WebM. Keep large archives off the site repository.

## Images and media inside any page

These imports work after copying a template into `src/content/work/` or
`src/content/writing/`. Captions go between the component tags.

```mdx
import Figure from '../../components/Figure.astro';
import Video from '../../components/Video.astro';
import YouTube from '../../components/YouTube.astro';
import ShaderToy from '../../components/ShaderToy.astro';
import FigureGrid from '../../components/FigureGrid.astro';
import CompareSlider from '../../components/CompareSlider.astro';
import image from '../../assets/work/my-project/render.jpg';
import before from '../../assets/work/my-project/before.png';
import after from '../../assets/work/my-project/after.png';

<Figure src={image} alt="Describe the image.">An image caption.</Figure>

{/* Two or three images in a row; four make a 2 × 2 grid. */}
<FigureGrid items={[
  { src: before, alt: 'Describe it.', caption: 'Short caption.' },
  { src: after, alt: 'Describe it.', caption: 'Short caption.' },
]} />

{/* Same view, two renders: drag across (or use the arrow keys) to compare. */}
<CompareSlider
  before={{ src: before, alt: 'Describe it.', label: 'Before · 7 hours' }}
  after={{ src: after, alt: 'Describe it.', label: 'After · 35 minutes' }}
>
  Optional caption. Keep the `>` on its own line: a line that starts with `>`
  and text is read as a quotation and breaks the page.
</CompareSlider>

<Video src="/media/my-project/demo.mp4" title="A descriptive video title"
  poster={image} width={1920} height={1080}
  captions={{ src: '/media/my-project/captions.vtt', srclang: 'en', label: 'English' }}>
  A recording caption.
</Video>

<YouTube id="YOUR_VIDEO_ID" title="A descriptive video title">
  A video caption.
</YouTube>

<ShaderToy src="https://www.shadertoy.com/view/SHADER_ID" title="A descriptive shader title" />
```

`Video` requires `src` and `title`; poster, dimensions, captions, and MIME `type`
are optional. `YouTube` requires `id` (11-character ID, YouTube watch URL, or
`youtu.be` URL) and `title`. It uses a responsive, lazy `youtube-nocookie.com`
iframe. Give it `poster={image}` (for example the video's thumbnail) and it
shows that picture with a Play button instead; YouTube's player loads only when
the reader presses it. A lead `video` of `type: youtube` takes `poster:` too. `ShaderToy` takes `src` (ShaderToy URL or six-character ID) and `title`;
`id` is an optional alias for `src`. Official `/embed/<id>` URLs retain their
supplied playback query; view URLs and bare IDs use a paused, muted default.
It includes a link to the original. YouTube iframes load lazily. `CompareSlider`
needs two images with the same aspect ratio; `Video` also accepts `loop` for short
clips (it still never starts by itself). Square or portrait videos stop at 75% of
the screen height. `ShaderToy` takes an optional `poster={{ src, alt }}`: with it,
the player loads only when the reader presses Run.

## Blog, technical writing, and personal notes

All three share **Blog** and the same reading layout. Set
`kind: blog | technical | personal`; the default is `blog`.
`relatedWork: [project-id]` connects a post to a work page. `tags` and an optional
`image: { src: ..., alt: ... }` can also be added.

Code fences with a language are highlighted. Markdown tables and footnotes are
supported; math typesetting is not installed. `/dev/typography/` is a local
typography specimen.

## Publications and demos

Publications live in `src/content/publications/`. Copy bibliographic details
from the publisher: `title`, `authors` in published order, `type`, `venue`, and
`year`. Optional fields are `note` (shown after the venue, e.g. `pages 195–198`),
`award` (e.g. `Best Paper Award`, marked with a star), `doi`, `links`, and
verbatim `bibtex`. Every publication appears on the Publications page, on a
highlighted band at the top of Projects, and on the About page; one that a
project lists in `relatedPublications` also links to that project.
Supported types: `paper`, `poster`, `talk`, `demo`, `thesis`, `preprint`, `report`.
Add its ID to a project's `relatedPublications` to display it there. Never invent
a DOI or citation. Published references are checked during the build. Your name
is set in bold in author lists; if a publication spells it differently (for
example with a middle name), add that spelling to `authorNames` in
`src/lib/site.ts`.

Demos live in `src/content/demos/` and appear under **Demos**. A file needs a
`title`, `description`, and `url`. A demo page opens with the demo itself: for
ShaderToy, the `thumbnail` with a Run button that loads ShaderToy's player in
place (nothing is requested from ShaderToy until then); or the demo built in this
repository. Your MDX body follows it. ShaderToy only allows public shaders to be
embedded; while a shader is private or unlisted, Run shows a blank frame, and the
"Open on ShaderToy" link under the picture still works. To preserve a supplied
player URL and its playback settings, set `embedUrl` to the official
`https://www.shadertoy.com/embed/<id>?...` URL, alongside the normal `url`.
Other external demos link to their host. Optional fields include `host`,
`date`, `technologies`, `source`, `work`, and `recognition`.

A demo built in this repository lives in `demos/<id>/` and uses
`url: /lab/<id>/`. Its page is `/demos/<id>/`. See `demos/README.md` for the build
contract. There is no need to rebuild ShaderToy's editor inside this site.

## Site details

### The homepage

These files in `src/content/home/` can be edited without changing the layout:

| File | What it controls |
| --- | --- |
| `intro.md` | The introduction and its inline links. Keep its `showreel` frontmatter for Projects. |
| `now.md` | The **Lately** note. Its optional `updated: YYYY-MM-DD` is displayed above the text. |
| `explore.md` | The **Follow a thread** introduction and ordered `threads` list. |
| `links.md` | The **Useful things** shelf: an ordinary Markdown heading and links. |

**Lately** stays visible independently of blog posts. The homepage shows up to
three recent published posts once available; the blog section is hidden while
there are none. Use a personal-note template for a life update that needs its
own permanent page. The homepage photograph links to `/about/#photos`; the
photograph itself is selected in `src/pages/index.astro`.

For **Follow a thread**, give each item exactly one existing work or demo ID,
a `title`, and an optional `note`. The Markdown body below the frontmatter is
the section introduction:

```md
---
threads:
  - work: hairpt
    title: Hair rendering experiments
    note: Questions and experiments from HairPT.
  - demo: mayasabha
    title: A palace inside a shader.
---

A few things to wander through.
```

Items appear in the listed order, regardless of project status. Draft
destinations are hidden even in local development. A missing entry, or an item
with both IDs or neither ID, fails the build.

### The Projects showreel

The **In pictures** section on Projects is a slideshow of renders that advances
every five seconds, with previous, pause and next buttons. Its frames are
pictures, not links. List the projects whose frames it uses in
`src/content/home/intro.md`:

```yaml
showreel:
  - work: foxrt
  - work: hairpt
  - demo: mayasabha
```

Each listed entry supplies its `gallery` frames, taken in turn from each entry,
so one project never fills the reel. Draft entries are skipped; a missing entry
fails the build. Every published frame is used. Frames close to 16:9
fill the slide; square or portrait frames are shown whole on a dark background.
The caption reads "caption · project", using the part of the title before any
colon ("HairPT", not "HairPT: Path-Traced Hair…"):

```yaml
gallery:
  - src: ../../assets/work/my-project/frame.png
    alt: Describe the frame.
    caption: Short name for the frame   # shown as "caption · project title"
```

### The About page

- The bio is `src/content/home/bio.md`, plain Markdown.
- Education, experience, teaching and leadership, skills, and awards that don't
  belong to a project are lists in `src/lib/cv.ts`. Each entry has a title,
  place, dates, and optional bullet points and links.
- Project awards (`recognition` on a project or demo) and every publication
  are added automatically.
- The portrait and photos are in `src/assets/about/`; the list of photos and
  their captions is at the top of `src/pages/about.astro`. Photos go in pairs:
  on wide screens each pair shares a row at the same height. Re-save phone photos
  before adding them so their location and camera data are removed.

Name, description, contact links, and resume path live in `src/lib/site.ts`.
For a resume, put the final PDF in `public/resume.pdf` and set `RESUME_PATH` to
`/resume.pdf`.
