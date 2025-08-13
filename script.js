// Game elements

const canvas = document.getElementById('game-canvas');

const ctx = canvas.getContext('2d');

const mainMenu = document.getElementById('main-menu');

const settingsMenu = document.getElementById('settings-menu');

const gameOverMenu = document.getElementById('game-over');

const playBtn = document.getElementById('play-btn');

const settingsBtn = document.getElementById('settings-btn');

const closeSettingsBtn = document.getElementById('close-settings');

const restartBtn = document.getElementById('restart-btn');

const menuBtn = document.getElementById('menu-btn');

const finalScore = document.getElementById('final-score');

const highScore = document.getElementById('high-score');

const themeSelect = document.getElementById('theme-select');

const gameControls = document.getElementById('game-controls');

const pauseBtn = document.getElementById('pause-btn');

const restartGameBtn = document.getElementById('restart-game-btn');

// Sound elements

const flapSound = document.getElementById('flap-sound');

const scoreSound = document.getElementById('score-sound');

const hitSound = document.getElementById('hit-sound');

const backgroundMusic = document.getElementById('background-music');

// Toggle switches

const soundOn = document.getElementById('sound-on');

const soundOff = document.getElementById('sound-off');

const musicOn = document.getElementById('music-on');

const musicOff = document.getElementById('music-off');

// Game state

let gameRunning = false;

let gamePaused = false;

let score = 0;

let bestScore = localStorage.getItem('flappyHighScore') || 0;

highScore.textContent = bestScore;

// Settings

let soundEnabled = true;

let musicEnabled = true;

let currentTheme = 'water';

// Game objects

let bird = {

    x: 100,

    y: 300,

    width: 40,

    height: 30,

    velocity: 0,

    gravity: 0.2,

    jumpForce: -5,

    rotation: 0

};

// Load images

const pipeImg = new Image();

pipeImg.src = 'https://iili.io/3ls3xt4.md.png';

const pipeRotatedImg = new Image();

pipeRotatedImg.src = 'https://iili.io/3ERjXS9.md.png';

const birdImg = new Image();

birdImg.src = 'https://iili.io/3lsXOxe.md.png';

let pipes = [];

let pipeWidth = 80;

let pipeGap = 150;

let pipeDistance = 250;

let lastPipeX = 0;

// Background elements

let background = {

    x: 0,

    speed: 1

};

let ground = {

    x: 0,

    height: 100,

    speed: 2

};

// Theme assets

const themes = {

    water: {

        background: '#70c5ce',

        groundColor: '#deb887'

    },

    desert: {

        background: '#f4a460',

        groundColor: '#cd853f'

    },

    snow: {

        background: '#b0e0e6',

        groundColor: '#fff'

    },

    night: {

        background: '#0a0a2a',

        groundColor: '#333'

    }

};

// Initialize game

function initGame() {

    // Set canvas size

    canvas.width = 400;

    canvas.height = 600;

    

    // Reset game state

    bird.y = 300;

    bird.velocity = 0;

    bird.rotation = 0;

    pipes = [];

    score = 0;

    lastPipeX = canvas.width;

    

    // Set theme

    currentTheme = themeSelect.value;

    

    // Start game loop

    gameRunning = true;

    gamePaused = false;

    mainMenu.style.display = 'none';

    gameOverMenu.style.display = 'none';

    gameControls.style.display = 'flex';

    pauseBtn.textContent = '⏸';

    

    // Play background music if enabled

    if (musicEnabled) {

        backgroundMusic.currentTime = 0;

        backgroundMusic.play();

    }

    

    // Add event listeners

    document.addEventListener('keydown', handleKeyDown);

    canvas.addEventListener('click', handleTap);

    canvas.addEventListener('touchstart', handleTap);

    

    // Start animation

    requestAnimationFrame(gameLoop);

}

// Game loop

function gameLoop() {

    if (!gameRunning) return;

    if (gamePaused) {

        render();

        requestAnimationFrame(gameLoop);

        return;

    }

    

    update();

    render();

    

    requestAnimationFrame(gameLoop);

}

// Update game state

function update() {

    // Update bird

    bird.velocity += bird.gravity;

    bird.y += bird.velocity;

    bird.rotation = Math.min(bird.velocity * 5, 90);

    

    // Check for collisions with ground or ceiling

    if (bird.y + bird.height > canvas.height - ground.height) {

        bird.y = canvas.height - ground.height - bird.height;

        gameOver();

    }

    

    if (bird.y < 0) {

        bird.y = 0;

        bird.velocity = 0;

    }

    

    // Update pipes

    if (pipes.length === 0 || canvas.width - pipes[pipes.length - 1].x > pipeDistance) {

        generatePipe();

    }

    

    for (let i = 0; i < pipes.length; i++) {

        pipes[i].x -= 2;

        

        // Check for collisions with pipes

        if (

            bird.x + bird.width > pipes[i].x &&

            bird.x < pipes[i].x + pipeWidth &&

            (bird.y < pipes[i].topHeight || bird.y + bird.height > pipes[i].topHeight + pipeGap)

        ) {

            gameOver();

        }

        

        // Check for scoring

        if (!pipes[i].scored && bird.x > pipes[i].x + pipeWidth) {

            pipes[i].scored = true;

            score++;

            if (soundEnabled) scoreSound.currentTime = 0, scoreSound.play();

        }

    }

    

    // Remove off-screen pipes

    if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {

        pipes.shift();

    }

    

    // Update background and ground

    background.x = (background.x - background.speed) % canvas.width;

    ground.x = (ground.x - ground.speed) % 50;

}

