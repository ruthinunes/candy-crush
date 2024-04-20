const game = {
  startButton: document.querySelector(".game__button"),
  scoreElem: document.querySelector(".game__score"),
  board: document.querySelector(".game__board"),
  candies: ["Blue", "Green", "Orange", "Purple", "Red", "Yellow"],
  width: 8,
  selectedCandy: null,
  selectedCandyIndex: null,
  randomCandies: [],
  gameStarted: false,
  score: 0,

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
      game.setCardsClick(card, candy, index);
    });

    // Event listener for start button
    game.startButton.addEventListener("click", game.startButtonClickHandler);
  },

  startButtonClickHandler: () => {
    if (!game.gameStarted) {
      game.startGame();
    }
    game.startButton.disabled = true;
  },

  startGame: () => {
    console.log("Game started");
    game.gameStarted = true;
    window.setInterval(() => {
      game.crushCandies();
      game.slideDown();
      game.generateNewCandies();
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

  checkCombinationGeneric: (matrix) => {
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

  crushThree: () => {
    for (i = 0; i <= 61; i++) {
      let row = [i, i + 1, i + 2];
      let col = [i, i + game.width, i + game.width * 2];

      game.checkCombinationGeneric(row);
      game.checkCombinationGeneric(col);
    }
    game.updateBoard();
  },

  crushFour: () => {
    for (i = 0; i <= 60; i++) {
      let row = [i, i + 1, i + 2, i + 3];
      let col = [i, i + game.width, i + game.width * 2, i + game.width * 3];

      game.checkCombinationGeneric(row);
      game.checkCombinationGeneric(col);
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

      game.checkCombinationGeneric(row);
      game.checkCombinationGeneric(col);
    }
    game.updateBoard();
  },

  crushCandies: () => {
    game.crushFive();
    game.crushFour();
    game.crushThree();
  },

  generateNewCandies: () => {
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
    game.selectedcandyIndex = index;
    game.selectedcandy = candy;
  },

  dragOver: (e) => {
    e.preventDefault();
  },

  dragEnter: (e) => {
    e.preventDefault();
  },

  dragLeave: () => {},

  dragEnd: () => {
    game.updateBoard();
    // cleaning variables
    game.selectedcandy = null;
    game.selectedcandyIndex = null;
  },

  dragDrop: (index) => {
    if (game.selectedcandy !== null) {
      let validMoves = [
        index - 1,
        index - game.width,
        index + 1,
        index + game.width,
      ];

      if (
        validMoves.includes(game.selectedcandyIndex) &&
        game.randomCandies[index] !== ""
      ) {
        // temporarily swap candies
        const tempIndex = game.randomCandies[game.selectedcandyIndex];
        game.randomCandies[game.selectedcandyIndex] = game.randomCandies[index];
        game.randomCandies[index] = tempIndex;

        // check if the swap results in a valid move
        if (game.checkValidSlide()) {
          game.crushCandies();
          game.updateBoard();
        } else {
          // revert the swap if it's not a valid move
          game.randomCandies[index] =
            game.randomCandies[game.selectedcandyIndex];
          game.randomCandies[game.selectedcandyIndex] = tempIndex;
        }
      }
    }
  },
};

game.createBoard();
