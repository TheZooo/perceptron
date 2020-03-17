var d = document;
var canvasW = 500;
var canvasH = 500;
var yInter = Math.floor((Math.random() * (canvasH * 2)) - canvasH);
var slope = Math.floor(Math.random() * canvasH) / Math.floor(Math.random() * canvasW);
var refreshRate = 20;
var randomRate = 15000;
var timeSwitch = Number(Math.floor(randomRate / 1000));
var pointArr = []; //Point Object Array
const pointSize = 3;
var pointAmt = 1000;
var perceptronArr = []; //Perceptron Object Array

function loadFunc() {
  var canvas = d.getElementById("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  d.getElementById("time").innerHTML = "Time until randomized: " + timeSwitch;

  setupPoints(false);
  perceptronArr.push(new simplePerceptron(3, 0.0000009));
  var countDownInte = setInterval(countDown, 1000);
  var randomInte = setInterval(randomize, randomRate);
  var canvasInte = setInterval(renderCanvas, refreshRate);
}

function countDown() {
  if (timeSwitch <= 0) {
    timeSwitch = Number(Math.floor(randomRate / 1000));
  }
  timeSwitch--;
  d.getElementById("time").innerHTML = "Time until randomized: " + timeSwitch;
}

function randomize() {
  yInter = Math.floor((Math.random() * (canvasH * 2)) - canvasH);
  slope = Math.floor(Math.random() * canvasH) / Math.floor(Math.random() * canvasW);
  setupPoints(true);
}

function setupPoints(isRandomizing) {
  if (isRandomizing) {
    while (pointArr.length > 0) {
      pointArr.pop();
    }
  }

  for (var i = 0; i < pointAmt; i++) {
    var xPos = Math.floor(Math.random() * canvasW);
    var yPos = Math.floor(Math.random() * canvasH);
    var answer = positionCheck(xPos, yPos);
    pointArr.push(new point(xPos, yPos, answer, pointSize, false));
  }
}

function positionCheck(x, y) {
  var slopeY = (x * slope) + yInter;
  if (y >= slopeY) {
    return 1;
  } else {
    return 0;
  }
}

function renderCanvas() {
  var cumulativeError = 0;
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = "#a1a1a1";
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.beginPath();
  ctx.strokeStyle = "#000000";
  ctx.moveTo(0, yInter);
  ctx.lineTo(canvasW, (slope * canvasW) + yInter);
  ctx.stroke();

  for (var i = 0; i < pointAmt; i++) {
    pointArr[i].canvasRender(ctx);
    var guess = perceptronArr[0].guessSlope(pointArr[i].x, pointArr[i].y, 1);
    guessCheck(guess, i);
    perceptronArr[0].learn(pointArr[i].ans, guess, pointArr[i].x, pointArr[i].y, 1);
  }
  //perceptronArr[0].canvasRender(ctx);
}

function guessCheck(guess, i) {
  if (guess == pointArr[i].ans) {
    pointArr[i].isCorrect = true;
  } else {
    pointArr[i].isCorrect = false;
  }
}

//Point Object
class point {
  constructor(xPos, yPos, answer, size, check) {
    this.x = xPos;
    this.y = yPos;
    this.size = size;
    this.ans = answer;
    this.isCorrect = check;
  }
  canvasRender(context) {
    context.beginPath();
    if (this.ans) {
      context.strokeStyle = "#ffffff";
    } else {
      context.strokeStyle = "#000000";
    }
    if (this.isCorrect) {
      context.fillStyle = "#00ff15";
    } else {
      context.fillStyle = "#ff0000";
    }
    context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
  }
}

//Perceptron Object
class simplePerceptron {
  constructor(inputAmt, learnRate) {
    this.inAmt = inputAmt;
    this.weight = [];
    for (var i = 0; i < inputAmt; i++) {
      this.weight.push(Math.random());
    }
    this.lr = learnRate;
  }
  guessSlope() { //Make sure passed parameters matches input amount
    if (arguments.length == this.inAmt) {
      var inputSig = 0;
      for (var i = 0; i < this.inAmt; i++) {
        inputSig += arguments[i] * this.weight[i];
      }
      if (inputSig > 0) {
        return 1;
      } else if (inputSig <= 0) {
        return 0;
      }

    } else if (arguments.length !== this.inAmt) {
      console.error("Argument/parameter length doesn't match object's input amount");
    } else {
      console.error("guessSlope(" + arguments + ") is not working");
    }
  }
  learn(ans, guess) {
    if (arguments.length == (this.inAmt + 2)) {
      var error = ans - guess;
      for (var i = 0; i < this.inAmt; i++) {
        this.weight[i] += error * arguments[i + 2] * this.lr;
      }
    } else {
      console.error("Perceptron isn't learning (learn() doesn't work)");
    }
  }
  canvasRender(context) {
    context.beginPath();
    context.strokeStyle = "#ff0000";
    context.moveTo(0, (this.weight[2] / this.weight[1]) * yInter);
    context.lineTo(canvasW, (-this.weight[1] / this.weight[0]) + (this.weight[2] / this.weight[1]) * yInter);
    context.stroke();
  }
}
