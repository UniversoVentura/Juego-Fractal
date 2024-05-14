const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const laneWidth = canvas.width / 5;  // Dividir el canvas en 5 carriles
const lanes = [
    laneWidth * 0.5,
    laneWidth * 1.5,
    laneWidth * 2.5,
    laneWidth * 3.5,
    laneWidth * 4.5
];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let backgroundA = new Image();
let backgroundB = new Image();
let imagesLoaded = 0;
let gameStarted = false;
let backgroundAPosition = 0;
let backgroundBPosition = 0;
let backgroundASpeed = 1;
let backgroundBSpeed = 0.5;

backgroundA.src = 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/7785b0198228883.6641203e4b0ae.png';
backgroundB.src = 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/229361198228883.6641203e4b872.png';

backgroundA.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        requestAnimationFrame(updateGame);
    }
};

backgroundB.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        requestAnimationFrame(updateGame);
    }
};

let lastDraw = 0;
function updateGame() {
    if (!gameStarted) {
        requestAnimationFrame(updateGame);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    updatePlayer();
    drawPlayer();
    drawBalls();
    updateBalls();
    displayScore();
    requestAnimationFrame(updateGame);
}
requestAnimationFrame(updateGame);

let backgroundY = 0;
let scrollSpeed = 2;

let playerImage = new Image();
playerImage.src = 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/fecc3f198228883.663d7d86840ea.png';

let player = {
    x: canvas.width / 5 - 50,
    y: canvas.height - 150,
    size: 130,
    targetX: canvas.width / 5 - 50,
    speed: 0.1
};

let balls = [];
let score = -30;
let keysPressed = {};
let startTime = Date.now();

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateGame();
}

window.addEventListener('resize', resizeCanvas);
document.addEventListener('DOMContentLoaded', function() {
    resizeCanvas();
});

function getTouchPos(canvasDom, touchEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
    };
}

canvas.addEventListener('touchstart', function(e) {
    var touchPos = getTouchPos(canvas, e);
    var touchX = touchPos.x;
    if (touchX < canvas.width / 2) {
        player.targetX -= 50;
    } else {
        player.targetX += 50;
    }
    e.preventDefault();
}, false);

function drawBackground() {
    let opacity = 0.5 + score / 30;
    opacity = Math.max(0, Math.min(opacity, 1));

    backgroundAPosition += backgroundASpeed;
    if (backgroundAPosition > canvas.height) {
        backgroundAPosition = 0;
    }
    ctx.globalAlpha = 1;
    ctx.drawImage(backgroundA, 0, backgroundAPosition - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(backgroundA, 0, backgroundAPosition, canvas.width, canvas.height);

    backgroundBPosition += backgroundBSpeed;
    if (backgroundBPosition > canvas.height) {
        backgroundBPosition = 0;
    }
    ctx.globalAlpha = opacity;
    ctx.drawImage(backgroundB, 0, backgroundBPosition - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(backgroundB, 0, backgroundBPosition, canvas.width, canvas.height);

    ctx.globalAlpha = 1;
}

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.size, player.size);
}

function updatePlayer() {
    let distance = player.targetX - player.x;
    if (Math.abs(distance) > 1) {
        player.x += distance * easeInOutQuad(Math.abs(distance) / canvas.width);
    } else {
        player.x = player.targetX;
    }
    if (keysPressed['ArrowRight'] && player.targetX + player.size < canvas.width) {
        player.targetX += 5;
    } else if (keysPressed['ArrowLeft'] && player.targetX > 0) {
        player.targetX -= 5;
    }
}

function easeInOutQuad(t) {
    return t * t * (3 - 2 * t);
}

