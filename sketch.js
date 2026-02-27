function setup() {
  createCanvas(500, 500);
  angleMode(DEGREES);
  colorMode(RGB);
  textFont("Orbitron")
  
}

function draw() {
  background(200)
  
  const now = new Date();
  const hr = now.getHours();
  const mn = now.getMinutes();
  const sc = now.getSeconds();

  // calling minute(), seconds() separately was creating a jump and mismatch in the frames


  push()
  let pointHr = map( sc , 0, 59, 0, 360 )
  stroke(4);
  fill("black");
  arc(250, 250, 400, 400, -90, pointHr - 90, PIE);
  pop();


  
  push();
  stroke(255);
  fill("pink");
  ellipse(250, 250, 300, 300);
  pop();
  
  
  let end = map(mn, 0, 59, 0, 360);
  
  push();
  noStroke();
  fill("gray")
  arc(250, 250, 300, 300, -90, end - 90, PIE); //arc( x, y, x, y, start, end)
  
  pop();
  
  
  //I want a circle that rotates along and axis... and follows a trajectory using seconds to map the angle
  push();
  let angleSec = map(sc, 0, 59, 0, 360);
  translate(250, 250);
  rotate(angleSec);
  fill(200);
  circle( 0, -100, 50) // circle( x, y, w)
  pop();
  
  //I want a circle that rotates along and axis... and follows a trajectorie based on the angle that is mapped by the hour 
  
  let hr12 = hr % 12; // 0...11 
  let hourSmooth = hr12 + mn / 60 + sc / 3600; //smooth 0...12
  let angleHr = map(hourSmooth, 0, 12, 0, 360);
  //the color of the hour pointer will change depending on the time of day (see legend)
  let fillColor = colorModeDay(hr);
  push();
  translate(250, 250)
  fill(fillColor); 
  noStroke();
  rectMode(CENTER);
  noStroke();

  
  
  // position on rim (radius ≈ 150)
  rect(0, -170, 20, 60);
  rotate(angleHr - 90);
  pop();
  push()
  //this is supposed to show you how to read the clock
  let timeofDay = ["night", "morning", "day", "evening"];
  let fillColorLegend = ["darkred", "lightblue", "lightgreen", "purple"]


  for (let i = 0; i <= 3; i++ ) {
    fill("black")
    text(timeofDay[i], 5, 20 + i * 24, 90, 90);
   
    fill(fillColorLegend[i])
    circle(70, 24 + i * 24, 20, 20);
    
  }   
      text("any pie left?", 150, 20, 170, 90 ) //text("text", x, y, w, h)
      fill("pink");
      ellipse(120, 35, 40, 40);
      fill("grey")
      arc(120, 35, 40, 40, -90, end - 90, PIE ); 

  pop()
  
}

// 🌙 Night → 0–4

// 🌅 Morning → 5–11

// ☀️ Day → 12–17

// 🌆 Evening → 18–23

function colorModeDay(hour) {
  
   if(hour < 5) {
    return "darkred"//night time (0-4)
   } else if (hour < 12){
    return "lightblue" //morning (5-11)
   } else if( hour < 18){
    return "lightgreen" // day time (18-23) 
   } else { return purple } //evening (18-23)
}