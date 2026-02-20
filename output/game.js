const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const ui = {
    currentPlayer: document.getElementById('current-player'),
    currentPosition: document.getElementById('current-position'),
    diceButton: document.getElementById('dice-button'),
    diceDisplay: document.getElementById('dice-display'),
    message: document.getElementById('message'),
    startScreen: document.getElementById('start-screen'),
    onePlayerBtn: document.getElementById('one-player'),
    twoPlayerBtn: document.getElementById('two-player')
};

const BOARD_SIZE = 10;
const SQUARE_SIZE = 50;
const BOARD_OFFSET_X = 50;
const BOARD_OFFSET_Y = 50;

const SNAKES = {
    16: 6,
    47: 26,
    49: 11,
    56: 53,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    98: 78
};

const LADDERS = {
    1: 38,
    4: 14,
    9: 31,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    71: 91,
    80: 100
};

class Player {
    constructor(color, name) {
        this.position = 0;
        this.color = color;
        this.name = name;
        this.consecutiveSixes = 0;
    }
}

let players = [];
let currentPlayerIndex = 0;
let isAnimating = false;
let gameMode = null;
let dice = 0;
let animationPos = 0;
let animationTarget = 0;
let isGameOver = false;

function init() {
    ui.onePlayerBtn.addEventListener('click', () => startGame(1));
    ui.twoPlayerBtn.addEventListener('click', () => startGame(2));
    ui.diceButton.addEventListener('click', rollDice);
}

function startGame(mode) {
    gameMode = mode;
    ui.startScreen.style.display = 'none';
    players = [new Player('red', 'Player 1')];
    if (mode === 2) {
        players.push(new Player('blue', 'Player 2'));
    } else {
        players.push(new Player('green', 'AI'));
    }
    // Random turn order
    if (Math.random() < 0.5) {
        players.reverse();
        players[0].name = 'Player 1';
        players[1].name = 'Player 2' in mode === 2 ? 'Player 2' : 'AI';
    }
    updateUI();
    gameLoop();
}

function gameLoop() {
    if (!isGameOver) {
        drawBoard();
        if (isAnimating) {
            animateMovement();
        }
        requestAnimationFrame(gameLoop);
    }
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw squares
    for (let i = 1; i <= 100; i++) {
        let pos = getSquarePosition(i);
        ctx.fillStyle = (Math.floor((i-1)/10) % 2 === 0) ? 'white' : 'lightgray';
        ctx.fillRect(pos.x, pos.y, SQUARE_SIZE, SQUARE_SIZE);
        ctx.strokeRect(pos.x, pos.y, SQUARE_SIZE, SQUARE_SIZE);
        ctx.fillStyle = 'black';
        ctx.fillText(i, pos.x + SQUARE_SIZE/2, pos.y + SQUARE_SIZE/2);
    }
    // Draw snakes
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 3;
    for (let start in SNAKES) {
        let startPos = getSquareCenter(parseInt(start));
        let endPos = getSquareCenter(SNAKES[start]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
    }
    // Draw ladders
    ctx.strokeStyle = 'brown';
    for (let start in LADDERS) {
        let startPos = getSquareCenter(parseInt(start));
        let endPos = getSquareCenter(LADDERS[start]);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
    }
    // Draw players
    for (let player of players) {
        let pos = getSquareCenter(player.position);
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function getSquarePosition(num) {
    let row = Math.floor((num-1) / BOARD_SIZE);
    let col = (num-1) % BOARD_SIZE;
    if (row % 2 === 1) {
        col = 9 - col;
    }
    return { x: BOARD_OFFSET_X + col * SQUARE_SIZE, y: BOARD_OFFSET_Y + (9 - row) * SQUARE_SIZE };
}

function getSquareCenter(num) {
    let pos = getSquarePosition(num);
    return { x: pos.x + SQUARE_SIZE/2, y: pos.y + SQUARE_SIZE/2 };
}

function rollDice() {
    if (isAnimating || isGameOver || (gameMode === 1 && players[currentPlayerIndex].name === 'AI')) return;
    dice = Math.floor(Math.random() * 6) + 1;
    ui.diceDisplay.textContent = `Dice: ${dice}`;
    movePlayer();
}

function movePlayer() {
    let player = players[currentPlayerIndex];
    if (dice === 6) {
        player.consecutiveSixes++;
        if (player.consecutiveSixes === 3) {
player.position = 0;
            player.consecutiveSixes = 0;
            updateUI();
            nextTurn();
            return;
        }
    } else {
        player.consecutiveSixes = 0;
    }
    let target = player.position + dice;
    if (target > 100) {
        updateUI();
        nextTurn();
        return;
    }
    if (target === 100) {
        player.position = 100;
        gameOver(`Congratulations! ${player.name} wins!`);
        return;
    }
    // Animate to target
    animateTo(target);
}

function animateTo(target) {
    animationTarget = target;
    animationPos = players[currentPlayerIndex].position;
    isAnimating = true;
}

function animateMovement() {
    let step = 0.1;
    animationPos += step;
    if (animationPos >= animationTarget) {
        animationPos = animationTarget;
        players[currentPlayerIndex].position = Math.round(animationTarget);
        checkSnakeLadder();
        isAnimating = false;
        if (!isAnimating) {
            nextTurn();
        }
    } else {
        players[currentPlayerIndex].position = Math.round(animationPos);
    }
}

function checkSnakeLadder() {
    let pos = players[currentPlayerIndex].position;
    if (SNAKES[pos]) {
        animateTo(SNAKES[pos]);
    } else if (LADDERS[pos]) {
        animateTo(LADDERS[pos]);
    }
}

function nextTurn() {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    updateUI();
    // If AI turn
    if (gameMode === 1 && players[currentPlayerIndex].name === 'AI' && !isGameOver) {
        setTimeout(rollDice, 1000);
    }
}

function updateUI() {
    let player = players[currentPlayerIndex];
    ui.currentPlayer.textContent = `Current Player: ${player.name}`;
    ui.currentPosition.textContent = `Position: ${player.position}`;
}

function gameOver(msg) {
    isGameOver = true;
    ui.message.textContent = msg;
    ui.diceButton.disabled = true;
}

init();