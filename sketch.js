// SPDX-License-Identifier: GPL-3.0-or-later
//
// LOOK INSIDE THE WITLING  (simple version)
// Copyright (C) 2026  LOOK INSIDE THE WITLING author
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version. It comes WITHOUT ANY WARRANTY.
// See the LICENSE file, or <https://www.gnu.org/licenses/>.
//
// Uses the p5.js library (LGPL-2.1), see licenses/p5.js-LGPL-2.1.txt
//
let seed;
let healing = 0;   // 0 = fully torn, 1 = fully healed
let veinGrow = 0;  // 0 -> 1: gân mọc dần ra từ trục chính
let threads = [];
let veins = [];
let leafW;
let leafH;
let palette;
const BASE_W = 1920;
const BASE_H = 1080;
const MAX_TWIG_DEPTH = 3; // số cấp nhánh con (nhánh con, nhánh cháu...)

// các element ở viền
// x, y = vị trí gốc trên khung 1920 x 1080
// r  là radius
const bubbles = [
  // trên, trái sang phải
  { x: 80,  y: 56,   r: 31, label: "" },
  { x: 360,  y: 45,   r: 36, label: "" },
  { x: 620,  y: 77,   r: 34, label: "" },
  { x: 920,  y: 51,   r: 41, label: "" },
  { x: 1200, y: 46,   r: 32, label: "" },
  { x: 1480, y: 73,   r: 42, label: "" },
  { x: 1800, y: 44,   r: 31, label: "" },

  //  phải
  { x: 1864, y: 300,  r: 30, label: "" },// trên cùng
  { x: 1836, y: 560,  r: 40, label: "" },
  { x: 1858, y: 820,  r: 35, label: "" },

  //  dưới (phải -> trái) - 2 bubble này không nối với nhau
  { x: 1680, y: 1034, r: 40, label: "", noLink: true }, // noLink: không nối sang bubble kế tiếp
  { x: 240,  y: 1012, r: 34, label: "" },

  //  trái
  { x: 48,   y: 820,  r: 38, label: "" }, // dưới cùng
  { x: 80,   y: 560,  r: 32, label: "" },
  { x: 56,   y: 300,  r: 40, label: "" }, // trên cùng
];

// khi trong giữ đúng thứ tự các lines giữa các bubble sẽ bị chồng lên nhau
// phải theo thứ tự đi vòng quanh viền (trên-phải-dưới-trái) và
// thứ tự vị trí của các bubble cũng phải theo như vậy

const words = [
  "H₂", "H₂O", "O₂", "CO₂", "C", "CO", "O",
  "N₂", "CH₄", "NH₃", "O₃", "H₂O₂", "NO₂", "Ca", "N",
  "CO₃", "SO₂", "H₂S", "NaCl", "K", "Mg", "Fe", "P", "Si"
];

//color for leaves - change when reload
const palettes = [
  { bg: "#F6EFE6", leaf: "#A6B69A", dark: "#70876B", wound: "#B58E79" },
  { bg: "#F6EFE6", leaf: "#d6c77c", dark: "#afa11e", wound: "#B58E79" },
  { bg: "#F6EFE6", leaf: "#d6a17c", dark: "#985620", wound: "#B58E79" },
  { bg: "#F6EFE6", leaf: "#93ab91", dark: "#155b20", wound: "#B58E79" },
  { bg: "#F6EFE6", leaf: "#C2A17E", dark: "#8E6B4E", wound: "#B58E79" },
  { bg: "#F6EFE6", leaf: "#98696c", dark: "#8e4e57", wound: "#B58E79" }
];


// icon trong folder img (1.png -> 15.png)
const ICON_COUNT = 14;
let icons = [];

// load ảnh trước khi setup() chạy
function preload() {
  for (let i = 1; i <= ICON_COUNT; i++) {
    loadImage("img/" + i + ".png",
      (img) => { icons[i - 1] = makeIconMask(img); },
      () => { console.warn("không tìm thấy img/" + i + ".png"); } // thiếu file -> bỏ qua
    );
  }
}

function makeIconMask(img) {
  img.resize(128, 0); 
  img.loadPixels();
  for (let k = 0; k < img.pixels.length; k += 4) {
    let bright = (img.pixels[k] + img.pixels[k + 1] + img.pixels[k + 2]) / 3;
    let alpha = (255 - bright) * img.pixels[k + 3] / 255;
    img.pixels[k] = 255;
    img.pixels[k + 1] = 255;
    img.pixels[k + 2] = 255;
    img.pixels[k + 3] = alpha;
  }
  img.updatePixels();
  return img;
}

