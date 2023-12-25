let boardSize = 0; // 0 is small size, 1 is medium and 2 is large
let boardMatrix = [];
let clickedColumns = [];
let lastColumn = -1;
let gameFinished = false;
let width = 4;
let height;
let playerMoney = 9999;
let gameMode = 0; // is manual mode and 1 is auto
let autoMatrix = [];

const bets = [[1.45, 2.18, 3.27, 4.91],
    [1.29, 1.72, 2.29, 3.06, 4.08, 5.45, 7.26],
    [1.21, 1.51, 1.89, 2.36, 2.96, 3.7, 4.62, 5.78, 7.22, 9.03]];


const smallFieldButton = document.getElementById('small-field-btn');
const mediumFieldButton = document.getElementById('medium-field-btn');
const largeFieldButton = document.getElementById('large-field-btn');
const amountInput = document.getElementById('amount-input');
const amountButtons = document.getElementsByClassName('amount-button');
const plusAmount = document.getElementById('plus');
const minusAmount = document.getElementById('minus');
const betButton = document.getElementById('bet-button');
const board = document.getElementById("board");
const boardSection = document.getElementsByClassName('board-section')[0];
const manualToggle = document.getElementById('manual');
const autoToggle = document.getElementById('auto');
const betElement = document.getElementsByClassName('bet')[0];
const autoContainer = document.getElementById('auto-container');

let betOnWin = document.getElementsByClassName('bet-on-win')[0];
let betOnLoss = document.getElementsByClassName('bet-on-loss')[0];

let onWin = 0;
let onLoss = 0;

let base = 0;

let autoPlay = false;
let autoCounter = 0;

setMoney(0);
changeGameMode();

manualToggle.addEventListener('click', () => {
    if (!manualToggle.className.includes('selected-mode')) {
        changeBoardSize(boardSize);
        autoMatrix = [];
        autoToggle.className = autoToggle.className.split(' ').filter(x => !x.includes('selected-mode')).join(' ');
        manualToggle.className += ' selected-mode';
        gameMode = 0;
        changeBoardSize(boardSize);
        document.getElementsByClassName('random-btn')[0].className =
            document.getElementsByClassName('random-btn')[0].className.split(' ')[0];
        changeGameMode();
    }
})

autoToggle.addEventListener('click', () => {
    if (!autoToggle.className.includes('selected-mode')) {
        for (let i = 0; i < height; i++) {
            autoMatrix.push(Array(width).fill(0));
        }
        changeBoardSize(boardSize);
        if (!boardSection.className.includes('playing')) {
            boardSection.className += ' playing';
        }
        base = Number(amountInput.value);
        manualToggle.className = manualToggle.className.split(' ').filter(x => !x.includes('selected-mode')).join(' ');
        autoToggle.className += ' selected-mode';
        gameMode = 1;
        onWin = 0;
        onLoss = 0;
        changeOnWinToggle();
        changeOnLossToggle();
        betOnWin = document.getElementsByClassName('bet-on-win')[0];
        betOnLoss = document.getElementsByClassName('bet-on-loss')[0];
        betOnWin.childNodes.forEach(element => {
            element.addEventListener('click',() => {
                onWin = element.getAttribute('value');
                changeOnWinToggle();
            })
        });
        betOnLoss.childNodes.forEach(element => {
            element.addEventListener('click',() => {
                onLoss = element.getAttribute('value');
                changeOnLossToggle();
            })
        });
        let randomBtn = document.getElementsByClassName('random-btn')[0];
        randomBtn.className += ' show-rand';
        listenToCells();
        randomBtn.addEventListener('click', () => {
            chooseRowRandomly()
        })
        changeGameMode();
    }
})

function chooseRowRandomly() {
    let rand = Math.floor(Math.random() * height);
    let clicked = false;
    document.querySelectorAll('.playing .cell').forEach(el => {
        if (Number(el.getAttribute('value')[0]) === rand
            && Number(el.getAttribute('value')[1]) === lastColumn+1
            && !clicked) {
            el.click();
            clicked = true;
        }
    })

}

const minVal = 0.1;
amountInput.value = minVal.toFixed(2);

for(let i = 0; i< amountButtons.length; i++) {
    amountButtons.item(i).addEventListener('click', () => {
        amountInput.value = Number(amountButtons.item(i).innerHTML.replace('$', ''))
            .toFixed(2);
    })
}

