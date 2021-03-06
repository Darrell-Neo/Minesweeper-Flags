"use strict";

///////////////////////////////////////////////////////////////////
// Starting variables
const columnList = "ABCDEFGHIJKLMNOP"; // Standard 16 by 16 board for Minesweeper Flags
const minesNumber = 51; // Standard number of mines for Minesweeper Flags
const board = [];
let mines = [];
let answerNums = [];
let answer = [];
let openedCellsList = [];
let toOpenIsland = [];
let redFlagList = [];
let blueFlagList = [];
let redScore = 0;
let blueScore = 0;
let turnPlayer = "Red";
let redBombToggle = false;
let blueBombToggle = false;
let aiToggle = false;
let aiPossibleMoves = [];

// Sample mines array to test for 5-8 surrounding mines
// ["A0","A1","A2","B0","B2","C0","C1","C2","D0","D2","E0","E2","F0","F2","G2",]

// Sample mines array for testing
// ["A10","A11","A13","A9","B1","B12","B9","C13","C14","C15","C7","D1","D10","D12","D4","E11","E14","E15","E4","E5","E9","F5","G1","G15","G2","G5","H10","H2","I8","J15","J3","J6","K0","K3","K5","L10","M15","M4","M5","M9","N15","N2","N5","N9","O1","O14","O9","P0","P3","P4","P8",];

///////////////////////////////////////////////////////////////////
// Create board of 16 x 16 squares, columns A - P, Rows 0-15, and separate array of all possible AI moves
function generateBoard() {
  for (let i = 0; i < columnList.length; i++) {
    let row = [];
    for (let j = 0; j < columnList.length; j++) {
      row.push(columnList[i] + j);
      aiPossibleMoves.push(columnList[i] + j);
    }
    board.push(row);
  }
}

generateBoard();
// console.table(board);

///////////////////////////////////////////////////////////////////
// Generate 51 mines
function generateMines() {
  // Reset mines array
  mines = [];
  // Run this until total number of mines is 51
  while (mines.length < minesNumber) {
    // Generates a random mine in board array
    let singleMine =
      board[Math.floor(Math.random() * 16)][Math.floor(Math.random() * 16)];
    // Add random mine into mines array if it is not already inside
    if (!mines.includes(singleMine)) {
      mines.push(singleMine);
    }
  }
  // Sort for ease of reference
  mines.sort();
}

generateMines();
// console.log(mines);

///////////////////////////////////////////////////////////////////
// Return array of surrounding cells
function columnBefore(inputCell) {
  return columnList[columnList.indexOf(inputCell.substring(0, 1)) - 1];
}
function columnOf(inputCell) {
  return inputCell.substring(0, 1);
}
function columnAfter(inputCell) {
  return columnList[columnList.indexOf(inputCell.substring(0, 1)) + 1];
}
function rowBefore(inputCell) {
  if (parseInt(inputCell.substring(1)) > 0) {
    return parseInt(inputCell.substring(1)) - 1;
  } else {
    return NaN;
  }
}
function rowOf(inputCell) {
  return parseInt(inputCell.substring(1));
}
function rowAfter(inputCell) {
  if (parseInt(inputCell.substring(1)) < 15) {
    return parseInt(inputCell.substring(1)) + 1;
  } else {
    return NaN;
  }
}

function surroundingCells(inputCell) {
  let outputArr = [];
  outputArr.push(columnBefore(inputCell) + rowBefore(inputCell));
  outputArr.push(columnBefore(inputCell) + rowOf(inputCell));
  outputArr.push(columnBefore(inputCell) + rowAfter(inputCell));
  outputArr.push(columnOf(inputCell) + rowBefore(inputCell));
  outputArr.push(columnOf(inputCell) + rowAfter(inputCell));
  outputArr.push(columnAfter(inputCell) + rowBefore(inputCell));
  outputArr.push(columnAfter(inputCell) + rowOf(inputCell));
  outputArr.push(columnAfter(inputCell) + rowAfter(inputCell));

  // Filter columns with NaN
  outputArr = outputArr.filter(Boolean);
  // Filter rows with NaN
  outputArr = outputArr.filter((x) => !x.includes("NaN"));

  return outputArr;
}

