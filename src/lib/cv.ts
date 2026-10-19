/**
 * The CV on the About page: education, experience, teaching and leadership,
 * awards that don't belong to a project, and skills. Copied from the resume;
 * edit here and the About page follows. Project awards (TRC, HPG, Project Expo)
 * come from the `recognition` of each project and demo, so they are not
 * repeated here.
 */

export interface CvItem {
  /** Degree or role. */
  what: string;
  /** Institution or company. */
  where: string;
  place?: string;
  /** As written on the resume, e.g. 'June 2023 – July 2025'. */
  when?: string;
  /** One short line under the title, e.g. a GPA. */
  detail?: string;
  points?: string[];
  /** Public links about this item, e.g. a demo recording. */
  links?: { label: string; url: string }[];
}

export const EDUCATION: CvItem[] = [
  {
    what: 'MS in Computing: Graphics and Visualization',
    where: 'University of Utah',
    place: 'Salt Lake City, UT',
    when: 'Expected April 2027',
    detail: 'GPA 3.9 / 4.0',
  },
  {
    what: 'Bachelor of Engineering, Computer Science',
    where: 'Pune Institute of Computer Technology',
    place: 'Pune, India',
    when: 'May 2023',
    detail: 'CGPA 8.50 / 10.0',
  },
];

export const EXPERIENCE: CvItem[] = [
  {
    what: 'Graduate research',
    where: 'University of Utah',
    place: 'Salt Lake City, UT',
    when: 'Current',
    points: [
      'With Dr. Cem Yuksel in the Realistic Computer Graphics Lab, and with the Hardware Ray Tracing group.',
    ],
  },
  {
    what: 'Visualization Software Engineering Associate',
    where: 'Dassault Systèmes India',
    place: 'Pune, India',
    when: 'June 2023 – July 2025',
    points: [
      'Improved NVIDIA DLSS visual quality and performance for dynamic scenes by adding efficient motion vector support to a proprietary render engine.',
      'Optimized real-time cascaded shadow map generation with geometry shaders and multi-viewport culling: 30% higher frame rates, and support for more dynamic lights in complex scenes.',
      'Made omnidirectional shadow maps 20% faster through geometry shader optimization, raising the supported omnidirectional lights from 6 to 8 in the Stellar Interactive Engine.',
      'Implemented level-of-detail tessellation for font meshes using Douglas–Peucker simplification, reducing memory footprint and rendering time while preserving curve fidelity.',
      'Built automation scripts to verify unit tests across a 12-member team, cutting the release verification cycle from 3 weeks to 1.',
    ],
    links: [
      {
        label: 'Demo: DLSS with motion vectors',
        url: 'https://www.linkedin.com/posts/hicham-touzani-phd-828582151_recently-i-had-the-opportunity-to-work-on-activity-7345392758351650816-2crx',
      },
      {
        label: 'Demo: Stellar Interactive Engine',
        url: 'https://www.linkedin.com/posts/almut-bauer-52a763190_nvidia-3dexperience-catia-activity-7396496961727635456-2y7g',
      },
    ],
  },
  {
    what: 'Game Tester',
    where: 'Ubisoft India',
    place: 'Pune, India',
    when: 'June 2020 – February 2021',
    points: [
      'Quality assurance testing for AAA titles, including Just Dance 2021, Prince of Persia: The Sands of Time Remake, and Far Cry 6, on PS4, Xbox, and Google Stadia.',
      'Gave feedback on gameplay mechanics, user experience, and monetization systems.',
    ],
  },
];

export const LEADERSHIP: CvItem[] = [
  {
    what: 'Teaching Assistant, CS 4600: Introduction to Computer Graphics',
    where: 'University of Utah',
    when: 'Current',
  },
  {
    what: 'Group Leader, Real-Time Rendering batch',
    where: 'Astromedicomp',
    when: 'October 2023 – June 2025',
    points: [
      'Led 9 students, aged 18 to 45 and with 0 to 16 years of experience, through an 18-month graphics programming curriculum covering OpenGL, DirectX 11, CUDA, and OpenCL.',
      'Wrote study plans, ran weekly doubt-solving sessions, and paired members for peer learning; 6 of the 9 completed the course.',
      'The group ranked 7th of 27 teams in the graphics demo showcases.',
    ],
  },
  {
    what: 'Technical Head, ACES Committee',
    where: 'Pune Institute of Computer Technology',
    when: '2019 – 2020',
    points: [
      'Organized hackathons, competitive coding challenges, and industry expert seminars on blockchain and cybersecurity.',
      'Wrote documentation and onboarding guides for the committee’s future leadership.',
    ],
  },
];

/** Awards that aren't attached to a project or demo page. */
export const AWARDS: { label: string; url?: string; year: number; note?: string }[] = [
  {
    label: 'Champion Award, Dassault Systèmes',
    year: 2024,
    note: 'For exceptional contributions to enhancing rendering engine performance (September 2024)',
  },
  {
    label: 'Best Paper Award, I4Tech 2020',
    url: 'https://doi.org/10.1109/i4tech48345.2020.9102645',
    year: 2020,
    note: 'For the paper on virtual reality and heart rate variability for reducing stage fright',
  },
];

export const SKILLS: { label: string; items: string[] }[] = [
  { label: 'Languages', items: ['C++', 'C', 'Python', 'Java', 'Objective-C', 'JavaScript', 'GLSL', 'HLSL'] },
  { label: 'Graphics and compute', items: ['OpenGL', 'DirectX 11 and 12', 'WebGL', 'Vulkan', 'CUDA', 'OpenCL'] },
  { label: 'Tools', items: ['RenderDoc', 'NVIDIA Nsight', 'PIX', 'Visual Studio', 'Git', 'GDB', 'Valgrind'] },
  { label: 'Platforms', items: ['Windows', 'Linux', 'macOS', 'Android', 'iOS'] },
];