function getRandomColor() {
    let elapsedTime = (Date.now() - startTime) / 60000;
    let blackBallProbability = 0.1 + 0.02 * elapsedTime;
    if (blackBallProbability > 0.1) blackBallProbability = 0.1;

    return Math.random() < blackBallProbability ? 'rgb(0,0,0)' : `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}

function isOverlapping(newBall) {
    let overlap = balls.some(ball => Math.abs(ball.x - newBall.x) < newBall.size && Math.abs(ball.y - newBall.y) < newBall.size * 2);
    console.log('Checking Overlap:', overlap);
    return overlap;
}

function addBall() {
    let size = 60;
    let isBlackBall = Math.random() < (0.1 + 0.05 * ((Date.now() - startTime) / 60000));
    let dx = 0;
    let dy = 2;
    let isGuided = false;

    let ballColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

    if (isBlackBall) {
        ballColor = 'rgb(0,0,0)';
        dx = player.x + player.size / 2 > canvas.width / 2 ? 1 : -1;
        dy = 0.3;
        isGuided = true;
    }

    let ball = {
        x: isBlackBall ? (player.x + player.size / 2) : Math.random() * canvas.width,
        y: -size,
        size: size,
        dx: dx,
        dy: dy,
        color: ballColor,
        isGuided: isGuided
    };
    balls.push(ball);
}

function drawBalls() {
    balls.forEach(ball => {
        let gradient = ctx.createRadialGradient(ball.x, ball.y, ball.size * 0.1, ball.x, ball.y, ball.size);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(0.94, ball.color);
        gradient.addColorStop(1, 'white');

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;

        ctx.shadowBlur = 15;
        ctx.shadowColor = ball.color;

        ctx.fill();
        ctx.closePath();

        ctx.shadowBlur = 0;
    });
}

function updateBalls() {
    balls.forEach(ball => {
        if (ball.isGuided) {
            ball.dx = (player.x + player.size / 2 - ball.x) * 0.02;
        }
        ball.x += ball.dx;
        ball.y += ball.dy;
    });

    for (let i = 0; i < balls.length; i++) {
        const ballA = balls[i];
        for (let j = i + 1; j < balls.length; j++) {
            const ballB = balls[j];
            if (Math.hypot(ballA.x - ballB.x, ballA.y - ballB.y) < ballA.size + ballB.size) {
                if ((ballA.color === 'rgb(0,0,0)' && ballB.color !== 'rgb(0,0,0)') ||
                    (ballB.color === 'rgb(0,0,0)' && ballA.color !== 'rgb(0,0,0)')) {
                    ballA.toRemove = true;
                    ballB.toRemove = true;
                    ballA.isGuided = false;
                    ballB.isGuided = false;
                }
            }
        }

        if (ballA.x + ballA.size > player.x && ballA.x - ballA.size < player.x + player.size &&
            ballA.y + ballA.size > player.y && ballA.y - ballA.size < player.y + player.size) {
            if (ballA.color === 'rgb(0,0,0)') {
                score -= 1;
            } else {
                score += 1;
                flashScreen(ballA.color);
            }
            ballA.toRemove = true;
        }

        if (ballA.y - ballA.size > canvas.height || ballA.toRemove) {
            balls.splice(i, 1);
            i--;
        }
    }
}

function checkCollisions() {
    for (let i = 0; i < balls.length; i++) {
        const ball1 = balls[i];
        for (let j = i + 1; j < balls.length; j++) {
            const ball2 = balls[j];
        }
    }
}

function flashScreen(color) {
    const flashBox = document.getElementById('flashBox');

    flashBox.style.transition = '';
    flashBox.style.opacity = '0.5';
    flashBox.offsetHeight;

    flashBox.style.backgroundColor = color;
    flashBox.style.opacity = '0.5';
    flashBox.style.transition = 'opacity 1s ease-out';

    setTimeout(() => {
        flashBox.style.opacity = '0';
        setTimeout(() => {
            flashBox.style.backgroundColor = 'transparent';
        }, 500);
    }, 50);
}

function displayScore() {
    ctx.font = '18px "Press Start 2P", cursive';
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.1, "yellow");
    gradient.addColorStop(0.8, "green");

    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    ctx.fillText("Score: " + score, 10, 50);
    ctx.shadowColor = 'transparent';
}

function initGame() {
    gameStarted = true;
    score = -30;
    requestAnimationFrame(updateGame);

    setTimeout(endGame, 180000); // Terminar el juego después de 3 minutos (180,000 ms)
}

function endGame() {
    gameStarted = false;
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('scoreScreen').style.display = 'flex';
    document.getElementById('finalScore').textContent = score;
}

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const replayButton = document.getElementById('replayButton');
    const gameMusic = document.getElementById('gameMusic');
    const startScreen = document.getElementById('startScreen');
    const canvas = document.getElementById('gameCanvas');

    startButton.addEventListener('click', function() {
        startScreen.style.display = 'none';
        canvas.style.display = 'block';
        gameMusic.play();
        initGame();
    });

    replayButton.addEventListener('click', function() {
        location.reload();
    });
});

document.addEventListener('keydown', function(e) {
    keysPressed[e.key] = true;
});

document.addEventListener('keyup', function(e) {
    keysPressed[e.key] = false;
});

setInterval(addBall, 500);
requestAnimationFrame(updateGame);
