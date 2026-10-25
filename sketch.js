// 18題 心理學（古典制約 vs 操作制約）題庫
const QUESTION_BANK = [
  { q: "一段時間一直在晚上讀書，過一段時間就變得只能在晚上讀書，這是？", ans: "古典制約" },
  { q: "小狗每次聽到鈴聲就流口水，這是？", ans: "古典制約" },
  { q: "老鼠按下槓桿就能得到食物，因而學會經常按槓桿，這是？", ans: "操作制約" },
  { q: "學生因為上課認真回答問題獲得老師加分，從此更積極舉手發言，這是？", ans: "操作制約" },
  { q: "幼兒因為觸摸熱水壺被燙傷一次，從此看到熱水壺就感到害怕，這是？", ans: "古典制約" },
  { q: "員工因為準時上班拿到全勤獎金，因此每天都準時到班，這是？", ans: "操作制約" },
  { q: "曾被大狗咬過的兒童，長大後看到小狗也會心生恐懼，這是？", ans: "古典制約" },
  { q: "狗狗完成坐下指令後得到一塊肉乾，之後聽到指令就立刻坐下，這是？", ans: "操作制約" },
  { q: "護士每次準備幫病人打針前消毒，病人看到酒精棉球就會開始緊張心跳加速，這是？", ans: "古典制約" },
  { q: "孩子因為房間收拾乾淨獲得媽媽稱讚，以後都會主動收房間，這是？", ans: "操作制約" },
  { q: "考試前夕聽到警報聲就會感到莫名的焦慮，這是？", ans: "古典制約" },
  { q: "小白鼠在迷宮中因為走對方向找到出口逃離電擊，後來走對的速度越來越快，這是？", ans: "操作制約" },
  { q: "只要聞到醫院消毒水的味道就感到噁心想吐，這是？", ans: "古典制約" },
  { q: "鴿子透過啄擊特定按鈕來獲得穀粒，因而學會持續啄擊，這是？", ans: "操作制約" },
  { q: "廣告常將喜歡的明星與商品放在一起，使消費者對商品產生好感，這是？", ans: "古典制約" },
  { q: "駕駛因為超速被開罰單後，未來開車變得更守規矩，這是？", ans: "操作制約" },
  { q: "嬰兒聽到巨大聲響會哭泣，後來看到白老鼠伴隨巨響，幾次後光看到白老鼠就會哭，這是？", ans: "古典制約" },
  { q: "業務員因為努力推銷達成業績獲得高額獎金，因此更加努力拜訪客戶，這是？", ans: "操作制約" }
];

let imgFiles = ['data/img1.jpg', 'data/img2.jpg', 'data/img3.jpg', 'data/img4.jpg', 'data/img5.jpg'];
let rawImages = [];
let selectedImg;

let gameQuestions = []; 
let puzzlePieces = [];  
let currentActivePiece = null; 

let correctCount = 0;
let solvedCount = 0;
let startTime = 0;
let elapsedTime = 0;
let isSoundOn = true;

let gameState = 'PLAYING'; 
let draggingPiece = null;

function preload() {
  for (let i = 0; i < imgFiles.length; i++) {
    rawImages.push(loadImage(imgFiles[i]));
  }
}

function setup() {
  let canvas = createCanvas(1000, 700);
  canvas.parent('canvas-container');
  textFont('Helvetica, Arial, sans-serif');
  startNewGame();
}

