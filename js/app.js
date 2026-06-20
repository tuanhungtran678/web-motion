// =====================
// STATE
// =====================

let layers = [];
let selectedLayer = null;
let currentTime = 0;
let isPlaying = false;
let lastTime = 0;
let duration = 5;

const canvas = document.getElementById("previewCanvas");
const ctx = canvas.getContext("2d");

// =====================
// PLAY ENGINE
// =====================

function playLoop(t){

if(!isPlaying) return;

let dt = (t - lastTime)/1000;
lastTime = t;

currentTime += dt;

if(currentTime > duration) currentTime = 0;

render();
requestAnimationFrame(playLoop);
}

function togglePlay(){
isPlaying = !isPlaying;
if(isPlaying){
lastTime = performance.now();
requestAnimationFrame(playLoop);
}
}

// =====================
// KEYFRAME SYSTEM
// =====================

function addKeyframe(prop){

if(!selectedLayer) return;

if(!selectedLayer.kf) selectedLayer.kf = {};

if(!selectedLayer.kf[prop]) selectedLayer.kf[prop] = [];

selectedLayer.kf[prop].push({
time: currentTime,
value: selectedLayer[prop]
});
}

function ease(t){
return t<0.5 ? 2*t*t : 1-( -2*t+2 )**2/2;
}

function getValue(layer, prop){

let kf = layer.kf?.[prop];
if(!kf || kf.length===0) return layer[prop];

let prev=null,next=null;

for(let k of kf){
if(k.time<=currentTime) prev=k;
else { next=k; break; }
}

if(!prev) return next.value;
if(!next) return prev.value;

let t=(currentTime-prev.time)/(next.time-prev.time);
t=ease(t);

return prev.value*(1-t)+next.value*t;
}

// =====================
// RENDER
// =====================

function render(){

ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.fillStyle="#0f172a";
ctx.fillRect(0,0,canvas.width,canvas.height);

for(let l of layers){

if(l.type==="text"){
ctx.fillStyle="white";
ctx.font="60px Arial";
ctx.fillText(l.text,getValue(l,"x"),getValue(l,"y"));
}

if(l.type==="rect"){
ctx.fillStyle="#6366f1";
ctx.fillRect(getValue(l,"x"),getValue(l,"y"),l.w,l.h);
}

if(l.type==="circle"){
ctx.beginPath();
ctx.arc(getValue(l,"x"),getValue(l,"y"),l.w/2,0,Math.PI*2);
ctx.fillStyle="orange";
ctx.fill();
}

}
}

// =====================
// CREATE LAYERS
// =====================

function addText(){
layers.push({
id:Date.now(),
type:"text",
text:"New Text",
x:300,y:300
});
render();
}

function addRect(){
layers.push({
id:Date.now(),
type:"rect",
x:200,y:400,
w:200,h:200
});
render();
}

function addCircle(){
layers.push({
id:Date.now(),
type:"circle",
x:300,y:500,
w:200
});
render();
}

// =====================
// SELECT
// =====================

canvas.onclick = e=>{

let rect = canvas.getBoundingClientRect();

let x=(e.clientX-rect.left)*canvas.width/rect.width;
let y=(e.clientY-rect.top)*canvas.height/rect.height;

for(let i=layers.length-1;i>=0;i--){
let l=layers[i];

if(l.type==="rect"){
if(x>l.x && x<l.x+l.w && y>l.y && y<l.y+l.h){
selectedLayer=l;
}
}

if(l.type==="circle"){
let dx=x-l.x,dy=y-l.y;
if(dx*dx+dy*dy< (l.w/2)**2){
selectedLayer=l;
}
}
}

}

// =====================
// DOM
// =====================

const shapeTool = document.getElementById("shapeTool");
const shapeMenu = document.getElementById("shapeMenu");

const rectangleBtn = document.getElementById("rectangleBtn");
const circleBtn = document.getElementById("circleBtn");
const triangleBtn = document.getElementById("triangleBtn");

const headerPlayBtn = document.getElementById("headerPlayBtn");
const timelinePlayBtn = document.getElementById("timelinePlayBtn");

// =====================
// TRIANGLE
// =====================

function addTriangle(){

    layers.push({
        id: Date.now(),
        type: "triangle",
        x: 400,
        y: 400,
        w: 200,
        h: 200
    });

    render();
}

// =====================
// UI HOOKS
// =====================

headerPlayBtn.onclick = togglePlay;
timelinePlayBtn.onclick = togglePlay;

document.getElementById("addKeyframeBtn")
.onclick = () => {

    addKeyframe("x");
    addKeyframe("y");

};

document.getElementById("textTool")
.onclick = addText;

shapeTool.onclick = () => {

    shapeMenu.classList.toggle("hidden");

};

rectangleBtn.onclick = () => {

    addRect();
    shapeMenu.classList.add("hidden");

};

circleBtn.onclick = () => {

    addCircle();
    shapeMenu.classList.add("hidden");

};

triangleBtn.onclick = () => {

    addTriangle();
    shapeMenu.classList.add("hidden");

};

// =====================
// INIT
// =====================

render();