betButton.addEventListener('click', () => {
    if (betButton.className.includes('disabled')) {
        return;
    }
    if (boardSection.className.includes('playing') && betButton.innerText === 'CheckOut') {
        checkOut();
        reset();
    }else if(gameMode === 1) {
        autoPlay = true;
        autoCounter = 0;
        base = Number(amountInput.value);
        betButton.style.display = 'none';
        document.getElementById('stop-btn').style.display = 'flex';
        document.getElementById('stop-btn').addEventListener('click', () => {
            autoPlay = false;
        })
        startAuto();
    }else if (boardSection.className.includes('playing') && betButton.innerText === 'BET') {
        reset();
    }
    else {
        changeBoardSize(boardSize);
        if (!boardSection.className.includes('playing')) {
            boardSection.className += ' playing';
        }
        base = Number(amountInput.value);

        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        betElement.appendChild(overlay);
        if (gameMode !== 0) {
            return;
        }
        listenToCells();

    }
});

function listenToCells() {
    document.querySelectorAll('.playing .cell').forEach((element) => {
        element.addEventListener('click', () => {
            let row = Number(element.attributes.value.value[0]);
            let col = Number(element.attributes.value.value[1]);
            if (clickedColumns.includes(col) || col !== lastColumn + 1 || gameFinished) {
                return;
            }

            if (gameMode === 1) {
                element.className += ' yellow'
                clickedColumns.push(col);
                lastColumn = col;
                boardMatrix[row][col] += 2;
                autoMatrix[row][col] = 1;
                return;
            }
            if (clickedColumns.length < 1) {
                setMoney(-amountInput.value);
                betButton.innerText = "CheckOut";
            }
            if (boardMatrix[row][col] === 1) {
                element.className += ' red';
                gameFinished = true;
                gameOver();
            } else {
                element.className += ' green';
                showBomb(col);
                if (width === row + 1) {
                    gameFinished = true;
                    checkOut();
                }
            }

            clickedColumns.push(col);
            lastColumn = col;
        })
    })
}

plusAmount.addEventListener('click', () => {
    let value = Number(amountInput.value) + 0.1;
    amountInput.value = value.toFixed(2);
});

minusAmount.addEventListener('click', () => {
    if (amountInput.value >= 0.2) {
        let value = Number(amountInput.value) - 0.1;
        amountInput.value = value.toFixed(2);
    }
});

amountInput.addEventListener('input', (event) => {
    if (event.target.value > 100) {
        let val = 100
        event.target.value = val.toFixed(2);
        event.stopPropagation();
    }
});
amountInput.addEventListener('focusout', (event) => {
    event.target.value = Number(event.target.value).toFixed(2);
    if (event.target.value < 0.1) {
        let val = 0.1
        event.target.value = val.toFixed(2);
        event.stopPropagation();
    }
});

smallFieldButton.addEventListener('click', () => {
    boardSize = 0;
    changeBoardSize(boardSize);
});
mediumFieldButton.addEventListener('click', () => {
    boardSize = 1;
    changeBoardSize(boardSize);
});
largeFieldButton.addEventListener('click', () => {
    boardSize = 2;
    changeBoardSize(boardSize);
});

changeBoardSize(0);

function changeBoardSize(size) {
    reset();
    board.innerHTML = '';
    switch (size) {
        case 1:
            width = 7;
            height = 4;
            break;
        case 2:
            width = 10;
            height = 5;
            break;
        default:
            width = 4;
            height = 3;
    }
    if (gameMode === 1) {
        for (let i = 0; i < height; i++) {
            autoMatrix.push(Array(width).fill(0));
        }
    }

    for(let i = 0; i<height; i++) {
        let row = `<div class="row">`
        for(let j = 0; j < width; j++) {
            row += `<div class="cell ${getSizeClass(size)} ${getYellowClass(i, j)}" value="${i+''+j}"></div>`
        }
        row+=`</div>`
        board.innerHTML = board.innerHTML + row;
    }
    let row = `<div class="row">`
    for(let i = 0; i< bets[boardSize].length; i++) {
        row += `<div class="bet-amount ${getSizeClass(boardSize)}">X${bets[boardSize][i].toFixed(2)}</div>`
    }
    row+=`</div>`
    board.innerHTML = board.innerHTML + row;
    for (let i = 0; i < height; i++) {
        boardMatrix.push(Array(width).fill(0));
    }
    for (let i = 0; i < width; i++) {
        let randomRow = Math.floor(Math.random() * height);
        boardMatrix[randomRow][i] = 1;
    }
}