///////////////////////////////////////////////////////////////////
// Count if surrounding cells contain mines
function surroundingMines(inputCell) {
  let count = 0;
  for (let item of surroundingCells(inputCell)) {
    if (mines.includes(item)) {
      count += 1;
    }
  }
  return count;
}

///////////////////////////////////////////////////////////////////
// Generate answer board (numbers only)
function genAnsNums() {
  for (let i = 0; i < columnList.length; i++) {
    let row = [];
    for (let j = 0; j < columnList.length; j++) {
      row.push(surroundingMines(board[i][j]));
    }
    answerNums.push(row);
  }
}

genAnsNums();
// console.table(answerNums);

///////////////////////////////////////////////////////////////////
// Generate answer board (with mines reflected)
function genAns() {
  answer = answerNums;
  for (let i = 0; i < columnList.length; i++) {
    for (let j = 0; j < columnList.length; j++) {
      if (mines.includes(board[i][j])) {
        answer[i][j] = "M";
      }
    }
  }
}

genAns();
console.table(answer); // Show answer in console

///////////////////////////////////////////////////////////////////
// Open a cell
function openCell(inputCell) {
  // <For single-player MS only> checkIfFirstMoveMine(inputCell);
  checkMine(inputCell);
  // Only perform the following if it is not a mine
  if (answer[columnIndex(inputCell)][rowOf(inputCell)] != "M") {
    updateBoardArray(inputCell);
    updateBoardHTML(inputCell);
    changeTurn();
  }
  updateOpenedCellList(inputCell);
  updateScore();
}

function columnIndex(inputCell) {
  return columnList.indexOf(inputCell.substring(0, 1));
}

// If opened cell is a mine, flag it and update player scores
function checkMine(inputCell) {
  if (answer[columnIndex(inputCell)][rowOf(inputCell)] === "M") {
    document.querySelector("#" + inputCell).classList.remove("cellBoard");
    if (turnPlayer === "Red") {
      document.querySelector("#" + inputCell).classList.add("cellRedFlag");
      redFlagList.push(inputCell);
      redScore++;
    } else {
      document.querySelector("#" + inputCell).classList.add("cellBlueFlag");
      blueFlagList.push(inputCell);
      blueScore++;
    }
  }
}

// This updates the board array (only for console)
function updateBoardArray(inputCell) {
  board[columnIndex(inputCell)][rowOf(inputCell)] =
    answer[columnIndex(inputCell)][rowOf(inputCell)];
}

// This updates the classes of the square so that it show up on the actual HTML board
function updateBoardHTML(inputCell) {
  document.querySelector("#" + inputCell).removeAttribute("class");
  document.querySelector("#" + inputCell).classList = "square";
  document
    .querySelector("#" + inputCell)
    .classList.add("cell" + board[columnIndex(inputCell)][rowOf(inputCell)]);
}

function changeTurn() {
  if (turnPlayer === "Red") {
    turnPlayer = "Blue";
  } else if (turnPlayer === "Blue") {
    turnPlayer = "Red";
  }
}

// This updates the list of opened cells
function updateOpenedCellList(inputCell) {
  if (!openedCellsList.includes(inputCell)) {
    openedCellsList.push(inputCell);
  }
}

// To update score of each player after every move, and then check if AI needs to move
function updateScore() {
  document.querySelector(".p1-score").innerText = `Score: ${redScore}`;
  document.querySelector(".p2-score").innerText = `Score: ${blueScore}`;
  if (turnPlayer === "Red") {
    document.querySelector(".red-player").style.opacity = "100%";
    document.querySelector(".blue-player").style.opacity = "50%";
  } else if (turnPlayer === "Blue") {
    document.querySelector(".red-player").style.opacity = "50%";
    document.querySelector(".blue-player").style.opacity = "100%";
  }
  winCheck();
  checkAI();
}

// Win screen
function winCheck() {
  if (redScore >= 26) {
    window.alert("Red won!");
    endGame();
  } else if (blueScore >= 26) {
    window.alert("Blue won!");
    endGame();
  }
}

///////////////////////////////////////////////////////////////////
// End game - reveal all remaining unflagged mines and change wrongly flagged mines to red
function endGame() {
  clearInterval(timerVar);
  for (const item of mines) {
    if (!openedCellsList.includes(item)) {
      document.querySelector("#" + item).removeAttribute("class");
      document.querySelector("#" + item).classList = "square";
      document
        .querySelector("#" + item)
        .classList.add("cell" + answer[columnIndex(item)][rowOf(item)]);
    }
  }
}

