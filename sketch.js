// p5.js + Matter.js clock balls with RGB rainbow + alpha (hours/minutes/seconds clearly different)

const EIGHTH_PI = Math.PI * 0.125;
const SIXTEENTH_PI = EIGHTH_PI * 0.5;
const { Engine, World, Bodies, Body, Vector } = Matter;

let engine = Engine.create();
let { world } = engine;
Engine.run(engine);

let canvas, ctx;

let time = null;
let triggerToggle = 1;
let totalTime = 5 * 1000;
let hourTime = totalTime / 12;
let minuteTime = totalTime / 60;
let secondTime = 1000;
let scaleFactor = 1.3;
let textSizes = { hour: [32, 18], minute: [20, 14], second: [16, 10] };

let triggeredBlocks = [];
let _hourOpts = { func: createHourBlock, to: hourTime };
let _minuteOpts = { func: createMinuteBlock, to: minuteTime };
let _secondOpts = { func: createSecondBlock, to: secondTime, side: "second" };

// ---------- Rainbow helper (returns RGB in 0..100) ----------
function rainbowRGB(t) {
  // keep t in [0, 1)
  t = ((t % 1) + 1) % 1;

  // three sine waves, phase-shifted for rainbow
  const r = (sin(TWO_PI * (t + 0.0)) * 0.5 + 0.5) * 100;
  const g = (sin(TWO_PI * (t + 1 / 3)) * 0.5 + 0.5) * 100;
  const b = (sin(TWO_PI * (t + 2 / 3)) * 0.5 + 0.5) * 100;

  return [r, g, b];
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  ctx = canvas.drawingContext;
  textFont("Orbitron");

  textAlign(CENTER, CENTER);

  // IMPORTANT: enable alpha channel (RGBA), all ranges 0..100
  colorMode(RGB, 100, 100, 100, 100);

  // --- Your original walls ---
  let wallOptions = { collisionFilter: { category: 0x001 }, isStatic: true };
  let wallsHeight = 1000;
  let wallsY = -wallsHeight * 0.5 + 100;
  let wallOpts = [wallsY, 25, wallsHeight, wallOptions];
  let walls = [
    Bodies.rectangle(-300, ...wallOpts),
    Bodies.rectangle(-100, ...wallOpts),
    Bodies.rectangle(100, ...wallOpts),
    Bodies.rectangle(300, ...wallOpts),
  ];

  // --- Your original ground wedges (fixed angle: 10 should be radians; using 10 degrees -> radians) ---
  let groundOptions = { collisionFilter: { category: 0x002 }, isStatic: true };
  let groundArgs = [150, 140, 25];

  // p5 QUARTER_PI is radians; if you want 10 degrees, convert:
  let tenDeg = radians(10);

  let groundOpts1 = groundArgs.concat([Object.assign({ angle: tenDeg }, groundOptions)]);
  let groundOpts2 = groundArgs.concat([Object.assign({ angle: -QUARTER_PI }, groundOptions)]);
  let ground = [
    Bodies.rectangle(-247.5, ...groundOpts1),
    Bodies.rectangle(-152.5, ...groundOpts2),
    Bodies.rectangle(-47.5, ...groundOpts1),
    Bodies.rectangle(52.5, ...groundOpts2),
    Bodies.rectangle(247.5, ...groundOpts2),
    Bodies.rectangle(152.5, ...groundOpts1),
  ];

  World.add(world, walls.concat(ground));
}

function mouseDragged() {
  world.bodies.forEach((body) => {
    if (body.isStatic || body.velocity.y < -0.5) return;

    let pos = Vector.clone(body.position);
    pos.y += 2;

    Body.applyForce(body, pos, {
      x: random(-1, 1) * 0.001,
      y: -0.005,
    });
  });
}

function draw() {
  background(0);
  translate(width * 0.5, height * 0.5);

  let currentTime = [hour() % 12 || 12, minute(), second()];
  if (!time || time.slice(0, 2).some((n, i) => n !== currentTime[i])) {
    time = currentTime;
    trigger();
  }

  // NOTE: this slice is brittle; keeping yours, but if shapes disappear use world.bodies instead
  let drawableBodies = world.bodies.slice(10);

  drawableBodies.forEach((body) => {
    let { vertices, position: pos, label } = body;

    if (typeof label !== "string") {
      let { num, side, largest, style } = label;

      if ((abs(pos.x) > width || pos.y > height) && !body.isStatic) {
        World.remove(world, body);
        return;
      }

      fill(style); // style is [r,g,b,a] now
      largest ? stroke(255) : noStroke();
    } else {
      fill(32);
      stroke(255);
      point(pos.x, pos.y);
    }

    beginShape();
    vertices.forEach((v) => vertex(v.x, v.y));
    endShape(CLOSE);

    if (typeof label !== "string") {
      let { num, side, largest } = label;
      fill(100, 100, 100, 100); // white in RGB(100) with full alpha
      noStroke();
      textSize(textSizes[side][1 - largest]);
      text(num, pos.x, pos.y);
    }
  });
}