function getYellowClass(row, col) {
    if (gameMode !== 1) {
        return '';
    }
    if (autoMatrix[row][col] === 1) {
        return 'yellow';
    }
    return '';
}

function getSizeClass(size) {
    if (size === 0) {
        return 'small';
    }
    else if (size === 1) {
        return 'medium';
    }
    else {
        return 'large';
    }
}

function reset() {
    boardMatrix = [];
    lastColumn = -1;
    clickedColumns = [];
    if (gameMode === 1) {
        return;
    }
    betButton.innerText = 'BET';
    gameFinished = false;
    boardSection.className = boardSection.className.split(' ')[0];
    let betElement = document.getElementsByClassName('bet')[0];
    const overlay = betElement.querySelector('.overlay');
    if (overlay) {
        betElement.removeChild(overlay);
    }
}

function gameOver() {
    betButton.className += 'disabled';
    setTimeout(() => {
        reset();
        betButton.className = betButton.className.split(' ').filter(x => !x.includes('disabled')).join(' ');
    }, 1000);
    betButton.innerText = 'BET';
}

function checkOut() {
    let x = Number(amountInput.value) * bets[boardSize][lastColumn];
    setMoney(x);
    betButton.innerText = 'BET';
}

function showBomb(column) {
    let lost = false;
    document.querySelectorAll('.playing .cell').forEach((element) => {
        let row = Number(element.attributes.value.value[0]);

        if (Number(element.attributes.value.value[1]) === Number(column) && (boardMatrix[row][column] === 1 || boardMatrix[row][column] === 3)) {
            if (element.className.includes('yellow')) {
                element.className = element.className.split(' ').filter(val => val !== 'yellow').join(' ');
                lost = true;
            }
            element.className += ' red';
        }
    })
    return lost;
}

function setMoney(bet) {
    playerMoney +=  bet;
    document.getElementById('money').innerText = `Credit: ${playerMoney.toFixed(2)}$`
}

function changeGameMode() {
    switch (gameMode) {
        case 1:
            autoContainer.style.display = 'flex';
            break;
        default:
            autoContainer.style.display = 'none';
            break;
    }
}

function changeOnWinToggle() {
    let autoWinBtns = document.querySelectorAll('.bet-on-win .auto-bet-btn');
    autoWinBtns.forEach(el => {

        if (Number(el.getAttribute('value')) === Number(onWin)) {
            el.className += ' chosen';
        } else {
            el.className = 'auto-bet-btn';
        }
    })
}

function changeOnLossToggle() {
    let autoLossBtns = document.querySelectorAll('.bet-on-loss .auto-bet-btn');
    autoLossBtns.forEach(el => {

        if (Number(el.getAttribute('value')) === Number(onLoss)) {
            el.className += ' chosen';
        } else {
            el.className = 'auto-bet-btn';
        }
    })
}

function startAuto() {
    if (!autoPlay) {
        betButton.style.display = 'unset'
        document.getElementById('stop-btn').style.display = 'none';
        return;
    }
    let hasLost = false;
    setMoney(-Number(amountInput.value))
    for (let i = 0; i < width; i++) {
        setTimeout(() => {
            if (showBomb(i)) {
                hasLost = true;
            }
            if (i === width -1) {
                changeBoardSize(boardSize)
                if (hasLost) {
                    lossAuto();
                } else {
                    winAuto();
                }

                startAuto()
            }
        }, i*1000);
    }

}

function lossAuto() {
    const max = 100;
    const min = 0.1;

    let newAmount;

    switch (Number(onLoss)) {
        case 0:
            newAmount = base;
            break;
        case 1:
            newAmount = Number(amountInput.value) * 2 > max ? max : Number(amountInput.value) * 2;
            break;
        case 2:
            newAmount = Number(amountInput.value) / 2 < min ? min : Number(amountInput.value) / 2;
            break;
    }
    amountInput.value = newAmount.toFixed(2);
}

function winAuto() {
    setMoney(amountInput.value * bets[boardSize][width-1])
    const max = 100;
    const min = 0.1;

    let newAmount;

    switch (Number(onWin)) {
        case 0:
            newAmount = base;
            break;
        case 1:

            newAmount = Number(amountInput.value) * 2 > max ? max : Number(amountInput.value) * 2;
            break;
        case 2:
            newAmount = Number(amountInput.value) / 2 < min ? min : Number(amountInput.value) / 2;
            break;
    }

    amountInput.value = newAmount.toFixed(2);
}