import defaultSource from './default.frag.glsl?raw';
import './style.css';

// Prepended to the editable source, so the editor shows only the interesting part.
const PRELUDE = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
out vec4 fragColor;
`;
const PRELUDE_LINES = PRELUDE.split('\n').length - 1;

// One triangle that covers the viewport; no vertex buffers needed.
const VERTEX = `#version 300 es
void main() {
  vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}
`;

// Bound the GPU cost on high-DPI and very large screens.
const MAX_DEVICE_PIXEL_RATIO = 2;
const MAX_PIXELS = 1920 * 1080;
const RECOMPILE_DELAY_MS = 250;

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
}

const canvas = byId<HTMLCanvasElement>('canvas');
const fallback = byId<HTMLParagraphElement>('fallback');
const toggle = byId<HTMLButtonElement>('toggle');
const reset = byId<HTMLButtonElement>('reset');
const status = byId<HTMLParagraphElement>('status');
const source = byId<HTMLTextAreaElement>('source');
const errors = byId<HTMLPreElement>('errors');

source.value = defaultSource;

const gl = canvas.getContext('webgl2', { antialias: false, alpha: false });
if (gl) {
  run(gl);
} else {
  // Never leave an empty rectangle: say what is missing, and keep the source readable.
  canvas.hidden = true;
  fallback.hidden = false;
  fallback.textContent =
    'This demo needs WebGL 2, which this browser or device does not provide. You can still read and edit the shader source below.';
  toggle.disabled = true;
  reset.disabled = true;
}

interface Compiled {
  program: WebGLProgram;
  uResolution: WebGLUniformLocation | null;
  uTime: WebGLUniformLocation | null;
}

function run(gl: WebGL2RenderingContext): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let compiled: Compiled | undefined;
  let playing = !reducedMotion.matches;
  let onScreen = true;
  let contextLost = false;
  let time = 0;
  let lastFrame: number | undefined;
  let frameRequest = 0;
  let recompileTimer = 0;

  function compileShader(type: number, text: string): { shader?: WebGLShader; log?: string } {
    const shader = gl.createShader(type);
    if (!shader) return { log: 'Could not create a shader.' };
    gl.shaderSource(shader, text);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return { shader };
    const log = gl.getShaderInfoLog(shader) ?? 'Unknown compile error.';
    gl.deleteShader(shader);
    return { log };
  }

  // Report line numbers as the editor shows them, not counting the prelude.
  // Some drivers end the log with a NUL character; drop it.
  function editorLineNumbers(log: string): string {
    return log
      .replace(/\0/g, '')
      .replace(/\b0:(\d+):/g, (_, line: string) => `line ${Number(line) - PRELUDE_LINES}:`)
      .trim();
  }

  function compile(fragmentBody: string): { result?: Compiled; log?: string } {
    const vertex = compileShader(gl.VERTEX_SHADER, VERTEX);
    if (!vertex.shader) return { log: vertex.log };
    const fragment = compileShader(gl.FRAGMENT_SHADER, PRELUDE + fragmentBody);
    if (!fragment.shader) {
      gl.deleteShader(vertex.shader);
      return { log: editorLineNumbers(fragment.log ?? '') };
    }
    const program = gl.createProgram();
    gl.attachShader(program, vertex.shader);
    gl.attachShader(program, fragment.shader);
    gl.linkProgram(program);
    gl.deleteShader(vertex.shader);
    gl.deleteShader(fragment.shader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program) ?? 'Unknown link error.';
      gl.deleteProgram(program);
      return { log };
    }
    return {
      result: {
        program,
        uResolution: gl.getUniformLocation(program, 'uResolution'),
        uTime: gl.getUniformLocation(program, 'uTime'),
      },
    };
  }

  function recompile(): void {
    const { result, log } = compile(source.value);
    if (result) {
      if (compiled) gl.deleteProgram(compiled.program);
      compiled = result;
      errors.hidden = true;
      errors.textContent = '';
      source.removeAttribute('aria-invalid');
    } else {
      // Keep drawing the last version that compiled.
      errors.hidden = false;
      errors.textContent = log ?? '';
      source.setAttribute('aria-invalid', 'true');
    }
    updateStatus();
    draw();
  }

  function updateStatus(): void {
    const parts: string[] = [];
    if (contextLost) parts.push('The GPU context was lost; waiting for the browser to restore it.');
    else if (!errors.hidden) parts.push('Compile error; showing the last version that compiled.');
    if (!playing) parts.push(reducedMotion.matches && time === 0 ? 'Paused (reduced motion is on).' : 'Paused.');
    status.textContent = parts.join(' ');
    toggle.textContent = playing ? 'Pause' : 'Play';
  }

  function resize(): void {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    let width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    let height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    const scale = Math.min(1, Math.sqrt(MAX_PIXELS / (width * height)));
    width = Math.round(width * scale);
    height = Math.round(height * scale);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      draw();
    }
  }

  function draw(): void {
    if (!compiled || contextLost) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(compiled.program);
    gl.uniform2f(compiled.uResolution, canvas.width, canvas.height);
    gl.uniform1f(compiled.uTime, time);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function frame(now: number): void {
    frameRequest = 0;
    if (lastFrame !== undefined) time += (now - lastFrame) / 1000;
    lastFrame = now;
    draw();
    schedule();
  }

  // Animate only while playing, visible on screen, in a visible tab, with a live context.
  function schedule(): void {
    const shouldRun = playing && onScreen && !document.hidden && !contextLost;
    if (shouldRun && !frameRequest) {
      frameRequest = requestAnimationFrame(frame);
    } else if (!shouldRun) {
      if (frameRequest) cancelAnimationFrame(frameRequest);
      frameRequest = 0;
      lastFrame = undefined;
    }
  }

  toggle.addEventListener('click', () => {
    playing = !playing;
    updateStatus();
    schedule();
  });

  // In ?view mode the controls are hidden; clicking the image pauses and resumes.
  if (document.documentElement.classList.contains('view')) {
    canvas.addEventListener('click', () => toggle.click());
  }

  reset.addEventListener('click', () => {
    source.value = defaultSource;
    time = 0;
    recompile();
  });

  source.addEventListener('input', () => {
    window.clearTimeout(recompileTimer);
    recompileTimer = window.setTimeout(recompile, RECOMPILE_DELAY_MS);
  });

  new ResizeObserver(resize).observe(canvas);

  // Inside an iframe this still measures against the top-level viewport.
  new IntersectionObserver((entries) => {
    onScreen = entries.some((entry) => entry.isIntersecting);
    schedule();
  }).observe(canvas);

  document.addEventListener('visibilitychange', schedule);

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault(); // allow the browser to restore the context
    contextLost = true;
    compiled = undefined;
    updateStatus();
    schedule();
  });

  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false;
    recompile();
    schedule();
  });

  // Release the GPU promptly when leaving; a page kept in the back/forward cache just pauses.
  window.addEventListener('pagehide', (event) => {
    if (frameRequest) cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    if (!event.persisted) gl.getExtension('WEBGL_lose_context')?.loseContext();
  });
  window.addEventListener('pageshow', schedule);

  recompile();
  resize();
  schedule();
}