function startNewGame() {
  selectedImg = random(rawImages);
  
  let shuffledQ = shuffle([...QUESTION_BANK]);
  gameQuestions = shuffledQ.slice(0, 9);

  let tempPieces = [];
  let pieceW = selectedImg.width / 3;
  let pieceH = selectedImg.height / 3;

  let indices = shuffle([0,1,2,3,4,5,6,7,8]);

  for (let i = 0; i < 9; i++) {
    let targetRow = Math.floor(i / 3);
    let targetCol = i % 3;
    let qIndex = indices[i];

    tempPieces.push({
      id: i,
      qData: gameQuestions[qIndex],
      targetRow: targetRow,
      targetCol: targetCol,
      imgSlice: selectedImg.get(targetCol * pieceW, targetRow * pieceH, pieceW, pieceH),
      isUnlocked: false,
      isCorrect: null,
      isPlaced: false,
      w: 105,
      h: 105
    });
  }

  tempPieces = shuffle(tempPieces);

  for (let i = 0; i < tempPieces.length; i++) {
    let col = i % 3;
    let row = Math.floor(i / 3);
    tempPieces[i].x = 600 + col * 115;
    tempPieces[i].y = 150 + row * 115;
    tempPieces[i].homeX = 600 + col * 115;
    tempPieces[i].homeY = 150 + row * 115;
  }

  puzzlePieces = tempPieces;

  correctCount = 0;
  solvedCount = 0;
  startTime = millis();
  elapsedTime = 0;
  gameState = 'PLAYING';
  currentActivePiece = null;
  draggingPiece = null;
}

function draw() {
  background(240, 243, 246);

  if (gameState !== 'CLEAR') {
    elapsedTime = Math.floor((millis() - startTime) / 1000);
  }

  drawTopBar();
  drawLeftBoard();
  drawRightPieces();

  if (gameState === 'QUESTION') {
    drawQuestionModal();
  } else if (gameState === 'CLEAR') {
    drawClearScreen();
  }
}

function drawTopBar() {
  fill(255);
  noStroke();
  rect(0, 0, width, 70);
  stroke(220);
  line(0, 70, width, 70);

  fill(40);
  textSize(20);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text("答題拼圖：古典與操作制約", 40, 35);

  let statsX = 640;
  drawBadge(statsX, 20, 75, 30, "音效", isSoundOn ? "開" : "關", () => { isSoundOn = !isSoundOn; });
  drawStaticBadge(statsX + 85, 20, 80, 30, "拼好", `${solvedCount}/9`);
  drawStaticBadge(statsX + 175, 20, 80, 30, "答對", `${correctCount} 題`);
  
  let mins = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
  let secs = String(elapsedTime % 60).padStart(2, '0');
  drawStaticBadge(statsX + 265, 20, 85, 30, "時間", `${mins}:${secs}`);
}

function drawBadge(x, y, w, h, label, val, callback) {
  stroke(200);
  fill(255);
  rect(x, y, w, h, 6);
  noStroke();
  fill(100);
  textSize(11);
  textAlign(CENTER, TOP);
  text(label, x + w/2, y + 4);
  fill(40);
  textSize(13);
  textStyle(BOLD);
  text(val, x + w/2, y + 16);
}

function drawStaticBadge(x, y, w, h, label, val) {
  drawBadge(x, y, w, h, label, val, null);
}

function drawLeftBoard() {
  let boardX = 50;
  let boardY = 130;
  let boardSize = 450;
  let slotSize = boardSize / 3;

  fill(255);
  stroke(200);
  strokeWeight(2);
  rect(boardX, boardY, boardSize, boardSize, 10);

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let sx = boardX + c * slotSize;
      let sy = boardY + r * slotSize;
      
      stroke(230);
      strokeWeight(1);
      noFill();
      rect(sx, sy, slotSize, slotSize);
    }
  }

  for (let p of puzzlePieces) {
    if (p.isPlaced) {
      let px = boardX + p.targetCol * slotSize;
      let py = boardY + p.targetRow * slotSize;
      
      image(p.imgSlice, px, py, slotSize, slotSize);

      if (p.isCorrect === false) {
        fill(230, 57, 70, 90);
        noStroke();
        rect(px, py, slotSize, slotSize);

        fill(255);
        textSize(22);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text("✕", px + slotSize / 2, py + slotSize / 2);
      }

      stroke(255);
      strokeWeight(2);
      noFill();
      rect(px, py, slotSize, slotSize);
    }
  }
}