///////////////////////////////////////////////////////////////////
// If selected cell is a 0, to expand the island around it
function openIsland(inputCell) {
  // If opened cell is a 0
  if (answer[columnIndex(inputCell)][rowOf(inputCell)] === 0) {
    // To loop through the surrounding 8 cells and open them
    for (const item of surroundingCells(inputCell)) {
      // To add in any surrounding cells containing "0" to the pending list of 0s to open
      if (
        answer[columnIndex(item)][rowOf(item)] === 0 &&
        !openedCellsList.includes(item)
      ) {
        toOpenIsland.push(columnOf(item) + rowOf(item));
      }
      openCell(item);
    }
  }
  // To finally open the selected cell
  openCell(inputCell);
}

///////////////////////////////////////////////////////////////////
// Make a move and then clear the pending list of 0s to open
function makeMove(inputCell) {
  if (!openedCellsList.includes(inputCell)) {
    openIsland(inputCell);

    while (toOpenIsland.length > 0) {
      openIsland(toOpenIsland[0]);
      toOpenIsland.shift();
    }
  }
}

///////////////////////////////////////////////////////////////////
// Simple AI - random possible move
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkAI() {
  await sleep(2000);
  if (aiToggle === true && turnPlayer === "Blue") {
    aiMove();
  }
}

function aiMove() {
  let aiPossibleMovesUpdated = [];
  // Updates the possible moves to account for any newly opened cells
  for (const item of aiPossibleMoves) {
    if (!openedCellsList.includes(item)) {
      aiPossibleMovesUpdated.push(item);
    }
  }
  // AI to make a move on a random possible move
  makeMove(
    aiPossibleMovesUpdated[
      Math.floor(Math.random() * aiPossibleMovesUpdated.length)
    ]
  );
}

///////////////////////////////////////////////////////////////////
// Red and blue bombs

// This generates a 5x5 area around the input cell by performing the surrounding cells function twice
function bombArea(inputCell) {
  let bomb_area2 = [];
  let bomb_area1 = surroundingCells(inputCell);
  for (const item of bomb_area1) {
    bomb_area2 = [...bomb_area2, ...surroundingCells(item)];
  }
  const bomb_area2_set = new Set(bomb_area2);
  bomb_area2 = Array.from(bomb_area2_set);
  return bomb_area2;
}

function redBomb(centerCell) {
  for (const inputCell of bombArea(centerCell)) {
    if (!openedCellsList.includes(inputCell)) {
      if (answer[columnIndex(inputCell)][rowOf(inputCell)] == "M") {
        document.querySelector("#" + inputCell).classList.remove("cellBoard");
        document.querySelector("#" + inputCell).classList.add("cellRedFlag");
        redFlagList.push(inputCell);
        redScore++;
      } else if (answer[columnIndex(inputCell)][rowOf(inputCell)] == "0") {
        makeMove(inputCell);
      } else {
        updateBoardArray(inputCell);
        updateBoardHTML(inputCell);
      }
      openedCellsList.push(inputCell);
    }
  }
}

function blueBomb(centerCell) {
  for (const inputCell of bombArea(centerCell)) {
    if (!openedCellsList.includes(inputCell)) {
      if (answer[columnIndex(inputCell)][rowOf(inputCell)] == "M") {
        document.querySelector("#" + inputCell).classList.remove("cellBoard");
        document.querySelector("#" + inputCell).classList.add("cellBlueFlag");
        blueFlagList.push(inputCell);
        blueScore++;
      } else if (answer[columnIndex(inputCell)][rowOf(inputCell)] == "0") {
        makeMove(inputCell);
      } else {
        updateBoardArray(inputCell);
        updateBoardHTML(inputCell);
      }
      openedCellsList.push(inputCell);
    }
  }
}

///////////////////////////////////////////////////////////////////
// End of game logic
///////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
// Set up actual game board on html
function generateHTMLBoard() {
  for (let i = 0; i < columnList.length; i++) {
    let row = document.createElement("div");
    row.setAttribute("class", "row");
    for (let j = 0; j < columnList.length; j++) {
      let button = document.createElement("div");
      button.className = "square cellBoard";
      button.setAttribute("id", board[i][j]);
      row.append(button);
    }
    document.querySelector(".container").append(row);
  }
}