function setup() {
  createCanvas(BASE_W, BASE_H);
  textFont('Nanum Gothic');
  pixelDensity(1);
  strokeCap(ROUND);

  seed = floor(Math.random() * 100);
  makeArtwork();

  if (document.getElementById("popup")) noLoop();
}

// make seed
function makeArtwork() {
  randomSeed(seed);
  noiseSeed(seed);

  palette = random(palettes);

  // the leaf size changes a little every time
  // the leaf is bigger than the screen, so we only see the middle:
  // green on the left and right edges, and the eye goes to the threads
  leafW = width * random(0.7, 0.8);
  leafH = height * random(0.6, 0.7); // taller than the screen, so the tear runs from top to bottom

  makeVeins();
  makeThreads();
  makeLabels();
  healing = 0;
}

// mỗi bubble random hiện chữ (từ "words") hoặc icon (từ folder img)
function makeLabels() {
  let wordPool = shuffle(words);                          // trộn -> không bị lặp chữ
  let iconPool = shuffle(icons.filter((img) => img));     // chỉ lấy icon đã load được
  for (let i = 0; i < bubbles.length; i++) {
    let b = bubbles[i];
    if (iconPool.length > 0 && random() < 0.5) {          // 50% là icon
      b.icon = iconPool.pop();
      b.label = "";
    } else {
      b.icon = null;
      b.label = wordPool[i % wordPool.length];
    }
  }
}

//vết rách 
// Returns the x position of the torn edge at height y.
function tearX(y) {
  // sin() is 0 at the top and bottom of the leaf, so the tear
  // meets the outline there. noise() makes the edge ragged.
  let fade = sin(map(y, -leafH, leafH, 0, PI));
  return (noise(y * 0.02) - 0.5) * width * 0.075 * fade; 
  // based on the screen, not the leaf, so the tear stays the same size
}

// veins

// gân lá (generative), mỗi lần reload sẽ khác:
// - gân nối: mọc từ trục chính tới một bubble ở viền
// - gân tự do: chỉ mọc ra, kết thúc trong lá
// - gân có thể có nhánh con, nhánh con có thể có nhánh nhỏ hơn
// toạ độ tính theo tâm màn hình
function makeVeins() {
  veins = [];
  veinGrow = 0;
  let minX = max(170, width * 0.1);  // gân nối gần nhất cách giữa
  let maxX = width * 0.4;            // gân xa nhất

  // chia bubble thành 4 nhóm: trái-trên, trái-dưới, phải-trên, phải-dưới
  for (let side of [-1, 1]) {
    for (let ySide of [-1, 1]) {
      let picked = pickBubbles(side, ySide, minX);
      let starts = addLinkedVeins(side, picked, minX, maxX);
      addFreeVeins(side, ySide, starts);
    }
  }
}

// các bubble trong 1 nhóm
// (bỏ bubble quá gần giữa, và bubble nằm ngay trên trục chính)
function getBubbleGroup(side, ySide, minX) {
  let group = [];
  for (let i = 0; i < bubbles.length; i++) {
    let tx = sx(bubbles[i].x) - width / 2;
    let ty = sy(bubbles[i].y) - height / 2;
    if (Math.sign(tx) !== side || Math.sign(ty) !== ySide) continue;
    if (abs(tx) < minX + 60 || abs(ty) < height * 0.08) continue;
    group.push({ i: i, tx: tx, ty: ty });
  }
  return group;
}

// mỗi nhóm nối 2-3 bubble -> không quá dày
function pickBubbles(side, ySide, minX) {
  let group = getBubbleGroup(side, ySide, minX);
  let n = min(group.length, floor(random(2, 4)));
  let picked = shuffle(group).slice(0, n);

  // xếp theo thứ tự đi dọc viền từ giữa ra ngoài,
  // để gân gần giữa nối bubble gần giữa -> các gân không cắt nhau
  for (let p of picked) p.key = edgeKey(p);
  picked.sort((a, b) => a.key - b.key);
  return picked;
}

// vị trí của bubble khi đi dọc viền, tính từ giữa ra ngoài
function edgeKey(p) {
  let b = bubbles[p.i];
  let nearTopBottom = min(b.y, BASE_H - b.y) < min(b.x, BASE_W - b.x);
  return nearTopBottom ? abs(p.tx) : width / 2 + (height / 2 - abs(p.ty));
}

