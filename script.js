//* -----------------------
//* FASE DI PREPARAZIONE
//* -----------------------

// Raccogliamo tutti gli elementi di nostro interesse dalla pagina
const grid = document.querySelector('.grid');
const stackBtn = document.querySelector('.stack');
const scoreCounter = document.querySelector('.score-counter');
const endGameScreen = document.querySelector('.end-game-screen');
const endGameText = document.querySelector('.end-game-text');
const playAgainButton = document.querySelector('.play-again');
const insertCoinBtn = document.querySelector('.insertCoinBtn');

const audioUIU = new Audio("./audio/uiu.mp3");
const audioUHIUUU = new Audio("./audio/uhiuuuu.mp3")
const audioStacker = new Audio("./audio/stacker.mp3");
const audioGameover = new Audio("./audio/gameover.mp3");
const audiostart = new Audio("./audio/p2s.mp3");

// Creiamo la matrice per la nostra griglia
// 0 - grid
// 1 - bar
const gridMatrix = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 0],
];

// Prepariamo delle informazioni necessarie alla logia di gioco
var coinsCounter = document.querySelector('.coins-counter');
var isPressed = false;
let currentRowIndex = gridMatrix.length - 1;
let hasHarderModeStarted = false;
let barDirection = 'right';
let isBlink = false;
let barSize = 3;
let isGameOver = false;
let hasSoundPlayed = false;
let speed = 2000;
let score = 0;
let coins = JSON.parse(localStorage.getItem('coins')) || 0;
coinsCounter.textContent = coins < 10 ? '0' + coins : coins;
let t;

document.getElementById('backgroundSelect').addEventListener('change', function() {
  document.body.style.backgroundImage = "url('images/" + this.value + "')";
});

function stackClickHandler() {
  // controllo se ho vinto o perso
  checkLost();
  if (!isGameOver) checkWin();

  if (isGameOver) return;
  harderMode();

  // Sono arrivato a metà?
  if (currentRowIndex <= 4 && !isBlink) {
    var minorPrizeElement = document.querySelector('.minor-prize');
    minorPrizeElement.classList.add('blink');
    setTimeout(function () {
      minorPrizeElement.classList.remove('blink');
    }, 5000);
    isBlink = true;
    // Riproduci il suono solo una volta
    if (!hasSoundPlayed) {
      audioUHIUUU.play();
      hasSoundPlayed = true;
    }
  } else {
    // Riproduci il suono dopo ogni stack, ma non quando currentRowIndex <= 4
    audioUIU.play();
  }

  // aggiorno il punteggio                                                                                                                                                                          
  updateScore();

  // cambio riga corrente
  // e riparto dalla prima colonna
  currentRowIndex = currentRowIndex - 1;
  barDirection = 'right';

  // disegno la barra
  for (let i = 0; i < barSize; i++) {
    gridMatrix[currentRowIndex][i] = 1;
    audioUIU.play();
  }

  draw();
}

function harderMode() {
  speed /= 1.45;
  clearInterval(t);
  t = setInterval(main, speed);
  draw();
}

// Aggiungi un gestore di eventi al pulsante per inserire una moneta
insertCoinBtn.addEventListener('click', () => {
  // Ottieni il numero corrente di monete
  var currentCoins = parseInt(coinsCounter.textContent, 10);

  // Incrementa il numero di monete
  currentCoins++;

  // Aggiorna il contatore di monete
  coinsCounter.textContent = currentCoins < 10 ? '0' + currentCoins : currentCoins;

  // Aggiorna il numero di monete
  coins = currentCoins;

  // Riproduci l'audio "p2s.mp3" quando l'utente preme il pulsante
  audiostart.play();

  // Avvia il gioco dopo aver inserito una moneta
  main();
});

function draw() {
  grid.innerHTML = '';

  gridMatrix.forEach(function (rowContent, rowIndex) {
    rowContent.forEach(function (cellContent, cellIndex) {
      // Creiamo una cella
      const cell = document.createElement('div');
      cell.classList.add('cell');

      // Stile scacchiera
      const isRowEven = rowIndex % 2 === 0;
      const isCellEven = cellIndex % 2 === 0;

      if ((isRowEven && isCellEven) || (!isRowEven && !isCellEven)) {
        cell.classList.add('cell-dark');
      }

      // La cella è parte della barra
      if (cellContent === 1) {
        cell.classList.add('bar');
      }

      // Inseriamola nella griglia
      grid.appendChild(cell);
    });
  });
}

