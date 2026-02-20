// Classic Snake Game
// Game logic and rendering

window.addEventListener('DOMContentLoaded', init);

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const speed = 2; // pixels per second (to make it playable, but following spec; in practice, player can adjust this)
let gameState = 'start';
let score = 0;
let food = { x: null, y: null, timer: 0, timeRemaining: 5 };
let snake = {
    segments: [{ x: 200, y: 200 }, { x: 190, y: 200 }], // initial 2-segment snake
    direction: { dx: 1, dy: 0 },
    path: [{ x: 200, y: 200 }, { x: 190, y: 200 }] // path for continuous following
};
let lastTime = 0;

function init() {
    spawnFood();
    // Event listeners are attached in code below for better organization
}

function spawnFood() {
    do {
        food.x = Math.floor(Math.random() * 40) * 10;
        food.y = Math.floor(Math.random() * 40) * 10;
    } while (snake.segments.some(s => Math.abs(s.x - food.x) < 10 && Math.abs(s.y - food.y) < 10));
    food.timer = food.timeRemaining;
    food.timeRemaining = Math.max(1, food.timeRemaining); // ensure it's set
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function update(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000; // in seconds
    lastTime = timestamp;

    if (gameState === 'playing') {
        // Move head continuously
        const newHead = {
            x: snake.segments[0].x + snake.direction.dx * speed * deltaTime,
            y: snake.segments[0].y + snake.direction.dy * speed * deltaTime
        };
        snake.path.unshift(newHead);

        // Compute segment positions based on path
        computeSegmentPositions();

        // Trim path to prevent memory issues
        let pathDist = 0;
        for (let j = 1; j < snake.path.length; j++) {
            pathDist += distance(snake.path[j - 1], snake.path[j]);
        }
        const totalNeeded = snake.segments.length * 10;
        while (pathDist > totalNeeded * 1.5 && snake.path.length > snake.segments.length) {
            const d = distance(snake.path[snake.path.length - 2], snake.path[snake.path.length - 1]);
            snake.path.pop();
            pathDist -= d;
        }

        // Collision with walls
        if (newHead.x < 0 || newHead.x > 390 || newHead.y < 0 || newHead.y > 390) {
            gameState = 'gameOver';
            return;
        }

        // Collision with self
        for (let i = 1; i < snake.segments.length; i++) {
            if (distance(snake.segments[0], snake.segments[i]) < 10) {
                gameState = 'gameOver';
                return;
            }
        }

        // Check if food eaten
        if (food.x !== null && distance(snake.segments[0], food) < 15) { // 10 + 5
            score++;
            food.timeRemaining = Math.max(1, food.timeRemaining - 1);
            snake.segments.push({ ...snake.segments[snake.segments.length - 1] }); // grow by adding segment
            spawnFood();
        }

        // Update food timer
        food.timer -= deltaTime;
        if (food.timer <= 0) {
            spawnFood();
        }
    }
}

function computeSegmentPositions() {
    // Segment 0 is always the head (path[0])
    snake.segments[0] = snake.path[0];
    for (let i = 1; i < snake.segments.length; i++) {
        const distToGo = i * 10;
        let dist = 0;
        for (let j = 1; j < snake.path.length; j++) {
            const d = distance(snake.path[j - 1], snake.path[j]);
            if (dist + d >= distToGo) {
                const remaining = distToGo - dist;
                const ratio = remaining / d;
                snake.segments[i] = {
                    x: snake.path[j - 1].x + (snake.path[j].x - snake.path[j - 1].x) * ratio,
                    y: snake.path[j - 1].y + (snake.path[j].y - snake.path[j - 1].y) * ratio
                };
                break;
            }
            dist += d;
        }
        if (snake.path.length - 1 <= i && dist < distToGo) {
            snake.segments[i] = { ...snake.path[snake.path.length - 1] }; // at end of path
        }
    }
}

function render() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 400, 400);

    if (gameState === 'start') {
        ctx.fillStyle = '#fff';
        ctx.font = '48px serif';
        ctx.fillText('Snake', 150, 200);
        ctx.font = '24px serif';
        ctx.fillText('Press Space to start', 100, 250);
    } else if (gameState === 'playing') {
        // Render snake
        ctx.fillStyle = 'green';
        for (const s of snake.segments) {
            ctx.fillRect(s.x - 5, s.y - 5, 10, 10);
        }
        // Render food
        if (food.x !== null) {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(food.x, food.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (gameState === 'gameOver') {
        ctx.fillStyle = '#fff';
        ctx.font = '48px serif';
        ctx.fillText('Game Over', 120, 200);
        ctx.font = '24px serif';
        ctx.fillText('Score: ' + score, 150, 250);
        ctx.fillText('Press Space to restart', 80, 280);
    }
}

function gameLoop(timestamp) {
    update(timestamp);
    render();
    if (gameState === 'playing') {
        requestAnimationFrame(gameLoop);
    }
}

// Input handling
window.addEventListener('keydown', (e) => {
    if (gameState === 'start' && e.code === 'Space') {
        gameState = 'playing';
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    } else if (gameState === 'gameOver' && e.code === 'Space') {
        // Reset game
        snake.segments = [{ x: 200, y: 200 }, { x: 190, y: 200 }];
        snake.direction = { dx: 1, dy: 0 };
        snake.path = [{ x: 200, y: 200 }, { x: 190, y: 200 }];
        score = 0;
        food.timeRemaining = 5;
        spawnFood();
        gameState = 'start';
    } else if (gameState === 'playing') {
        // Prevent reverse direction
        if (e.code === 'ArrowLeft' && snake.direction.dx !== 1) {
            snake.direction = { dx: -1, dy: 0 };
        } else if (e.code === 'ArrowRight' && snake.direction.dx !== -1) {
            snake.direction = { dx: 1, dy: 0 };
        } else if (e.code === 'ArrowUp' && snake.direction.dy !== 1) {
            snake.direction = { dx: 0, dy: -1 };
        } else if (e.code === 'ArrowDown' && snake.direction.dy !== -1) {
            snake.direction = { dx: 0, dy: 1 };
        }
    }
});