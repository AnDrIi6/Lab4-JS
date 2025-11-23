document.addEventListener("DOMContentLoaded", function () {
  const difficultySelect = document.getElementById("difficultySelect");
  const colorSelect = document.getElementById("colorSelect");
  const startBtn = document.getElementById("startBtn");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const timeDisplay = document.getElementById("timeDisplay");
  const playfield = document.getElementById("playfield");

  // Налаштування складності
  const difficultySettings = {
    easy:   { timeLimit: 1500, size: 60 },
    medium: { timeLimit: 1000, size: 40 },
    hard:   { timeLimit: 600,  size: 30 }
  };

  let gameActive = false;
  let pixelElement = null;
  let timerId = null;
  let timeLeftMs = 0;
  let score = 0;
  let currentSettings = null;
  let currentColor = "red";
  let waitingForClick = false;

  // старт
  startBtn.addEventListener("click", function () {
    const difficulty = difficultySelect.value;
    const color = colorSelect.value;

    if (!difficulty || !color) {
      alert("Please choose both difficulty and color.");
      return;
    }

    currentSettings = difficultySettings[difficulty];
    currentColor = color;

    startGame();
  });

  // ❗ промах по полю = програш
  playfield.addEventListener("click", function (e) {
    if (!gameActive) return;

    // якщо клік по квадрату — не рахуємо як промах
    if (e.target === pixelElement) return;

    endGame("You missed the pixel! Refresh to restart.");
  });

  function startGame() {
    startBtn.disabled = true;
    difficultySelect.disabled = true;
    colorSelect.disabled = true;

    gameActive = true;
    score = 0;
    updateScore();

    if (!pixelElement) {
      pixelElement = document.createElement("div");
      pixelElement.classList.add("pixel");
      playfield.appendChild(pixelElement);

      pixelElement.addEventListener("click", handlePixelClick);
    }

    pixelElement.style.display = "block";
    pixelElement.style.backgroundColor = currentColor;

    startNewRound();
  }

  function startNewRound() {
    if (!gameActive) return;

    waitingForClick = true;
    timeLeftMs = currentSettings.timeLimit;

    setPixelSize();
    movePixelRandomly();
    updateTimeDisplay();

    if (timerId !== null) {
      clearInterval(timerId);
    }

    timerId = setInterval(function () {
      if (!gameActive) return;

      timeLeftMs -= 100;

      if (timeLeftMs <= 0) {
        timeLeftMs = 0;
        updateTimeDisplay();

        if (waitingForClick) {
          endGame("Too slow! Refresh to restart.");
        }
      } else {
        updateTimeDisplay();
      }
    }, 100);
  }

  function setPixelSize() {
    const size = currentSettings.size;
    pixelElement.style.width = size + "px";
    pixelElement.style.height = size + "px";
  }

  function movePixelRandomly() {
    const rect = playfield.getBoundingClientRect();
    const size = currentSettings.size;

    const maxX = rect.width - size;
    const maxY = rect.height - size;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    pixelElement.style.left = randomX + "px";
    pixelElement.style.top = randomY + "px";
  }

  function handlePixelClick(event) {
    if (!gameActive || !waitingForClick) return;

    event.stopPropagation();
    waitingForClick = false;

    score += 1;
    updateScore();

    startNewRound();
  }

  function updateScore() {
    scoreDisplay.textContent = "score: " + score;
  }

  function updateTimeDisplay() {
    const secondsLeft = Math.ceil(timeLeftMs / 1000);
    timeDisplay.textContent = "time left for click: " + secondsLeft;
  }

  function endGame(message) {
    if (!gameActive) return;

    gameActive = false;
    waitingForClick = false;

    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }

    if (pixelElement) {
      pixelElement.style.display = "none";
    }

    alert(message);
    timeDisplay.textContent = "You lost! Refresh the page to restart.";

    startBtn.disabled = true;
    difficultySelect.disabled = true;
    colorSelect.disabled = true;
  }
});