// gân nối: điểm mọc trải đều trên trục chính
// trả về danh sách điểm mọc (để tìm khoảng trống cho gân tự do)
function addLinkedVeins(side, picked, minX, maxX) {
  // starts[0] = điểm sát vết rách nhất mà gân được phép mọc
  let starts = [width * 0.06];
  for (let k = 0; k < picked.length; k++) {
    let p = picked[k];
    let slot = lerp(minX, maxX, (k + 0.5) / picked.length) + random(-25, 25);
    slot = constrain(slot, minX, abs(p.tx) * 0.75); // luôn mọc hướng ra ngoài
    starts.push(slot);
    veins.push(makeBranch(side, side * slot, p.tx, p.ty, p.i, random(0.9, 1.3)));
  }
  starts.push(maxX + 60);
  starts.sort((a, b) => a - b);
  return starts;
}

// gân tự do: chỉ mọc ra, không nối bubble
function addFreeVeins(side, ySide, starts) {
  for (let g of pickFreeGaps(starts)) {
    if (g.b - g.a < 90) continue; // khoảng quá hẹp -> bỏ
    veins.push(makeFreeVein(side, ySide, g));
  }
}

// khoảng sát vết rách LUÔN có 1 gân (để giữa không trống),
// thêm 0-1 gân vào khoảng trống lớn nhất còn lại
function pickFreeGaps(starts) {
  let gaps = [];
  for (let k = 0; k < starts.length - 1; k++) {
    gaps.push({ a: starts[k], b: starts[k + 1] });
  }
  let inner = gaps.shift();
  gaps.sort((g1, g2) => (g2.b - g2.a) - (g1.b - g1.a));
  return [inner].concat(gaps.slice(0, floor(random(0, 2))));
}

// 1 gân tự do mọc trong khoảng trống g
function makeFreeVein(side, ySide, g) {
  let startX = lerp(g.a, g.b, random(0.35, 0.65));
  let len = random(160, 300);
  let a = radians(random(35, 60)); // góc mọc ra
  let tx = min(startX + cos(a) * len, width / 2 - width * 0.07);
  let ty = min(sin(a) * len, height / 2 - height * 0.12);
  return makeBranch(side, side * startX, side * tx, ySide * ty, -1, random(0.7, 1));
}

// một gân: đường cong bezier từ trục chính (y = 0) tới điểm (tx, ty)
// bubbleIndex = -1 nếu là gân tự do
function makeBranch(side, startX, tx, ty, bubbleIndex, weight) {
  let c = branchControls(side, startX, tx, ty);
  let pts = branchPoints(startX, c[0], c[1], tx, ty);

  // khoảng 1/3 số gân không có nhánh con
  let twigs = random() < 0.35 ? [] : makeTwigs(pts, floor(random(1, 4)), 70, 1, Math.sign(ty));

  return {
    side: side, pts: pts, twigs: twigs, weight: weight,
    bubble: bubbleIndex,
    base: { x: tx, y: ty },     // vị trí gốc của bubble (chưa trôi)
    delay: random(0, 0.35)      // gân mọc lần lượt
  };
}

// 2 điểm điều khiển của đường cong bezier
function branchControls(side, startX, tx, ty) {
  let L = dist(startX, 0, tx, ty);
  let a = radians(random(30, 55)); // góc rời trục chính
  let c1 = { x: startX + side * cos(a) * L * 0.45, y: Math.sign(ty) * sin(a) * L * 0.45 };
  let c2 = { x: lerp(c1.x, tx, 0.6) + random(-30, 30), y: lerp(c1.y, ty, 0.6) + random(-30, 30) };

  // giữ 2 điểm điều khiển trong khung giữa điểm mọc và điểm cuối
  // -> đường cong không bao giờ vượt ra ngoài bubble / ngoài lá
  for (let c of [c1, c2]) {
    c.x = constrain(c.x, min(startX, tx), max(startX, tx));
    c.y = constrain(c.y, min(0, ty), max(0, ty));
  }
  return [c1, c2];
}