// Render game

function render() {

    const theme = themes[currentTheme];

    

    // Clear canvas

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    

    // Draw background

    ctx.fillStyle = theme.background;

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    

    // Draw pipes

    for (let pipe of pipes) {

        // Top pipe (rotated 180 degrees)

        ctx.save();

        ctx.translate(pipe.x + pipeWidth/2, pipe.topHeight);

        ctx.rotate(Math.PI);

        ctx.drawImage(pipeRotatedImg, -pipeWidth/2, 0, pipeWidth, pipe.topHeight);

        ctx.restore();

        

        // Bottom pipe

        ctx.drawImage(

            pipeImg,

            pipe.x,

            pipe.topHeight + pipeGap,

            pipeWidth,

            canvas.height - pipe.topHeight - pipeGap - ground.height

        );

    }

    

    // Draw ground

    ctx.fillStyle = theme.groundColor;

    ctx.fillRect(0, canvas.height - ground.height, canvas.width, ground.height);

    

    // Draw bird

    ctx.save();

    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);

    ctx.rotate(bird.rotation * Math.PI / 180);

    ctx.drawImage(birdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);

    ctx.restore();

    

    // Draw score

    ctx.fillStyle = '#ffffff';

    ctx.font = 'bold 30px Arial';

    ctx.textAlign = 'center';

    ctx.fillText(score.toString(), canvas.width / 2, 50);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';

    ctx.lineWidth = 4;

    ctx.strokeText(score.toString(), canvas.width / 2, 50);

    

    // Draw pause overlay if game is paused

    if (gamePaused) {

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#ffffff';

        ctx.font = 'bold 36px Arial';

        ctx.textAlign = 'center';

        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);

    }

}

// Generate new pipe

function generatePipe() {

    const minHeight = 80;

    const maxHeight = canvas.height - ground.height - pipeGap - minHeight;

    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    

    pipes.push({

        x: canvas.width,

        topHeight: topHeight,

        scored: false

    });

}

// Handle game over

function gameOver() {

    gameRunning = false;

    

    // Stop background music

    backgroundMusic.pause();

    

    // Update high score

    if (score > bestScore) {

        bestScore = score;

        localStorage.setItem('flappyHighScore', bestScore);

        highScore.textContent = bestScore;

    }

    

    // Show game over menu

    finalScore.textContent = score;

    gameOverMenu.style.display = 'flex';

    gameControls.style.display = 'none';

    

    // Play hit sound

    if (soundEnabled) hitSound.currentTime = 0, hitSound.play();

    

    // Remove event listeners

    document.removeEventListener('keydown', handleKeyDown);

    canvas.removeEventListener('click', handleTap);

    canvas.removeEventListener('touchstart', handleTap);

}

// Handle keyboard input

function handleKeyDown(e) {

    if (e.code === 'Space') {

        e.preventDefault();

        if (gamePaused) {

            togglePause();

        } else {

            flap();

        }

    }

    

    if (e.code === 'KeyP') {

        e.preventDefault();

        togglePause();

    }

}

// Handle tap/click input

function handleTap(e) {

    e.preventDefault();

    if (!gamePaused) {

        flap();

    }

}

// Make the bird flap

function flap() {

    if (!gameRunning || gamePaused) return;

    

    bird.velocity = bird.jumpForce;

    if (soundEnabled) flapSound.currentTime = 0, flapSound.play();

}

// Toggle pause state

function togglePause() {

    if (!gameRunning) return;

    

    gamePaused = !gamePaused;

    

    if (gamePaused) {

        backgroundMusic.pause();

        pauseBtn.textContent = '▶';

    } else {

        if (musicEnabled) backgroundMusic.play();

        pauseBtn.textContent = '⏸';

    }

}

// Event listeners for UI

playBtn.addEventListener('click', initGame);

settingsBtn.addEventListener('click', () => {

    mainMenu.style.display = 'none';

    settingsMenu.style.display = 'block';

});

closeSettingsBtn.addEventListener('click', () => {

    settingsMenu.style.display = 'none';

    mainMenu.style.display = 'flex';

});

restartBtn.addEventListener('click', initGame);

menuBtn.addEventListener('click', () => {

    gameOverMenu.style.display = 'none';

    mainMenu.style.display = 'flex';

    backgroundMusic.pause();

});

// Game control buttons

pauseBtn.addEventListener('click', togglePause);

restartGameBtn.addEventListener('click', initGame);

// Toggle switches

soundOn.addEventListener('click', () => {

    soundEnabled = true;

    soundOn.classList.add('active');

    soundOff.classList.remove('active');

});

soundOff.addEventListener('click', () => {

    soundEnabled = false;

    soundOff.classList.add('active');

    soundOn.classList.remove('active');

});

musicOn.addEventListener('click', () => {

    musicEnabled = true;

    musicOn.classList.add('active');

    musicOff.classList.remove('active');

    if (gameRunning && !gamePaused) {

        backgroundMusic.play();

    }

});

musicOff.addEventListener('click', () => {

    musicEnabled = false;

    musicOff.classList.add('active');

    musicOn.classList.remove('active');

    backgroundMusic.pause();

});

// Initialize main menu

mainMenu.style.display = 'flex';