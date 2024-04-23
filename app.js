const game = {
  startButton: document.querySelector(".game__button"),
  scoreElem: document.querySelector(".game__score"),
  board: document.querySelector(".game__board"),
  candies: ["Blue", "Green", "Orange", "Purple", "Red", "Yellow"],
  width: 8,
  isDragging: false,
  selectedCandy: null,
  selectedCandyIndex: null,
  randomCandies: [],
  gameStarted: false,
  score: 0,

  isMobileDevice: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  addMovesEvent: (card, candy, index) => {
    if (game.isMobileDevice()) {
      game.setCardMoves(card, candy, index);
    } else {
      game.setCardsClick(card, candy, index);
    }
  },

  setCardMoves: (card, candy, index) => {
    card.addEventListener(
      "touchstart",
      (e) => game.touchStart(e, candy, index),
      {
        passive: false,
      }
    );
    card.addEventListener("touchmove", (e) => game.touchMove(e, card), {
      passive: false,
    });
    card.addEventListener("touchend", (e) => game.touchEnd(e, card, index));
  },

  // web mobile moves
  touchStart: (e, candy, index) => {
    e.preventDefault();
    isDragging = true;
    game.selectedCandyIndex = index;
    game.selectedCandy = candy;
  },

  touchMove: (e, card) => {
    e.preventDefault();
    if (isDragging) {
      const touch = e.touches[0];
      const offsetX = touch.clientX - card.getBoundingClientRect().left;
      const offsetY = touch.clientY - card.getBoundingClientRect().top;

      card.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
  },

  touchEnd: (e, card) => {
    const touchX = e.changedTouches[0].clientX;
    const touchY = e.changedTouches[0].clientY;

    // Calcula a posição do toque em relação ao elemento do jogo
    const rect = game.board.getBoundingClientRect();
    const offsetX = touchX - rect.left;
    const offsetY = touchY - rect.top;

    // Calcula a posição da peça do jogo com base nas coordenadas do toque
    const column = Math.floor(offsetX / (game.board.offsetWidth / game.width));
    const row = Math.floor(offsetY / (game.board.offsetHeight / game.width));

    // Calcula o índice da peça do jogo com base na linha e coluna
    const index = row * game.width + column;

    game.dragDrop(index);
    isDragging = false;
    card.style.transform = "";
  },

  findIndexByCoordinates: (offsetX, offsetY) => {
    // Calcula a posição da peça do jogo com base nas coordenadas do toque
    const column = Math.floor(offsetX / (game.board.offsetWidth / game.width));
    const row = Math.floor(offsetY / (game.board.offsetHeight / game.width));

    // Calcula o índice da peça do jogo com base na linha e coluna
    const index = row * game.width + column;

    // Retorna o índice da peça do jogo
    return index;
  },

  preventScroll: (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
  },

  getrandomCandies: () => {
    for (let i = 0; i < game.width * game.width; i++) {
      const randomCandy =
        game.candies[Math.floor(Math.random() * game.candies.length)];
      game.randomCandies.push(randomCandy);
    }
  },

  createBoard: () => {
    game.getrandomCandies();

    game.randomCandies.forEach((candy, index) => {
      const card = document.createElement("img");
      card.classList.add("game__card");
      card.setAttribute("id", index);
      card.setAttribute("src", "./images/" + candy + ".png");
      card.setAttribute("draggable", true);
      card.setAttribute("alt", candy);
      game.board.append(card);

      // Event listeners for cards
      game.addMovesEvent(card, candy, index);
    });

    // Event listener for start button
    game.startButton.addEventListener("click", game.startButtonClickHandler);
  },

  startButtonClickHandler: () => {
    if (!game.gameStarted) {
      game.board.addEventListener(
        "touchmove",
        (e) => {
          e.preventDefault();
        },
        { passive: false }
      );
      game.startGame();
    }
    game.startButton.disabled = true;
  },

  startGame: () => {
    // console.log("Game started");
    game.gameStarted = true;
    window.setInterval(() => {
      game.crushCandies();
      game.slideDown();
      game.getNewCandies();
    }, 300);
  },

  crushCandies: () => {
    game.crushFive();
    game.crushFour();
    game.crushThree();
  },

  updateBoard: () => {
    const cards = document.querySelectorAll(".game__card");
    cards.forEach((card, index) => {
      const candy = game.randomCandies[index];

      if (candy === "") {
        card.setAttribute("src", "./images/blank.png");
      } else {
        card.setAttribute("src", "./images/" + candy + ".png");
      }
      card.setAttribute("alt", candy);
    });
  },

  // Checking for matches
  checkValidSlide: () => {
    for (let i = 0; i < game.width * game.width; i++) {
      if (i % game.width < game.width - 2) {
        // check horizontal combinations
        if (
          game.randomCandies[i] !== "" &&
          game.randomCandies[i] === game.randomCandies[i + 1] &&
          game.randomCandies[i + 1] === game.randomCandies[i + 2]
        ) {
          return true;
        }
      }

      if (i < game.width * (game.width - 2)) {
        // check vertical combinations
        if (
          game.randomCandies[i] !== "" &&
          game.randomCandies[i] === game.randomCandies[i + game.width] &&
          game.randomCandies[i + game.width] ===
            game.randomCandies[i + game.width * 2]
        ) {
          return true;
        }
      }
    }

    return false;
  },

  checkCombination: (matrix) => {
    let combinationLength = matrix.length;
    let candiesToCheck = [];

    for (let i = 0; i < combinationLength; i++) {
      candiesToCheck.push(game.randomCandies[matrix[i]]);
    }

    if (game.isCombinationValid(candiesToCheck)) {
      for (let i = 0; i < combinationLength; i++) {
        game.randomCandies[matrix[i]] = "";
      }
      game.score += 30;
      game.slideDown();
      game.updateScore();
    }
  },

  isCombinationValid: (candiesToCheck) => {
    let isValid = true;
    const referenceCandy = candiesToCheck[0];

    for (let i = 0; i < candiesToCheck.length; i++) {
      let candy = candiesToCheck[i];

      if (candy !== referenceCandy) {
        isValid = false;
        break;
      }
    }
    return isValid;
  },

  crushCandies: () => {
    game.crushFive();
    game.crushFour();
    game.crushThree();
  },

  crushThree: () => {
    for (i = 0; i <= 61; i++) {
      let row = [i, i + 1, i + 2];
      let col = [i, i + game.width, i + game.width * 2];

      game.checkCombination(row);
      game.checkCombination(col);
    }
    game.updateBoard();
  },

  crushFour: () => {
    for (i = 0; i <= 60; i++) {
      let row = [i, i + 1, i + 2, i + 3];
      let col = [i, i + game.width, i + game.width * 2, i + game.width * 3];

      game.checkCombination(row);
      game.checkCombination(col);
    }
    game.updateBoard();
  },

  crushFive: () => {
    for (i = 0; i <= 59; i++) {
      let row = [i, i + 1, i + 2, i + 3, i + 4];
      let col = [
        i,
        i + game.width,
        i + game.width * 2,
        i + game.width * 3,
        i + game.width * 4,
      ];

      game.checkCombination(row);
      game.checkCombination(col);
    }
    game.updateBoard();
  },

  getNewCandies: () => {
    for (let i = 0; i < game.width; i++) {
      if (game.randomCandies[i] === "") {
        const randomcandy =
          game.candies[Math.floor(Math.random() * game.candies.length)];
        game.randomCandies[i] = randomcandy;
      }
    }
    game.updateBoard();
  },

  slideDown: () => {
    for (let i = 0; i < game.width * game.width - game.width; i++) {
      if (game.randomCandies[i + game.width] === "") {
        const temp = game.randomCandies[i];
        game.randomCandies[i] = game.randomCandies[i + game.width];
        game.randomCandies[i + game.width] = temp;
      }
    }

    game.updateBoard();
  },

  updateScore: () => {
    game.scoreElem.textContent = `Score: ${game.score}`;
  },

  // move cards
  setCardsClick: (card, candy, index) => {
    card.addEventListener("dragstart", () => game.dragStart(candy, index));
    card.addEventListener("dragover", (e) => game.dragOver(e));
    card.addEventListener("dragenter", (e) => game.dragEnter(e));
    card.addEventListener("dragleave", () => game.dragLeave());
    card.addEventListener("dragend", () => game.dragEnd());
    card.addEventListener("drop", () => game.dragDrop(index));
  },

  dragStart: (candy, index) => {
    game.selectedCandyIndex = index;
    game.selectedCandy = candy;
    console.log(game.selectedCandy, game.selectedCandyIndex);
  },

  dragOver: (e) => {
    e.preventDefault();
  },

  dragEnter: (e) => {
    e.preventDefault();
  },

  dragLeave: () => {},

  dragEnd: (candy, index) => {
    game.updateBoard();
    // cleaning variables
    game.selectedCandy = null;
    game.selectedCandyIndex = null;
  },

  dragDrop: (index) => {
    if (game.selectedCandy !== null) {
      let validMoves = [
        index - 1,
        index - game.width,
        index + 1,
        index + game.width,
      ];
      if (
        validMoves.includes(game.selectedCandyIndex) &&
        game.randomCandies[index] !== ""
      ) {
        // temporarily swap candies
        const tempIndex = game.randomCandies[game.selectedCandyIndex];
        game.randomCandies[game.selectedCandyIndex] = game.randomCandies[index];
        game.randomCandies[index] = tempIndex;

        // check if the swap results in a valid move
        if (game.checkValidSlide()) {
          game.crushCandies();
          game.updateBoard();
        } else {
          // revert the swap if it's not a valid move
          game.randomCandies[index] =
            game.randomCandies[game.selectedCandyIndex];
          game.randomCandies[game.selectedCandyIndex] = tempIndex;
        }
      }
    }
  },
};

game.createBoard();