// các điểm trên đường cong, lắc nhẹ bằng noise()
function branchPoints(startX, c1, c2, tx, ty) {
  let off = random(1000);
  let pts = [];
  for (let k = 0; k <= 50; k++) {
    let u = k / 50;
    let x = bezierPoint(startX, c1.x, c2.x, tx, u);
    let y = bezierPoint(0, c1.y, c2.y, ty, u);
    // lắc vuông góc, = 0 ở 2 đầu để vẫn chạm trục và chạm bubble
    let w = (noise(off + u * 4) - 0.5) * 18 * sin(PI * u);
    let dx = bezierTangent(startX, c1.x, c2.x, tx, u);
    let dy = bezierTangent(0, c1.y, c2.y, ty, u);
    let m = max(1, sqrt(dx * dx + dy * dy));
    pts.push({ x: x - dy / m * w, y: y + dx / m * w, u: u });
  }
  return pts;
}

// nhánh con mọc ra từ một đường (gân hoặc nhánh con khác)
// depth: 1 = nhánh con, 2 = nhánh cháu...
// ySign: nửa trên (-1) hay nửa dưới (1) -> nhánh không vượt trục chính
function makeTwigs(parentPts, count, maxLen, depth, ySign) {
  let twigs = [];
  for (let k = 0; k < count; k++) {
    // nhánh mọc ở khoảng giữa đường mẹ, trải đều theo k
    let t = makeTwig(parentPts, (k + random(0.2, 0.8)) / count, maxLen, depth);
    if (!twigInside(t.pts, ySign)) continue;

    // nhánh nhỏ hơn: ngắn hơn, ít hơn, và có lúc không có
    if (depth < MAX_TWIG_DEPTH && random() < 0.7) {
      t.children = makeTwigs(t.pts, floor(random(1, 3)), t.len * 0.55, depth + 1, ySign);
    }
    twigs.push(t);
  }
  return twigs;
}

// 1 nhánh con, mọc ở vị trí f (0-1) trên khoảng giữa đường mẹ
function makeTwig(parentPts, f, maxLen, depth) {
  let last = parentPts.length - 1;
  let at = lerp(0.25, 0.75, f);
  let idx = min(floor(at * last), last - 1);
  let p = parentPts[idx], q = parentPts[idx + 1];
  let ang = atan2(q.y - p.y, q.x - p.x) + random([-1, 1]) * radians(random(25, 50));
  let len = random(0.5, 1) * maxLen;
  let bend = random(-0.35, 0.35);
  let pts = twigPoints(p, ang, len, bend);
  return { at: at, idx: idx, pts: pts, len: len, depth: depth, children: [] };
}

// các điểm của 1 nhánh con: đường hơi cong từ điểm p
function twigPoints(p, ang, len, bend) {
  let pts = [];
  for (let j = 0; j <= 12; j++) {
    let u = j / 12;
    let aa = ang + bend * u;
    pts.push({ x: p.x + cos(aa) * len * u, y: p.y + sin(aa) * len * u, u: u });
  }
  return pts;
}

// nhánh không được chạm vết rách, vượt trục chính hay ra ngoài khung
function twigInside(pts, ySign) {
  let edgeX = width / 2 - width * 0.05;      // vùng an toàn bên trong khung viền
  let edgeY = height / 2 - height * 0.08;
  for (let j = 0; j < pts.length; j++) {
    let x = pts[j].x, y = pts[j].y;
    if (abs(x) > edgeX || abs(y) > edgeY || abs(x) < width * 0.05) return false;
    if (j > 0 && Math.sign(y) !== ySign) return false;
  }
  return true;
}

//  threads connection making
function makeThreads() {
  threads = [];
  let count = floor(random(25, 40)); // số sợi
  let top = height * 0.57;

  for (let i = 0; i < count; i++) {
    let yA = random(-top, top);        // start height (left half)
    let yB = yA + random(-70, 70);     // end height (right half), more slant so threads cross

    threads.push({
      yA: yA,
      yB: constrain(yB, -top, top),

      // end sits a little way inside its leaf half.
      depthA: random(20, 90),
      depthB: random(20, 90),

      sag: random(4, 8),               // how much it hangs down (gravity)
      weight: random(0.9, 1.3),        // cùng độ dày với gân nhánh
      delay: i / count * 0.8,          // threads appear one after another
      wobble: random(1000)             // own noise offset, for a shaky line
    });
  }
}

function draw() {
  background(palette.bg);
  healing = min(healing + 0.002, 1);
  let gap = lerp(140, 4, customSmoothstep(0, 1, healing));

  push();
  translate(width / 2, height / 2); // (0, 0) is now the centre
  drawLeafHalf(-1, gap);
  drawLeafHalf(1, gap);
  pop();

  let frame = max(16, width * 0.024); // frame thickness, grows with the screen
  drawFrame(frame);
  drawVeinsAndThreads(gap, frame);
  drawCTA(frame);
  drawBubbles();
}

