document.addEventListener("DOMContentLoaded", function () {
  const difficultySelect = document.getElementById("difficultySelect");
  const colorSelect = document.getElementById("colorSelect");
  const startBtn = document.getElementById("startBtn");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const timeDisplay = document.getElementById("timeDisplay");
  const playfield = document.getElementById("playfield");

  // Налаштування складності: час на клік (мс) і розмір квадрата (px)
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

  // Обробник натискання кнопки Start
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

  function startGame() {
    // Забороняємо зміну налаштувань під час гри
    startBtn.disabled = true;
    difficultySelect.disabled = true;
    colorSelect.disabled = true;

    gameActive = true;
    score = 0;
    updateScore();

    // Створюємо квадрат, якщо його ще немає
    if (!pixelElement) {
      pixelElement = document.createElement("div");
      pixelElement.classList.add("pixel");
      playfield.appendChild(pixelElement);

      pixelElement.addEventListener("click", handlePixelClick);
    }

    // Задаємо колір квадрата
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

    // Скидаємо старий таймер, якщо був
    if (timerId !== null) {
      clearInterval(timerId);
    }

    // Кожні 100 мс оновлюємо час
    timerId = setInterval(function () {
      if (!gameActive) return;
      timeLeftMs -= 100;

      if (timeLeftMs <= 0) {
        timeLeftMs = 0;
        updateTimeDisplay();
        if (waitingForClick) {
          // Не встиг клікнути — програш
          endGame();
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

  function handlePixelClick() {
    if (!gameActive || !waitingForClick) return;

    waitingForClick = false;

    // Нараховуємо бали (можна по-різному, тут: залишок часу / 100)
    const gained = Math.max(1, Math.floor(timeLeftMs / 100));
    score += gained;
    updateScore();

    // Починаємо новий раунд
    startNewRound();
  }

  function updateScore() {
    scoreDisplay.textContent = "score: " + score;
  }

  function updateTimeDisplay() {
    // показуємо секунди з округленням до цілого
    const secondsLeft = Math.ceil(timeLeftMs / 1000);
    timeDisplay.textContent = "time left for click: " + secondsLeft;
  }

  function endGame() {
    gameActive = false;
    waitingForClick = false;

    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }

    // Ховаємо квадрат
    if (pixelElement) {
      pixelElement.style.display = "none";
    }

    alert("You lost! Refresh the page to restart.");
    timeDisplay.textContent = "You lost! Refresh the page to restart.";

    // Блокуємо все, як у відео (щоб реально треба було оновити сторінку)
    startBtn.disabled = true;
    difficultySelect.disabled = true;
    colorSelect.disabled = true;
  }
});

