const gridContainer = document.querySelector('.grid-container');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('best-score');
let score = 0;
let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;

bestScoreDisplay.textContent = bestScore;

const createGrid = () => {
    for (let i = 0; i < 16; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.innerHTML = '<span></span>';
        gridContainer.appendChild(tile);
    }
};

const updateTileDisplay = (tile, value) => {
    const span = tile.querySelector('span');
    if (value === '') {
        span.textContent = '';
        tile.className = 'tile';
    } else {
        span.textContent = value;
        tile.className = `tile tile-${value}`;
    }
};

const generateTile = () => {
    const tiles = document.querySelectorAll('.tile');
    const emptyTiles = Array.from(tiles).filter(tile => !tile.querySelector('span').textContent);
    if (emptyTiles.length > 0) {
        const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        updateTileDisplay(randomTile, value);
    }
};

const updateScore = (value) => {
    score += value;
    scoreDisplay.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        bestScoreDisplay.textContent = bestScore;
        localStorage.setItem('bestScore', bestScore);
    }
};

const mergeTiles = (tile1, tile2) => {
    const value1 = parseInt(tile1.querySelector('span').textContent);
    const value2 = parseInt(tile2.querySelector('span').textContent);
    if (value1 === value2) {
        updateTileDisplay(tile1, value1 + value2);
        updateTileDisplay(tile2, '');
        updateScore(value1 + value2);
        return true;
    }
    return false;
};

const moveTiles = (direction) => {
    const tiles = document.querySelectorAll('.tile');
    let moved = false;

    const move = (index, nextIndex) => {
        const currentTile = tiles[index];
        const nextTile = tiles[nextIndex];
        const currentValue = currentTile.querySelector('span').textContent;
        const nextValue = nextTile.querySelector('span').textContent;

        if (nextValue !== '' && currentValue === '') {
            updateTileDisplay(currentTile, nextValue);
            updateTileDisplay(nextTile, '');
            moved = true;
        }
    };

    if (direction === 'left') {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                for (let k = j + 1; k < 4; k++) {
                    move(i * 4 + j, i * 4 + k);
                    if (mergeTiles(tiles[i * 4 + j], tiles[i * 4 + k])) {
                        moved = true;
                    }
                }
            }
        }
    } else if (direction === 'right') {
        for (let i = 0; i < 4; i++) {
            for (let j = 3; j >= 0; j--) {
                for (let k = j - 1; k >= 0; k--) {
                    move(i * 4 + j, i * 4 + k);
                    if (mergeTiles(tiles[i * 4 + j], tiles[i * 4 + k])) {
                        moved = true;
                    }
                }
            }
        }
    } else if (direction === 'up') {
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 4; i++) {
                for (let k = i + 1; k < 4; k++) {
                    move(i * 4 + j, k * 4 + j);
                    if (mergeTiles(tiles[i * 4 + j], tiles[k * 4 + j])) {
                        moved = true;
                    }
                }
            }
        }
    } else if (direction === 'down') {
        for (let j = 0; j < 4; j++) {
            for (let i = 3; i >= 0; i--) {
                for (let k = i - 1; k >= 0; k--) {
                    move(i * 4 + j, k * 4 + j);
                    if (mergeTiles(tiles[i * 4 + j], tiles[k * 4 + j])) {
                        moved = true;
                    }
                }
            }
        }
    }

    if (moved) {
        setTimeout(generateTile, 150);
        checkGameOver();
    }
};

const checkGameOver = () => {
    const tiles = document.querySelectorAll('.tile');
    let gameOver = true;

    // Check for empty tiles
    for (const tile of tiles) {
        if (!tile.querySelector('span').textContent) {
            gameOver = false;
            break;
        }
    }

    // Check for possible merges
    if (gameOver) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const currentIndex = i * 4 + j;
                const rightIndex = currentIndex + 1;
                const downIndex = currentIndex + 4;

                if (j < 3) {
                    const currentValue = tiles[currentIndex].querySelector('span').textContent;
                    const rightValue = tiles[rightIndex].querySelector('span').textContent;
                    if (currentValue === rightValue) {
                        gameOver = false;
                        break;
                    }
                }

                if (i < 3) {
                    const currentValue = tiles[currentIndex].querySelector('span').textContent;
                    const downValue = tiles[downIndex].querySelector('span').textContent;
                    if (currentValue === downValue) {
                        gameOver = false;
                        break;
                    }
                }
            }
            if (!gameOver) break;
        }
    }

    if (gameOver) {
        setTimeout(() => {
            alert('遊戲結束！您的得分是: ' + score);
            restartGame();
        }, 300);
    }
};

const restartGame = () => {
    gridContainer.innerHTML = '';
    score = 0;
    scoreDisplay.textContent = '0';
    createGrid();
    generateTile();
    generateTile();
};

const handleInput = (event) => {
    switch (event.key) {
        case 'ArrowUp':
            moveTiles('up');
            break;
        case 'ArrowDown':
            moveTiles('down');
            break;
        case 'ArrowLeft':
            moveTiles('left');
            break;
        case 'ArrowRight':
            moveTiles('right');
            break;
    }
};

// 觸控事件相關變數
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// 處理觸控開始事件
const handleTouchStart = (event) => {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
};

// 處理觸控結束事件
const handleTouchEnd = (event) => {
    touchEndX = event.changedTouches[0].clientX;
    touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30; // 最小滑動距離

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 水平滑動
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                moveTiles('right');
            } else {
                moveTiles('left');
            }
        }
    } else {
        // 垂直滑動
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                moveTiles('down');
            } else {
                moveTiles('up');
            }
        }
    }
};

// 防止滑動時頁面捲動
const preventDefault = (event) => {
    event.preventDefault();
};

// 添加觸控事件監聽器
gridContainer.addEventListener('touchstart', handleTouchStart, false);
gridContainer.addEventListener('touchend', handleTouchEnd, false);
gridContainer.addEventListener('touchmove', preventDefault, { passive: false });

document.addEventListener('keydown', handleInput);
createGrid();
generateTile();
generateTile();