// 4 góc frame để chữ CTA
function drawFrame(frame) {
  noFill();
  stroke(palette.bg);
  strokeWeight(frame * 2); // a stroke is half inside, half outside the canvas
  rect(0, 0, width, height);
}

// gân lá vẽ sau khung (để chạm tới bubble), sợi chỉ vẽ sau gân (nằm trên gân).
// sợi chỉ bị cắt trong khung, để không đè lên viền
function drawVeinsAndThreads(gap, frame) {
  push();
  translate(width / 2, height / 2);
  drawVeins(gap);
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(frame - width / 2, frame - height / 2, width - frame * 2, height - frame * 2);
  drawingContext.clip();
  drawThreads(gap);
  drawingContext.restore();
  pop();
}

// the cta at frame bottom
function drawCTA(frame) {
  noStroke();
  fill(palette.dark);
  textSize(constrain(frame * 0.4, 11, 18)); // fits inside the frame
  textAlign(CENTER, CENTER);
  text("Learn from nature, leave no waste behind, repurpose what is already built.",
       width / 2, height - frame / 2);
}

// side = -1 cho trái của lá , 1 cho lá phải
function drawLeafHalf(side, gap) {
  push();
  translate(side * gap / 2, 0); // move this half away from the centre

  // vẽ big leaf, with the torn edge in the middle
   noStroke();
  fill(palette.leaf);
  beginShape();
  vertex(0, -height);
  vertex(side * width, -height);
  vertex(side * width, height);
  vertex(0, height);

  // phần bị rách của lá
  for (let y = leafH; y >= -leafH; y -= 4) {
    vertex(tearX(y), y);
  }
  endShape(CLOSE);

  // làm phần rách bruised
  stroke(palette.wound);
  strokeWeight(1.5);
  noFill();
  beginShape();
  for (let y = -leafH; y <= leafH; y += 4) {
    vertex(tearX(y), y);
  }
  endShape();

  // gân lá - trục chính
  stroke(palette.dark);
  strokeWeight(1.2);
  line(side * leafW * 0.95, 0, tearX(0), 0);

  pop();
}

// vẽ gân nhánh (sau khung viền, để gân chạm được tới bubble)
function drawVeins(gap) {
  veinGrow = min(veinGrow + 0.004, 1);
  stroke(palette.dark);

  for (let v of veins) {
    let g = constrain((veinGrow - v.delay) / 0.6, 0, 1);
    if (g <= 0) continue;

    let shiftX = v.side * gap / 2; // nửa lá bị đẩy ra theo gap
    let off = bubbleOffset(v, shiftX);
    push();
    translate(shiftX, 0);
    drawVeinLine(v, g, off);
    drawVeinTwigs(v, g, off);
    pop();
  }
}

// bubble trôi nhẹ -> uốn dần đầu gân theo để luôn chạm bubble
function bubbleOffset(v, shiftX) {
  if (v.bubble < 0) return { x: 0, y: 0 }; // gân tự do không uốn
  let p = bubblePos(v.bubble);
  return { x: p.x - width / 2 - v.base.x - shiftX, y: p.y - height / 2 - v.base.y };
}

// gân chính, mọc tới g (0-1)
function drawVeinLine(v, g, off) {
  let pts = v.pts;
  let last = floor(g * (pts.length - 1));
  for (let k = 0; k < last; k++) {
    let a = pts[k], b = pts[k + 1];
    let ea = a.u * a.u, eb = b.u * b.u; // độ uốn theo bubble tăng dần về cuối
    strokeWeight(lerp(v.weight, 0.5, a.u)); // gân thon dần
    line(a.x + off.x * ea, a.y + off.y * ea, b.x + off.x * eb, b.y + off.y * eb);
  }
}

// nhánh con dời theo điểm gốc của nó trên gân
function drawVeinTwigs(v, g, off) {
  for (let t of v.twigs) {
    let e = v.pts[t.idx].u * v.pts[t.idx].u;
    drawTwigs([t], g, off.x * e, off.y * e);
  }
}

