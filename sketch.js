// vertex shader
let vertexShader = `
precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTexCoord;

void main() {
  vec4 viewModelPosition =
    uModelViewMatrix *
    vec4(aPosition, 1.0);

  gl_Position =
    uProjectionMatrix *
    viewModelPosition;

  vTexCoord = aTexCoord;
}
`;

// fragment shader
let fragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265358979323846

uniform float time;
uniform float shade;

varying vec2 vTexCoord;

vec2 rotate2D (vec2 _st, float _angle) {
  _st -= 0.5;
  _st = mat2(cos(_angle), -sin(_angle),
             sin(_angle),  cos(_angle)) * _st;
  _st += 0.5;
  return _st;
}

vec2 tile (vec2 _st, float _zoom) {
  _st *= _zoom;
  return fract(_st);
}

float concentricCircles(in vec2 st, in vec2 radius, in float res, in float scale) {
  float dist = distance(st, radius);
  float pct = floor(dist * res) / scale;
  return pct;
}

void main (void) {
  vec2 st = vTexCoord;

  float dist = distance(st, vec2(sin(time/10.0), cos(time/10.0)));
  st = tile(st, 10.0);
  st = rotate2D(st, dist * PI * 2.0);

  vec3 col = vec3(
    concentricCircles(st, vec2(0.0,0.0), 5.0, 5.0),
    concentricCircles(st, vec2(0.0,0.0), 10.0, 10.0),
    concentricCircles(st, vec2(0.0,0.0), 20.0, 10.0)
  );

  col *= shade;
  gl_FragColor = vec4(col, 1.0);
}
`;


let theShader;

// Minute ball position
let minuteAngle = 0;

function setup() {
  createCanvas(710, 400, WEBGL);
  noStroke();
  theShader = createShader(vertexShader, fragmentShader);

  colorMode(HSB, 360, 100, 100, 100); // <-- ADD
}

function draw() {

  let m = minute();
  let s = second();

  
  
  background(255);
  shader(theShader);

  // use seconds as time input
  theShader.setUniform("time", s);

  
    // ... your minute ball ...
    // ... your seconds ball ...

  // uniforms (keep your second()/minute() approach)
  theShader.setUniform("time", s);
  theShader.setUniform("shade", 1.0);

  // --- Flower that grows ---
drawFlowerClock(hour() % 12 , width - 90, 95, 90);
drawHourLegend(m, -200, -100, 100); // top-left legend

  

  // angle based on minute
  minuteAngle = map(m, 0, 59, 0, TWO_PI);

  // subtle outward movement based on seconds
  let radius = 60 + s * 0.5;

  let x = -150 + cos(minuteAngle) * radius;
  let y = sin(minuteAngle) * radius;

  // subtle pulse based on seconds (stepped)
  let minuteScale = 1.0 + s * 0.003;

  push();
  translate(x, y, 0);
  rotateY(s * 2);   // gentle stepped rotation
  theShader.setUniform("shade", 0.7 + s * 0.005);
  scale(minuteScale);
  sphere(125);
  pop();

  // -------------------------
  // 🔵 SECONDS BALL
  // -------------------------

  // shade changes once per second
  let secShade = map(s, 0, 59, 0.3, 1.0);

  push();
  translate(170, 0, 0);
  theShader.setUniform("shade", secShade);
  sphere(80);
  pop();
}


function hourColor(h) {
  // 24 distinct-ish colors (one per hour)
  return color((h * 15) % 360, 80, 95, 100);
}

function drawFlowerClock(h, x, y, size) {
  const c = hourColor(h);

  // growth per hour:
  // petals: 5..16 across 24 hours
  const petals = floor(map(h, 0, 23, 2, 13));
  // bloom factor: 0.55..1.0 across the day
  const bloom = map(h, 0, 23, 0.5, 6.0);

  push();
  // draw in screen space (top-left origin) while in WEBGL
  resetMatrix();
  translate(-width / 2, -height / 2);
  translate(x, y);

  // stem
  stroke(120, 60, 55, 100);
  strokeWeight(size * 0.08);
  line(0, size * 0.15, 0, size * 3);

  // leaf
  noStroke();
  fill(120, 60, 60, 85);
  ellipse(-size * 0.18, size * 0.45, size * 0.22, size * 0.12);

  // petals (bloom grows by hour)
  noStroke();
  fill(c);

  const petalDist = size * 0.23 * bloom;
  const petalW = size * 0.26 * bloom;
  const petalH = size * 0.15 * bloom;

  for (let i = 0; i < petals; i++) {
    const ang = (TWO_PI * i) / petals;
    const px = cos(ang) * petalDist;
    const py = sin(ang) * petalDist;
    push();
    translate(px, py);
    rotate(ang);
    ellipse(0, 0, petalW, petalH);
    pop();
  }

  // center
  fill(45, 90, 95, 100);
  ellipse(0, 0, size * 0.22 * bloom, size * 0.22 * bloom);

  // hour label
  fill(0, 0, 10, 100);
  textAlign(CENTER, CENTER);
  textSize(size * 0.18);
  text(nf(h, 2) + ":00", 0, -size * 0.55);

  pop();
}

function drawHourLegend(m, x, w, y) {

let balls = 60;

  push();
  resetMatrix();
  

  const pad = 30;
  const cols = 10;          // 12 per row
  const rows = 6;
  const cellW = (w - pad * 2) / cols;

  textAlign(CENTER, TOP);
  textSize(10);
  fill(0, 0, 20, 100);
  noStroke();
  text("Hour → flower color", x + w / 2, y - 14);

  for (let h = 0; h < 60; h++) {
    const col = h % cols;
    const row = floor(h / cols);

    const cx = x + pad + col * cellW + cellW / 2;
    const cy = y + row * 22;

    fill(hourColor(h));
    noStroke();
    ellipse(cx, cy, 12, 12);

    fill(0, 0, 25, 100);
    text(nf(h, 2), cx, cy + 8);
  }

  pop();
}