function moveRight(row) {
  row.pop();
  row.unshift(0);
}

function moveLeft(row) {
  row.shift();
  row.push(0);
}

function isRightEdge(row) {
  const lastElement = row[row.length - 1];
  return lastElement === 1;
}

function isLeftEdge(row) {
  const firstElement = row[0];
  return firstElement === 1;
}

function moveBar() {
  if (isGameOver) {
    return;
  }
  const currentRow = gridMatrix[currentRowIndex];

  if (barDirection === 'right') {
    moveRight(currentRow);
    if (isRightEdge(currentRow)) {
      barDirection = 'left';
    }
  } else if (barDirection === 'left') {
    moveLeft(currentRow);
    if (isLeftEdge(currentRow)) {
      barDirection = 'right';
    }
  }
}

function checkLost() {
  // salvo in variabile un riferimento
  // alla riga corrente e alla riga precedente
  const currentRow = gridMatrix[currentRowIndex];
  const prevRow = gridMatrix[currentRowIndex + 1];

  // se non esiste una riga precedente (inizio gioco)
  // allo esco dalla funzione
  if (!prevRow) return;

  // controllo se sotto ogni elemento della barra
  // esiste almeno un elemento dello stack accumulato
  for (let i = 0; i < currentRow.length; i++) {
    // se sotto un elemento della barra
    // non c'è un elemento dello stack accumulato
    if (currentRow[i] === 1 && prevRow[i] === 0) {
      // rimuovo il pezzo della barra
      // e la accorcio di un elemento
      currentRow[i] = 0;
      barSize--;

      // se la barra non ha più elementi
      // hai perso il gioco!
      if (barSize === 0) {
        isGameOver = true;
        clearInterval(t);
        endGame(false);
      }
    }
  }
}

function checkWin() {
  if (currentRowIndex === 0) {
    isGameOver = true;
    clearInterval(t);
    endGame(true);
  }
}

function updateScore() {
  // Se currentRowIndex è minore o uguale a 4, raddoppia il punteggio
  if (currentRowIndex <= 4) {
    score *= 2;
  } else {
    score++;
  }
  scoreCounter.innerText = String(score).padStart(5, '0');

  // punteggio basato sui blocchi rimanenti
  // const finalBlock = document.querySelectorAll('.bar');
  // scoreCounter.innerText = finalBlock.length.toString().padStart(5, '0');
}

// Funzione per il gameover
function endGame(isVictory) {
  if (isVictory) {
    endGameText.innerHTML = 'YOU<br>WON';
    endGameScreen.classList.add('win');
    // Riproduco l'audio "stacker.mp3" in caso di vittoria
    audioStacker.play();
    var minorPrizeElement = document.querySelector('.major-prize');
    minorPrizeElement.classList.add('blink');
    setTimeout(function () {
      minorPrizeElement.classList.remove('blink');
    }, 5000);
    // Imposto lo stato della partita come terminato
    isGameOver = true;
  } else {
    audioGameover.play();
  }

  endGameScreen.classList.remove('hidden');
  clearInterval(t);
  coins--;
}

function onPlayAgain() {
  // Salvo le monete inserite in localstorage prima di ricaricare
  localStorage.setItem('coins', JSON.stringify(coins));

  location.reload();
  isGameOver = false;
}

function main() {
  moveBar();
  draw();

  // Controlla se ci sono monete inserite
  if (coins <= 0) {
    // Disabilita il pulsante se non ci sono monete
    stackBtn.disabled = true; 
  } else {
    // Abilita il pulsante se ci sono monete
    stackBtn.disabled = false; 
    stackBtn.addEventListener('click', stackClickHandler); 
  }
}


// // Events
// stackBtn.addEventListener('click', onStack);
playAgainButton.addEventListener('click', onPlayAgain);

stackBtn.addEventListener('click', function () {
  if (!isPressed) {
    this.style.backgroundImage = "url('images/button_pressed.png')";
    isPressed = true;

    // Dopo 100 millisecondi, cambia l'immagine di sfondo al suo stato originale
    setTimeout(() => {
      this.style.backgroundImage = "url('images/button_unpressed.png')";
      isPressed = false;
    }, 100);
  }
});

// First draw
draw();

// Start game Loop
t = setInterval(main, 600);