function drawRightPieces() {
  fill(100);
  textSize(14);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("點擊「?」回答問題，解鎖拼圖後拖曳至左側拼圖板", 580, 95);

  for (let p of puzzlePieces) {
    if (p.isPlaced) continue;

    push();
    translate(p.x, p.y);

    if (p.isUnlocked) {
      image(p.imgSlice, 0, 0, p.w, p.h);

      if (p.isCorrect === false) {
        fill(230, 57, 70, 90);
        noStroke();
        rect(0, 0, p.w, p.h, 6);

        fill(255);
        textSize(18);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text("✕ 答錯", p.w / 2, p.h / 2);
      }

      stroke(p.isCorrect === false ? '#e63946' : '#2a9d8f');
      strokeWeight(2.5);
      noFill();
      rect(0, 0, p.w, p.h, 6);
    } else {
      fill(50, 70, 90);
      noStroke();
      rect(0, 0, p.w, p.h, 6);

      fill(255);
      textSize(28);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text("?", p.w / 2, p.h / 2);

      fill(200);
      textSize(10);
      text("點我答題", p.w / 2, p.h - 15);
    }
    pop();
  }
}

function drawQuestionModal() {
  fill(0, 0, 0, 150);
  noStroke();
  rect(0, 0, width, height);

  let mWidth = 660;
  let mHeight = 410;
  let mX = (width - mWidth) / 2;
  let mY = (height - mHeight) / 2;

  fill(255);
  stroke(220);
  strokeWeight(1);
  rect(mX, mY, mWidth, mHeight, 12);

  fill(40);
  textSize(16);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text(`拼圖題目 (第 ${currentActivePiece.id + 1}/9 題)`, mX + 30, mY + 25);

  fill(100);
  textSize(12);
  text("答完無論對錯皆會解鎖拼圖，答對才會計分。", mX + 30, mY + 48);

  fill(30);
  textSize(15);
  textStyle(BOLD);
  text(currentActivePiece.qData.q, mX + 30, mY + 85, mWidth - 60, 95);

  let options = ["操作制約", "古典制約"];
  let optY = mY + 205;
  let optH = 55;

  for (let i = 0; i < 2; i++) {
    let oy = optY + i * 65;
    fill(248, 250, 252);
    stroke(200);
    strokeWeight(1.5);
    rect(mX + 30, oy, mWidth - 60, optH, 8);

    noStroke();
    fill(42, 157, 143);
    circle(mX + 60, oy + optH / 2, 28);
    fill(255);
    textSize(14);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(i + 1, mX + 60, oy + optH / 2);

    fill(40);
    textSize(16);
    textAlign(LEFT, CENTER);
    text(options[i], mX + 95, oy + optH / 2);
  }
}

function drawClearScreen() {
  fill(0, 0, 0, 180);
  noStroke();
  rect(0, 0, width, height);

  let cW = 560, cH = 500;
  let cX = (width - cW) / 2;
  let cY = (height - cH) / 2;

  fill(255);
  rect(cX, cY, cW, cH, 14);

  textAlign(CENTER, TOP);
  fill(40);
  textSize(24);
  textStyle(BOLD);
  text("🎉 恭喜完成拼圖挑戰！", cX + cW / 2, cY + 25);

  let mins = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
  let secs = String(elapsedTime % 60).padStart(2, '0');
  textSize(14);
  fill(100);
  text(`總花費時間：${mins}:${secs}  |  答對題數：${correctCount} / 9 題`, cX + cW / 2, cY + 60);

  let wrongItems = puzzlePieces.filter(p => p.isCorrect === false);

  if (wrongItems.length > 0) {
    fill(230, 57, 70);
    textSize(13);
    textStyle(BOLD);
    text(`⚠️ 有 ${wrongItems.length} 題回答錯誤（拼圖上標有 ✕ 記號）`, cX + cW / 2, cY + 90);
  } else {
    fill(42, 157, 143);
    textSize(13);
    textStyle(BOLD);
    text("🌟 太神啦！全部一次答對零失誤！", cX + cW / 2, cY + 90);
  }

  image(selectedImg, cX + (cW - 130) / 2, cY + 120, 130, 95);
  noStroke();
  stroke(200);
  noFill();
  rect(cX + (cW - 130) / 2, cY + 120, 130, 95);

  fill(80);
  textSize(12);
  textAlign(CENTER, TOP);
  text("左側拼圖板上帶有紅底「✕」的區塊即為答錯的題目", cX + cW / 2, cY + 380);

  let btnW = 180, btnH = 42;
  let btnX = cX + (cW - btnW) / 2;
  let btnY = cY + 435;
  fill(224, 122, 95);
  noStroke();
  rect(btnX, btnY, btnW, btnH, 8);

  fill(255);
  textSize(15);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("再玩一次", btnX + btnW / 2, btnY + btnH / 2);
}