// vẽ nhánh con. g = đường mẹ đã mọc được bao nhiêu (0-1)
// chỉ mọc khi đường mẹ đã đi qua chỗ đó
function drawTwigs(twigs, g, ox, oy) {
  for (let t of twigs) {
    let tg = constrain((g - t.at) / 0.3, 0, 1);
    if (tg <= 0) continue;
    let n = floor(tg * (t.pts.length - 1));
    let w0 = 0.9 / t.depth; // càng nhỏ càng mảnh
    for (let k = 0; k < n; k++) {
      let a = t.pts[k], b = t.pts[k + 1];
      strokeWeight(lerp(w0, w0 * 0.4, a.u));
      line(a.x + ox, a.y + oy, b.x + ox, b.y + oy);
    }
    drawTwigs(t.children, tg, ox, oy);
  }
}

function drawThreads(gap) {
  noFill();
  stroke(palette.dark);
  for (let t of threads) {
    let grow = constrain((healing - t.delay) / 0.15, 0, 1);
    if (grow <= 0) continue;

    // start point (inside left half) and end point (inside right half)
    let ax = tearX(t.yA) - t.depthA - gap / 2;
    let bx = tearX(t.yB) + t.depthB + gap / 2;

    strokeWeight(t.weight);
    beginShape();
    for (let u = 0; u <= grow + 0.001; u += 0.025) {
      let x = lerp(ax, bx, u);
      let y = lerp(t.yA, t.yB, u);
      y += t.sag * sin(PI * u);                                       // hang down in the middle
      y += (noise(t.wobble + u * 3, frameCount * 0.01) - 0.5) * 2;    // slight shake, like a hand-drawn line
      vertex(x, y);
    }
    endShape();
  }
}

// bubbles
function sx(x) { return x * width / BASE_W; }
function sy(y) { return y * height / BASE_H; }
function ss(v) { return v * min(width / BASE_W, height / BASE_H); }

// vị trí hiện tại của bubble i: trôi nhẹ quanh vị trí gốc bằng noise()
// trôi nhiều DỌC theo viền, rất ít vào trong, để bubble luôn sát viền
function bubblePos(i) {
  let b = bubbles[i];
  let t = frameCount * 0.004;
  let along = (noise(i * 10, t) - 0.5) * 80;       // dọc theo viền
  let across = (noise(i * 10 + 500, t) - 0.5) * 10; // vào trong / ra ngoài (rất nhỏ)

  // bubble nằm ở cạnh trên/dưới hay cạnh trái/phải?
  let nearTopBottom = min(b.y, BASE_H - b.y) < min(b.x, BASE_W - b.x);
  let dx = nearTopBottom ? along : across;
  let dy = nearTopBottom ? across : along;
  return { x: sx(b.x + dx), y: sy(b.y + dy) };
}

function drawBubbles() {
  let pos = [];
  for (let i = 0; i < bubbles.length; i++) pos.push(bubblePos(i));
  drawBubbleLinks(pos);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < bubbles.length; i++) drawBubble(bubbles[i], pos[i]);
}

// lines nối các bubble với nhau
function drawBubbleLinks(pos) {
  stroke(palette.dark);
  strokeWeight(1);
  for (let i = 0; i < pos.length; i++) {
    if (bubbles[i].noLink) continue; // bỏ line nối sang bubble kế tiếp
    let a = pos[i];
    let b = pos[(i + 1) % pos.length];
    line(a.x, a.y, b.x, b.y);
  }
}

// bubble + text hoặc icon bên trong
function drawBubble(b, p) {
  let r = ss(b.r);
  stroke(palette.dark);
  strokeWeight(1);
  fill(palette.bg);
  circle(p.x, p.y, r * 2);

  if (b.icon) {
    drawBubbleIcon(b, p, r);
  } else {
    noStroke();
    fill(palette.dark);
    textSize(max(20, r * 0.45)); // chữ to/nhỏ theo bubble, nhỏ nhất 20
    text(b.label, p.x, p.y);
  }
}

// icon cùng màu chữ
function drawBubbleIcon(b, p, r) {
  let s = r * 1.15;
  imageMode(CENTER);
  tint(palette.dark);
  image(b.icon, p.x, p.y, s, s * b.icon.height / b.icon.width);
  noTint();
}

// R
function keyPressed() {
  if (key === "r" || key === "R") {
    seed = floor(Math.random() * 100000);
    makeArtwork();
  }
}

// smooth start and end
function customSmoothstep(minValue, maxValue, value) {
  let x = constrain((value - minValue) / (maxValue - minValue), 0, 1);
  return x * x * (3 - 2 * x);
}