generateHTMLBoard();

///////////////////////////////////////////////////////////////////
// Timer and refresh button
let timerVar = setInterval(countTimer, 1000);
let totalSeconds = 0;

function countTimer() {
  ++totalSeconds;
  let hour = Math.floor(totalSeconds / 3600);
  let minute = Math.floor((totalSeconds - hour * 3600) / 60);
  let seconds = totalSeconds - (hour * 3600 + minute * 60);
  if (minute < 10) minute = "0" + minute;
  if (seconds < 10) seconds = "0" + seconds;
  document.getElementById("timer").innerText =
    hour + ":" + minute + ":" + seconds;
}

function refreshPage() {
  document.location.reload();
}

///////////////////////////////////////////////////////////////////
// Left click

function getMoveHTML(e) {
  e.preventDefault();
  if (turnPlayer === "Red" && redBombToggle === true) {
    redBomb(e.target.id);
    document.querySelector("#red-bomb").src = "Pictures/charmander.png";
    redBombToggle = false;
    turnPlayer = "Blue";
    updateScore();
  } else if (turnPlayer === "Blue" && blueBombToggle === true) {
    blueBomb(e.target.id);
    document.querySelector("#blue-bomb").src = "Pictures/squirtle.png";
    blueBombToggle = false;
    turnPlayer = "Red";
    updateScore();
  } else {
    makeMove(e.target.id);
  }
}

///////////////////////////////////////////////////////////////////
// Toggles for AI or bombs
function toggleAI(e) {
  e.preventDefault();
  if (aiToggle === false) {
    e.target.innerText = "Minesweeper Flags (vs CPU)";
    aiToggle = true;
  } else {
    e.target.innerText = "Minesweeper Flags (vs Player)";
    aiToggle = false;
  }
}

function toggleBombHTML(e) {
  e.preventDefault();
  if (e.target.id === "red-bomb") {
    if (redBombToggle === false) {
      e.target.src = "Pictures/charmanderBomb.png";
      redBombToggle = true;
    } else {
      e.target.src = "Pictures/charmander.png";
      redBombToggle = false;
    }
  }
  if (e.target.id === "blue-bomb") {
    if (blueBombToggle === false) {
      e.target.src = "Pictures/squirtleBomb.png";
      blueBombToggle = true;
    } else {
      e.target.src = "Pictures/squirtle.png";
      blueBombToggle = false;
    }
  }
}

///////////////////////////////////////////////////////////////////
// Event listeners
document.querySelector("#refresh").addEventListener("click", refreshPage);
document.querySelector("#toggle-ai").addEventListener("click", toggleAI);
document.querySelector(".left-bar").addEventListener("click", toggleBombHTML);
document.querySelector(".container").addEventListener("click", getMoveHTML);

///////////////////////////////////////////////////////////////////
// Extra code for single-player minesweeper only
///////////////////////////////////////////////////////////////////

// // <For single-player MS only>
// document.querySelector(".container").addEventListener("contextmenu", rightClick, false);

// // <For single-player MS only>
// // If no cells are opened and first move is a mine, to restart game
// function checkIfFirstMoveMine(inputCell) {
//   if (
//     openedCellsList.length === 0 &&
//     answer[columnIndex(inputCell)][rowOf(inputCell)] === "M"
//   ) {
//     window.alert("Oh no, you opened a mine at the start, restarting...");
//     document.location.reload(false);
//   }
// }

// // <For single-player MS only>
// // Right click toggles between flag and no flag
// function rightClick(e) {
//   e.preventDefault();
//   if (!openedCellsList.includes(e.target.id)) {
//     if (e.target.classList == "square cellBlueFlag") {
//       e.target.classList.remove("cellBlueFlag");
//       e.target.classList.add("cellBoard");
//       blueFlagList.shift(e.target.id);
//     } else {
//       e.target.classList.remove("cellBoard");
//       e.target.classList.add("cellBlueFlag");
//       blueFlagList.push(e.target.id);
//     }
//     console.log(openedCellsList);
//   }
//   return false;
// }
