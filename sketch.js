function setup() {
  createCanvas(500, 500);
  angleMode(DEGREES);
  colorMode(RGB, 255);
  textFont("Orbitron");
}

function draw() {
  // --- Bauhaus-inspired RGB palette (primary + neutral) ---
  // Bauhaus vibe: bold primaries (red/blue/yellow) + black/white/gray
  const bgCol = color(245, 242, 232); // warm off-white
  const secCol = color(220, 40, 40); // red
  const baseCol = color(250, 250, 245); // near-white
  const minutesgoneCol = color(35, 85, 200); // blue
  const secColBall = color(245, 200, 35); // yellow

  background(bgCol);

  //const now = new Date();
  const hr = hour();
  const mn = minute();
  const sc = second();

  // calling minute(), seconds() separately was creating a jump and mismatch in the frames

  // -- SECONDS LOADING PIE --
  push();
  let tsec = map(sc, 0, 59, 0, 360);

  stroke(0);
  strokeWeight(4);
  fill(secCol);
  arc(250, 250, 400, 400, -90, tsec - 90, PIE);
  pop();

  //--BACKGROUND MINUTES LEFT --white pie

  push();
  stroke(0); // Crisp black outline
  strokeWeight(2);
  fill(baseCol); // Bauhaus neutral
  ellipse(250, 250, 300, 300);
  pop();

  let end = map(mn, 0, 59, 0, 360);
  // --BACKGROUND MINUTES GONE -- blue pie
  push();
  noStroke();
  fill(minutesgoneCol); // Bauhaus blue
  arc(250, 250, 300, 300, -90, end - 90, PIE);
  pop();

  // -- SECONDS CIRCLE ELEMENT --
  push();
  let angleSec = map(sc, 0, 59, 0, 360);
  translate(250, 250);
  rotate(angleSec);

  // different blend modes: MULTIPLY / SCREEN / DIFFERENCE
  blendMode(DIFFERENCE);
  noStroke();
  fill(secColBall); // Bauhaus yellow with difference becomes blue and over blue becomes pink
  circle(0, -100, 50);

  blendMode(BLEND);
  pop();

  // -- HOUR POINTER LOGIC --
  // by adding this variable we make sure that the pointer shows a fluent progression 
  let fluidHrPointer = (hr % 12) + mn / 60;
  let angleHr = map(fluidHrPointer, 0, 12, 0, 360);

  let fillColor = colorModeDay(hr);
 // we translate the rectangle pointer to the middle of the canvas
  push();
  translate(250, 250);
  rotate(angleHr);

  fill(fillColor);
  stroke(0);
  strokeWeight(4);
  rectMode(CENTER); // we make sure that the rectangle rotates on its middle axis

  let r = 170; // radius where the marker sits
  rect(0, -r, 20, 60); // vertical block at the rim
  pop();

  // legend
  let timeofDay = ["night", "morning", "day", "evening"];

  // Bauhaus colors in RGB
  // night: deep red, morning: blue, day: yellow-ish, evening: charcoal

  let fillColorLegend = [
    color(140, 0, 0),
    color(35, 85, 200),
    color(245, 200, 35),
    color(30, 30, 30),
  ];

  for (let i = 0; i <= 3; i++) {
    fill(0);
    text(timeofDay[i], 5, 20 + i * 24, 90, 90);

    fill(fillColorLegend[i]);
    circle(70, 24 + i * 24, 20);
  }

  fill(0);
  text("fraction of an hour left", 150, 20, 170, 90);

  fill(baseCol);
  ellipse(120, 35, 40, 40);

  fill(minutesgoneCol);
  arc(120, 35, 40, 40, -90, end - 90, PIE);
  pop();
}

// Night → 0–4
// Morning → 5–11
// Day → 12–17
// Evening → 18–23

function colorModeDay(hour) {
  // return  p5 colors (RGB), not undefined variables like purple
  if (hour < 5) {
    return color(140, 0, 0); // deep red (night)
  } else if (hour < 12) {
    return color(35, 85, 200); // blue (morning)
  } else if (hour < 18) {
    return color(245, 200, 35); // yellow (day)
  } else {
    return color(30, 30, 30); // near-black (evening)
  }
}
