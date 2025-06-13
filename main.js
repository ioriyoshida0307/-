const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const size = 8;
const cellSize = canvas.width / size;

const EMPTY = 0, BLACK = 1, WHITE = 2;
let board = Array.from({ length: size }, () => Array(size).fill(EMPTY));
let turn = BLACK;

const directions = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [-1, 1], [1, -1], [1, 1]
];

function initBoard() {
  board[3][3] = WHITE;
  board[3][4] = BLACK;
  board[4][3] = BLACK;
  board[4][4] = WHITE;
  drawBoard();
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      ctx.strokeStyle = "black";
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      if (board[y][x] === BLACK) {
        drawDisc(x, y, "black");
      } else if (board[y][x] === WHITE) {
        drawDisc(x, y, "white");
      }
    }
  }
}

function drawDisc(x, y, color) {
  ctx.beginPath();
  ctx.arc(
    x * cellSize + cellSize / 2,
    y * cellSize + cellSize / 2,
    cellSize / 2.5,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = color;
  ctx.fill();
}

function inBounds(x, y) {
  return x >= 0 && x < size && y >= 0 && y < size;
}

function getFlips(x, y, player) {
  if (board[y][x] !== EMPTY) return [];
  const opponent = player === BLACK ? WHITE : BLACK;
  let flips = [];

  for (let [dx, dy] of directions) {
    let nx = x + dx;
    let ny = y + dy;
    let line = [];

    while (inBounds(nx, ny) && board[ny][nx] === opponent) {
      line.push([nx, ny]);
      nx += dx;
      ny += dy;
    }

    if (line.length && inBounds(nx, ny) && board[ny][nx] === player) {
      flips = flips.concat(line);
    }
  }

  return flips;
}

function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / cellSize);
  const y = Math.floor((e.clientY - rect.top) / cellSize);

  const flips = getFlips(x, y, turn);
  if (flips.length > 0) {
    board[y][x] = turn;
    for (const [fx, fy] of flips) {
      board[fy][fx] = turn;
    }
    turn = turn === BLACK ? WHITE : BLACK;
    updateStatus();
  } else if (hasValidMoves(turn)) {
    alert("その手は打てません！");
  }

  if (!hasValidMoves(BLACK) && !hasValidMoves(WHITE)) {
    endGame();
  }

  drawBoard();
}

function hasValidMoves(player) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (getFlips(x, y, player).length > 0) return true;
    }
  }
  return false;
}

function updateStatus() {
  const status = document.getElementById("status");
  if (hasValidMoves(turn)) {
    status.textContent = turn === BLACK ? "黒の番です" : "白の番です";
  } else {
    turn = turn === BLACK ? WHITE : BLACK;
    if (hasValidMoves(turn)) {
      status.textContent = `${turn === BLACK ? "黒" : "白"}の番です（パス）`;
    } else {
      endGame();
    }
  }
}

function endGame() {
  let blackCount = 0, whiteCount = 0;
  for (let row of board) {
    for (let cell of row) {
      if (cell === BLACK) blackCount++;
      if (cell === WHITE) whiteCount++;
    }
  }

  let result;
  if (blackCount > whiteCount) result = "黒の勝ち！";
  else if (whiteCount > blackCount) result = "白の勝ち！";
  else result = "引き分け！";

  document.getElementById("status").textContent =
    `終了：黒 ${blackCount} 対 白 ${whiteCount} → ${result}`;

  canvas.removeEventListener("click", handleClick);
}

canvas.addEventListener("click", handleClick);
initBoard();