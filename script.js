document.addEventListener("DOMContentLoaded", function () {
  const difficultySelect = document.getElementById("difficultySelect");
  const colorSelect = document.getElementById("colorSelect");
  const startBtn = document.getElementById("startBtn");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const timeDisplay = document.getElementById("timeDisplay");
  const playfield = document.getElementById("playfield");
  const messageDisplay = document.getElementById("messageDisplay");

  // Налаштування складності: час на клік (мс) і розмір квадрата (px)
  const difficultySettings = {
    easy:   { timeLimit: 1500, size: 60 },
    medium: { timeLimit: 1000, size: 40 },
    hard:   { timeLimit: 600,  size: 30 }
  };

  const successMessages = [
    "Nice! 🎯",
    "Godlike reflexes 😈",
    "Pixel is scared of you 😱",
    "GG, ez click 😎",
    "You’re built different 💪"
  ];

  const failMessages = [
    "Pixel 1 : 0 You 💀",
    "Too slow, my friend… 🐌",
    "Did the pixel just dodge you? 😂",
    "Alt+F4 рефлекси сьогодні 😅",
    "Mouse: 1000 DPI, aim: 0% 🤡"
  ];

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

  // Клік по полю: якщо промахнулися повз квадрат — програш
  playfield.addEventListener("click", function (e) {
    if (!gameActive) return;

    // Якщо клік був саме по квадрату, цим нехай займається обробник пікселя
    if (e.target === pixelElement) return;

    // Промах
    endGame("Missed the pixel! ❌ " + getRandomItem(failMessages));
  });

  function startGame() {
    startBtn.disabled = true;
    difficultySelect.disabled = true;
    colorSelect.disabled = true;

    gameActive = true;
    score = 0;
    updateScore();
    showMessage("Game started! Try to keep up… 😏", "info");

    // Створюємо квадрат, якщо його ще немає
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

    // Скидаємо старий таймер, якщо був
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
          // Не встиг клікнути — програш
          endGame("Too late! ⏱ " + getRandomItem(failMessages));
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

    // Щоб клік по квадрату не вважався промахом у обробнику поля
    event.stopPropagation();

    waitingForClick = false;

    // Нараховуємо бали: базово 1 + бонус за швидкість
    // чим більше часу залишилось, тим більший бонус
    const base = 1;
    const bonus = Math.max(0, Math.floor(timeLeftMs / 150));
    const gained = base + bonus;

    score += gained;
    updateScore();

    showMessage(
      getRandomItem(successMessages) + ` (+${gained} score)`,
      "success"
    );

    startNewRound();
  }

  function updateScore() {
    scoreDisplay.textContent = "score: " + score;
  }

  function updateTimeDisplay() {
    const secondsLeft = Math.ceil(timeLeftMs / 1000);
    timeDisplay.textContent = "time left for click: " + secondsLeft;
  }

  function endGame(reasonText) {
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

    showMessage(reasonText, "error");
    alert(reasonText + "\nYou lost! Refresh the page to restart.");
    timeDisplay.textContent = "You lost! Refresh the page to restart.";

    startBtn.disabled = true;
    difficultySelect.disabled = true;
    colorSelect.disabled = true;
  }

  function showMessage(text, type) {
    messageDisplay.textContent = text;

    switch (type) {
      case "success":
        messageDisplay.style.color = "green";
        break;
      case "error":
        messageDisplay.style.color = "red";
        break;
      default:
        messageDisplay.style.color = "black";
    }
  }

  function getRandomItem(arr) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }
});
