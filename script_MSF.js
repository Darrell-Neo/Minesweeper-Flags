"use strict";

///////////////////////////////////////////////////////////////////
// Starting variables
const columnList = "ABCDEFGHIJKLMNOP";
const board = [];
let mines = [];
// const mines = [
//   "A10",
//   "A11",
//   "A13",
//   "A9",
//   "B1",
//   "B12",
//   "B9",
//   "C13",
//   "C14",
//   "C15",
//   "C7",
//   "D1",
//   "D10",
//   "D12",
//   "D4",
//   "E11",
//   "E14",
//   "E15",
//   "E4",
//   "E5",
//   "E9",
//   "F5",
//   "G1",
//   "G15",
//   "G2",
//   "G5",
//   "H10",
//   "H2",
//   "I8",
//   "J15",
//   "J3",
//   "J6",
//   "K0",
//   "K3",
//   "K5",
//   "L10",
//   "M15",
//   "M4",
//   "M5",
//   "M9",
//   "N15",
//   "N2",
//   "N5",
//   "N9",
//   "O1",
//   "O14",
//   "O9",
//   "P0",
//   "P3",
//   "P4",
//   "P8",
// ];
const answerNums = [];
let answer = [];
let gameState = [];
let openedCellsList = [];
let toOpenIsland = [];

///////////////////////////////////////////////////////////////////
// Create board of 16 x 16 squares, columns A - P, Rows 0-15
function generateBoard() {
  for (let i = 0; i < 16; i++) {
    let row = [];
    for (let j = 0; j < 16; j++) {
      row.push(columnList[i] + j);
    }
    board.push(row);
  }
}

generateBoard();
console.table(board);

///////////////////////////////////////////////////////////////////
// Generate 51 mines
function generateMines() {
  // Reset mines array
  mines = [];
  // Run this until total number of mines is 51
  while (mines.length < 51) {
    // Generates a random mine in board array
    let singleMine =
      board[Math.floor(Math.random() * 16)][Math.floor(Math.random() * 16)];
    // Add random mine into mines array if it is not already inside
    if (!mines.includes(singleMine)) {
      mines.push(singleMine);
    }
  }
  mines.sort();
}

generateMines();
console.log(mines);

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

// let testCell = "C1";
// console.log(surroundingCells(testCell));

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

// console.log(surroundingMines(testCell));

///////////////////////////////////////////////////////////////////
// Generate answer board (numbers only)
function genAnsNums() {
  for (let i = 0; i < 16; i++) {
    let row = [];
    for (let j = 0; j < 16; j++) {
      row.push(surroundingMines(board[i][j]));
    }
    answerNums.push(row);
  }
}

genAnsNums();
console.table(answerNums);

///////////////////////////////////////////////////////////////////
// Generate answer board (with mines reflected)
function genAns() {
  answer = answerNums;
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      if (mines.includes(board[i][j])) {
        answer[i][j] = "M";
      }
    }
  }
}

genAns();
console.table(answer);

///////////////////////////////////////////////////////////////////
// Reset game state
function resetBoard() {
  gameState = board;
}

resetBoard();
console.table(gameState);

///////////////////////////////////////////////////////////////////
// Open a cell
function columnIndex(inputCell) {
  return columnList.indexOf(inputCell.substring(0, 1));
}

function openCell(inputCell) {
  if (
    openedCellsList.length === 0 &&
    answer[columnIndex(inputCell)][rowOf(inputCell)] === "M"
  ) {
    window.alert("Oh no, you opened a mine at the start, restarting...");
    document.location.reload(false);
  }
  gameState[columnIndex(inputCell)][rowOf(inputCell)] =
    answer[columnIndex(inputCell)][rowOf(inputCell)];
  document.querySelector("#" + inputCell).innerText =
    gameState[columnIndex(inputCell)][rowOf(inputCell)];
  if (!openedCellsList.includes(inputCell)) {
    openedCellsList.push(inputCell);
  }
}

// openCell("D1");
// console.table(gameState);

///////////////////////////////////////////////////////////////////
// If opened cell is a 0, to expand the island around it
function openIsland(inputCell) {
  if (answer[columnIndex(inputCell)][rowOf(inputCell)] === 0) {
    for (const item of surroundingCells(inputCell)) {
      if (
        answer[columnIndex(item)][rowOf(item)] === 0 &&
        !openedCellsList.includes(item)
      ) {
        toOpenIsland.push(columnOf(item) + rowOf(item));
      }
      // for (const item2 of surroundingCells(item)) {
      //   openCell(item2);
      // }
      openCell(item);
    }
  }
  openCell(inputCell);
  console.table(gameState);
  if (
    openedCellsList.length > 1 &&
    answer[columnIndex(inputCell)][rowOf(inputCell)] === "M"
  ) {
    window.alert(
      `Game over! \nYou took ${
        document.getElementById("timer").innerText
      } and lost`
    );
    clearInterval(timerVar);
    endGame();
  }
}

// openIsland("G7");
// console.table(gameState);
// console.log(openedCellsList);
// console.log(toOpenIsland);
// console.log(toOpenIsland.length);
// console.table(gameState);

///////////////////////////////////////////////////////////////////
// Make move
function makeMove(inputCell) {
  openIsland(inputCell);

  while (toOpenIsland.length > 0) {
    openIsland(toOpenIsland[0]);
    // console.table(gameState);
    // console.log(openedCellsList);
    toOpenIsland.shift();
    // console.log(toOpenIsland);
    // console.log(toOpenIsland.length);
  }
}

// makeMove("A5");
// console.table(gameState);

///////////////////////////////////////////////////////////////////
// Get move input

// const playerMove = document.querySelector("#move").value;
// console.log(playerMove);

// function getMoveHTML(e) {
//   e.preventDefault();
//   let item = document.querySelector("#move").value;
//   makeMove(item);
// }

// document.querySelector("#submit-btn").addEventListener("click", getMoveHTML);

///////////////////////////////////////////////////////////////////
// End game - reveal all mines
function endGame() {
  for (const item of mines) {
    openCell(item);
  }
}

///////////////////////////////////////////////////////////////////
// Set up html
function generateInputButtons() {
  for (let i = 0; i < 16; i++) {
    let row = document.createElement("div");
    row.setAttribute("class", "row");
    for (let j = 0; j < 16; j++) {
      let button = document.createElement("div");
      button.setAttribute("class", "square");
      button.setAttribute("id", board[i][j]);
      // button.innerText = board[i][j];
      row.append(button);
    }
    document.querySelector(".container").append(row);
  }
}

generateInputButtons();

function getMoveHTML2(e) {
  e.preventDefault();
  makeMove(e.target.id);
}

function refreshPage() {
  document.location.reload();
}

document.querySelector(".container").addEventListener("click", getMoveHTML2);
document.querySelector("#refresh").addEventListener("click", refreshPage);

///////////////////////////////////////////////////////////////////
// Timer
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