function createCircle({ x, y, r, options = {} }) {
  options.restitution = 0.6;
  let body = Bodies.circle(x, y, r, options);
  World.add(world, body);
  return body;
}

function createFilteredCircle({ x = 0, y = -height * 0.5 - 60, r = 40, label = {} } = {}) {
  let category = triggerToggle ? 0x002 : 0x004;
  let mask = category | 0x001;
  let options = { collisionFilter: { category, mask } };

  let block = createCircle({ x, y, r, options });
  Body.applyForce(block, block.position, { x: random(-1, 1) * 0.002, y: 0.005 });
  block.label = label;
  return block;
}

function createHourBlock() {
  let x = random(-125, -275);
  let y = 30;
  let label = { side: "hour", timeIndex: 0 };
  return createFilteredCircle({ x, y, r: y, label });
}

function createMinuteBlock() {
  let x = random(-75, 75);
  let y = 20;
  let label = { side: "minute", timeIndex: 1 };
  return createFilteredCircle({ x, y, r: y, label });
}

function createSecondBlock() {
  let x = random(125, 275);
  let y = 10;
  let label = { side: "second", timeIndex: 2 };
  return createFilteredCircle({ x, y, r: y, label });
}

function toggle() {
  let cat = triggerToggle ? 0x002 : 0x004;
  world.bodies.slice(3, 10).forEach((body) => (body.collisionFilter.category = cat));
}

function trigger() {
  triggerToggle ^= 1;
  toggle();

  triggeredBlocks.forEach((n) => clearTimeout(n));
  triggeredBlocks = [];

  function triggerBlock({ func, i }) {
    return () => {
      // 1) spawn
      let block = func();

      // 2) identify group + timeIndex
      let { side, timeIndex } = block.label;

      // 3) number + "current" logic
      let num = i + 1;

      // your old rule: only hours/minutes had "largest"
      let largest = timeIndex !== 2 ? num === time[timeIndex] : false;

      // we ALSO want seconds to have a "current" highlight:
      let isCurrent = side === "second" ? num === time[2] : largest;

      if (largest) Body.scale(block, scaleFactor, scaleFactor);

      // 4) t = normalized position 0..1
      // hours/minutes: 1..timeValue; seconds: 1..60
      let denom = timeIndex !== 2 ? time[timeIndex] : 60;
      let t = denom > 0 ? num / denom : 0;

      // 5) GROUP DIFFERENTIATION:
      // Each group uses a different slice ("span") and starting point ("base") of the rainbow,
      // and different opacity ("alpha") when NOT current.
      const groupCfg =
        side === "hour"
          ? { base: 0.05, span: 0.25, alpha: 85 } // hours: tight rainbow slice, more solid
          : side === "minute"
          ? { base: 0.40, span: 0.35, alpha: 35 } // minutes: lighter / more transparent
          : { base: 0.75, span: 1.0, alpha: 70 }; // seconds: full rainbow, medium opacity

      // map t into this group's rainbow range
      let rainbowT = groupCfg.base + t * groupCfg.span;

      // RGB rainbow
      let rgb = rainbowRGB(rainbowT);

      // alpha: current = 100, others = groupCfg.alpha
      let a = isCurrent ? 100 : groupCfg.alpha;

      // optional: brighten the current ball color a bit (not the text)
      if (isCurrent) {
        rgb = [
          min(100, rgb[0] + 15),
          min(100, rgb[1] + 15),
          min(100, rgb[2] + 15),
        ];
      }

      let style = [rgb[0], rgb[1], rgb[2], a];

      // store label for drawing
      block.label = { num, side, largest, t, style };
    };
  }

  // schedule spawns (keeps your original timing feel)
  for (let i = 0; i < 60; i++) {
    let tasks = [];
    if (i < time[0]) tasks.push({ func: createHourBlock, i });
    if (i < time[1]) tasks.push({ func: createMinuteBlock, i });
    tasks.push({ func: createSecondBlock, i });

    tasks.forEach((task) => {
      let isSecond = task.func === createSecondBlock;

      // seconds: fast “catch up” for past seconds
      let secondTO = isSecond && (i < time[2] ? 5 * i : secondTime * (i - time[2]));

      // hours/minutes use their own pacing
      let per =
        task.func === createHourBlock ? hourTime :
        task.func === createMinuteBlock ? minuteTime :
        secondTime;

      let timeoutTime = isSecond ? secondTO : per * i;

      let timeout = setTimeout(triggerBlock(task), timeoutTime);
      triggeredBlocks.push(timeout);
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}