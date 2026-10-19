// A small ray-marched scene: a sphere on a checkered floor, one light,
// soft shadows, and a camera orbiting slowly. Edit anything below.
// Colours are linear; the last line converts to display (sRGB-ish) values.

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

// x: distance to the nearest surface; y: its material (1 = floor, 2 = sphere).
vec2 scene(vec3 p) {
    float floorDist = p.y;
    float ball = sdSphere(p - vec3(0.0, 1.0, 0.0), 1.0);
    return ball < floorDist ? vec2(ball, 2.0) : vec2(floorDist, 1.0);
}

vec3 normalAt(vec3 p) {
    const vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
        scene(p + e.xyy).x - scene(p - e.xyy).x,
        scene(p + e.yxy).x - scene(p - e.yxy).x,
        scene(p + e.yyx).x - scene(p - e.yyx).x));
}

// Sphere tracing: step along the ray by the distance to the nearest surface.
vec2 march(vec3 ro, vec3 rd) {
    float t = 0.0;
    for (int i = 0; i < 128; i++) {
        vec2 h = scene(ro + rd * t);
        if (h.x < 0.0005 * t) return vec2(t, h.y);
        t += h.x;
        if (t > 60.0) break;
    }
    return vec2(-1.0, 0.0);
}

// Fraction of the light visible from p, with a penumbra estimated from how
// closely the shadow ray passes other surfaces.
float softShadow(vec3 p, vec3 l) {
    float lit = 1.0;
    float t = 0.02;
    for (int i = 0; i < 64; i++) {
        float h = scene(p + l * t).x;
        lit = min(lit, 8.0 * h / t);
        t += clamp(h, 0.01, 0.5);
        if (lit < 0.001 || t > 20.0) break;
    }
    return clamp(lit, 0.0, 1.0);
}

void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - uResolution) / uResolution.y;

    float a = 0.3 * uTime;
    vec3 ro = vec3(4.5 * sin(a), 2.0, 4.5 * cos(a));
    vec3 forward = normalize(vec3(0.0, 0.8, 0.0) - ro);
    vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
    vec3 up = cross(right, forward);
    vec3 rd = normalize(uv.x * right + uv.y * up + 1.8 * forward);

    vec3 paper = vec3(0.930, 0.905, 0.846);
    vec3 col = paper;

    vec2 hit = march(ro, rd);
    if (hit.x > 0.0) {
        vec3 p = ro + rd * hit.x;
        vec3 n = normalAt(p);
        vec3 l = normalize(vec3(0.6, 0.9, 0.4));

        vec3 albedo = vec3(0.332, 0.050, 0.019); // the site's red-pencil accent
        if (hit.y < 1.5) {
            float checker = mod(floor(p.x) + floor(p.z), 2.0);
            albedo = mix(vec3(0.60, 0.56, 0.48), vec3(0.38, 0.35, 0.30), checker);
        }

        float diffuse = max(dot(n, l), 0.0) * softShadow(p + n * 0.002, l);
        float ambient = 0.25 + 0.15 * n.y;
        float specular = pow(max(dot(n, normalize(l - rd)), 0.0), 48.0) * diffuse;
        col = albedo * (ambient + diffuse) + 0.3 * specular;

        // Fade to the background with distance.
        col = mix(col, paper, 1.0 - exp(-0.003 * hit.x * hit.x));
    }

    fragColor = vec4(pow(col, vec3(1.0 / 2.2)), 1.0);
}
