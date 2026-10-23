
const tiles = document.querySelectorAll(".tile");
const startButton = document.querySelector("#start");
const levelText = document.querySelector("#level");
const bestText = document.querySelector("#best");
const message = document.querySelector("#message");

let sequence = [];
let playerSequence = [];
let level = 0;
let best = Number(localStorage.getItem("memoryBest")) || 0;
let acceptingInput = false;
let gameToken = 0;

let audioContext;
let lives = 3;
const livesText = document.querySelector("#lives");
function playSound(frequency, duration = 0.15, type = "sine") {
  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    audioContext ??= new AudioContextClass();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.12, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn("Audio is unavailable:", error);
  }
}

function playWinSound() {
  playSound(523.25);
  setTimeout(() => playSound(659.25), 120);
  setTimeout(() => playSound(783.99), 240);
}

function playGameOverSound() {
  playSound(392, 0.2);
  setTimeout(() => playSound(311, 0.25), 180);
  setTimeout(() => playSound(233, 0.4), 380);
}

bestText.textContent = best;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateLives() {
  livesText.textContent =
    "❤️".repeat(lives) + "🤍".repeat(3 - lives);
}


async function flashTile(index) {
  const frequencies = [ 261.63, // Pink — C4
    293.66, // Purple — D4
    329.63, // Yellow — E4
    349.23, // Green — F4
    392.00, // Blue — G4
    440.00, // Orange — A4
    493.88, 
    523.25 ];

  playSound(frequencies[index]);

  tiles[index].classList.add("lit");
  await sleep(450);
  tiles[index].classList.remove("lit");
  await sleep(180);
}


async function showSequence(token) {
  acceptingInput = false;
  message.textContent = "Watch carefully... 👀";

  await sleep(600);

  for (const index of sequence) {
    if (token !== gameToken) return;
    await flashTile(index);
  }

  if (token !== gameToken) return;

  message.textContent = "Your turn! ✨";
  acceptingInput = true;
}

async function nextRound() {
  level++;
  levelText.textContent = level;

  playerSequence = [];
  sequence.push(Math.floor(Math.random() * tiles.length));

  await showSequence(gameToken);
}

function startGame() {
  gameToken++;
  sequence = [];
  playerSequence = [];
  level = 0;
  lives = 3;
updateLives();
  levelText.textContent = level;
  startButton.textContent = "Restart Game";
  nextRound();
}


function gameOver() {
  acceptingInput = false;
  playGameOverSound();

  const newRecord = level > best;

  if (newRecord) {
    best = level;
    localStorage.setItem("memoryBest", best);
    bestText.textContent = best;
  }

  message.innerHTML = `
    <span class="game-over-icon">🌸</span>
    <span class="game-over-title">Game Over!</span>
    <span class="game-over-score">
      You reached level ${level}
    </span>
    <span class="game-over-record">
      ${newRecord ? "✨ New best score!" : "Ready for another try?"}
    </span>
  `;

  message.classList.remove("game-over");
  void message.offsetWidth;
  message.classList.add("game-over");

  startButton.textContent = "Play Again 💗";
}


tiles.forEach((tile, index) => {
  tile.addEventListener("click", async () => {
    if (!acceptingInput) return;

    acceptingInput = false;

    const token = gameToken;
    await flashTile(index);

    if (token !== gameToken) return;

    playerSequence.push(index);

    const position = playerSequence.length - 1;

    
if (playerSequence[position] !== sequence[position]) {
  lives--;
  updateLives();

  if (lives <= 0) {
    gameOver();
    return;
  }

  playerSequence = [];

  message.textContent =
    `Oops! ${lives} ${lives === 1 ? "life" : "lives"} left! Watch again 👀`;

  await sleep(1000);

  if (token === gameToken) {
    await showSequence(token);
  }

  return;
}


    
if (playerSequence.length === sequence.length) {
  acceptingInput = false;
  message.textContent = "Perfect! 🌷";
  playWinSound();

  await sleep(700);

  if (token === gameToken) {
    nextRound();
  }
}
 else {
      acceptingInput = true;
    }
  });
});

startButton.addEventListener("click", startGame);