function mousePressed() {
  handleTouchOrClick(mouseX, mouseY);
}

function mouseDragged() {
  if (gameState === 'PLAYING' && draggingPiece) {
    draggingPiece.x = mouseX - draggingPiece.w / 2;
    draggingPiece.y = mouseY - draggingPiece.h / 2;
  }
}

function mouseReleased() {
  handleRelease();
}

// 支援手機觸控事件
function touchStarted() {
  if (touches.length > 0) {
    handleTouchOrClick(touches[0].x, touches[0].y);
  }
  return false; // 防止手機預設滾動行為
}

function touchMoved() {
  if (gameState === 'PLAYING' && draggingPiece && touches.length > 0) {
    draggingPiece.x = touches[0].x - draggingPiece.w / 2;
    draggingPiece.y = touches[0].y - draggingPiece.h / 2;
  }
  return false;
}

function touchEnded() {
  handleRelease();
  return false;
}

function handleTouchOrClick(mx, my) {
  if (gameState === 'PLAYING') {
    for (let i = puzzlePieces.length - 1; i >= 0; i--) {
      let p = puzzlePieces[i];
      if (!p.isPlaced && mx >= p.x && mx <= p.x + p.w && my >= p.y && my <= p.y + p.h) {
        if (!p.isUnlocked) {
          currentActivePiece = p;
          gameState = 'QUESTION';
        } else {
          draggingPiece = p;
          puzzlePieces.splice(i, 1);
          puzzlePieces.push(p);
        }
        return;
      }
    }
  } else if (gameState === 'QUESTION') {
    let mWidth = 660;
    let mHeight = 410;
    let mX = (width - mWidth) / 2;
    let mY = (height - mHeight) / 2;
    let optY = mY + 205;
    let optH = 55;

    for (let i = 0; i < 2; i++) {
      let oy = optY + i * 65;
      if (mx >= mX + 30 && mx <= mX + mWidth - 30 && my >= oy && my <= oy + optH) {
        let chosenAns = (i === 0) ? "操作制約" : "古典制約";
        
        if (chosenAns === currentActivePiece.qData.ans) {
          currentActivePiece.isCorrect = true;
          correctCount++;
        } else {
          currentActivePiece.isCorrect = false;
        }

        currentActivePiece.isUnlocked = true;
        gameState = 'PLAYING';
        currentActivePiece = null;
        return;
      }
    }
  } else if (gameState === 'CLEAR') {
    let cW = 560, cH = 500;
    let cX = (width - cW) / 2;
    let cY = (height - cH) / 2;
    let btnW = 180, btnH = 42;
    let btnX = cX + (cW - btnW) / 2;
    let btnY = cY + 435;

    if (mx >= btnX && mx <= btnX + btnW && my >= btnY && my <= btnY + btnH) {
      startNewGame();
    }
  }
}

function handleRelease() {
  if (gameState === 'PLAYING' && draggingPiece) {
    let boardX = 50;
    let boardY = 130;
    let boardSize = 450;
    let slotSize = boardSize / 3;

    let targetPixelX = boardX + draggingPiece.targetCol * slotSize;
    let targetPixelY = boardY + boardSize / 3 * draggingPiece.targetRow; // 修正精確對齊

    let centerX = draggingPiece.x + draggingPiece.w / 2;
    let centerY = draggingPiece.y + draggingPiece.h / 2;

    if (centerX >= targetPixelX && centerX <= targetPixelX + slotSize &&
        centerY >= targetPixelY && centerY <= targetPixelY + slotSize) {
      draggingPiece.isPlaced = true;
      solvedCount++;

      if (solvedCount === 9) {
        gameState = 'CLEAR';
      }
    } else {
      draggingPiece.x = draggingPiece.homeX;
      draggingPiece.y = draggingPiece.homeY;
    }

    draggingPiece = null;
  }
}