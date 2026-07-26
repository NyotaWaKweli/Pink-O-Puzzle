// ============================================================
// CUSTOM CHESS PIECE IMAGES
// ============================================================
const PIECE_IMAGES = {
    'white-pawn': 'pieces/pawn_pink.png',
    'white-rook': 'pieces/rook_pink.png',
    'white-knight': 'pieces/knight_pink.png',
    'white-bishop': 'pieces/bishop_pink.png',
    'white-queen': 'pieces/queen_pink.png',
    'white-king': 'pieces/king_pink.png',
    'black-pawn': 'pieces/pawn_black.png',
    'black-rook': 'pieces/rook_black.png',
    'black-knight': 'pieces/knight_black.png',
    'black-bishop': 'pieces/bishop_black.png',
    'black-queen': 'pieces/queen_black.png',
    'black-king': 'pieces/king_black.png'
};

// ============================================================
// PIECE VALUES
// ============================================================
const PIECE_VALUES = {
    'king': 100,
    'queen': 9,
    'rook': 5,
    'bishop': 3,
    'knight': 3,
    'pawn': 1
};

// ============================================================
// STATE
// ============================================================
let boardState = [];
let selectedSquare = null;
let validMoves = [];
let moveCount = 0;
let capturedCount = 0;
let totalBlackPieces = 0;
let gameOver = false;
let isAnimating = false;
let lastMove = null;
let lastMoveType = null;
let capturedList = [];
let currentFEN = '';

// ============================================================
// BOARD FUNCTIONS
// ============================================================
function isDarkSquare(r, c) { return (r + c) % 2 !== 0; }

function getPieceImage(piece) {
    if (!piece) return '';
    const key = piece.color + '-' + piece.type;
    return PIECE_IMAGES[key] || '';
}

function parseFEN(fen) {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null));
    const parts = fen.split(' ');
    const rows = parts[0].split('/');
    const pieceMap = {
        'K': { type: 'king', color: 'white' },
        'Q': { type: 'queen', color: 'white' },
        'R': { type: 'rook', color: 'white' },
        'B': { type: 'bishop', color: 'white' },
        'N': { type: 'knight', color: 'white' },
        'P': { type: 'pawn', color: 'white' },
        'k': { type: 'king', color: 'black' },
        'q': { type: 'queen', color: 'black' },
        'r': { type: 'rook', color: 'black' },
        'b': { type: 'bishop', color: 'black' },
        'n': { type: 'knight', color: 'black' },
        'p': { type: 'pawn', color: 'black' }
    };
    for (let r = 0; r < 8; r++) {
        let c = 0;
        for (const ch of rows[r]) {
            if (ch >= '1' && ch <= '8') { c += parseInt(ch); } else if (pieceMap[ch]) {
                board[r][c] = pieceMap[ch];
                c++;
            }
        }
    }
    return board;
}

// ============================================================
// PIECE-SPECIFIC MOVE GENERATION
// ============================================================
function getLegalMovesForPiece(board, row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    const moves = [];
    const enemy = piece.color === 'white' ? 'black' : 'white';

    const add = (r, c) => {
        if (r < 0 || r > 7 || c < 0 || c > 7) return;
        const target = board[r][c];
        if (target && target.color === piece.color) return;
        moves.push({ row: r, col: c, isCapture: !!target });
    };

    switch (piece.type) {
        case 'king': {
            const dirs = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
            for (const d of dirs) add(row + d[0], col + d[1]);
            break;
        }
        case 'queen': {
            const dirs = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ];
            for (const d of dirs) {
                let r = row + d[0],
                    c = col + d[1];
                while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    const target = board[r][c];
                    if (target) {
                        if (target.color === enemy) moves.push({ row: r, col: c, isCapture: true });
                        break;
                    }
                    moves.push({ row: r, col: c, isCapture: false });
                    r += d[0];
                    c += d[1];
                }
            }
            break;
        }
        case 'rook': {
            const dirs = [
                [-1, 0], [1, 0],
                [0, -1], [0, 1]
            ];
            for (const d of dirs) {
                let r = row + d[0],
                    c = col + d[1];
                while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    const target = board[r][c];
                    if (target) {
                        if (target.color === enemy) moves.push({ row: r, col: c, isCapture: true });
                        break;
                    }
                    moves.push({ row: r, col: c, isCapture: false });
                    r += d[0];
                    c += d[1];
                }
            }
            break;
        }
        case 'bishop': {
            const dirs = [
                [-1, -1], [-1, 1],
                [1, -1], [1, 1]
            ];
            for (const d of dirs) {
                let r = row + d[0],
                    c = col + d[1];
                while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    const target = board[r][c];
                    if (target) {
                        if (target.color === enemy) moves.push({ row: r, col: c, isCapture: true });
                        break;
                    }
                    moves.push({ row: r, col: c, isCapture: false });
                    r += d[0];
                    c += d[1];
                }
            }
            break;
        }
        case 'knight': {
            const deltas = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
            for (const d of deltas) add(row + d[0], col + d[1]);
            break;
        }
        case 'pawn': {
            const dir = piece.color === 'white' ? -1 : 1;
            const startRow = piece.color === 'white' ? 6 : 1;
            const promoRow = piece.color === 'white' ? 0 : 7;
            const fwd = row + dir;
            if (fwd >= 0 && fwd < 8 && !board[fwd][col]) {
                if (fwd === promoRow) {
                    for (const p of ['Q', 'R', 'B', 'N']) {
                        moves.push({ row: fwd, col: col, isCapture: false, flag: 'promotion-' + p });
                    }
                } else {
                    moves.push({ row: fwd, col: col, isCapture: false });
                }
                if (row === startRow) {
                    const fwd2 = row + 2 * dir;
                    if (!board[fwd2][col]) {
                        moves.push({ row: fwd2, col: col, isCapture: false });
                    }
                }
            }
            for (const dc of [-1, 1]) {
                const cr = row + dir,
                    cc = col + dc;
                if (cr >= 0 && cr < 8 && cc >= 0 && cc < 8) {
                    const target = board[cr][cc];
                    if (target && target.color === enemy) {
                        if (cr === promoRow) {
                            for (const p of ['Q', 'R', 'B', 'N']) {
                                moves.push({ row: cr, col: cc, isCapture: true, flag: 'promotion-' + p });
                            }
                        } else {
                            moves.push({ row: cr, col: cc, isCapture: true });
                        }
                    }
                }
            }
            break;
        }
    }
    return moves;
}

// ============================================================
// THREAT DETECTION - FINDS MOST VALUABLE ATTACKER
// ============================================================
function findMostValuableAttacker(board, row, col, attackerColor) {
    let bestPiece = null;
    let bestValue = -1;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color === attackerColor) {
                const moves = getLegalMovesForPiece(board, r, c);
                const canAttack = moves.some(m => m.row === row && m.col === col);
                if (canAttack) {
                    const value = PIECE_VALUES[p.type] || 0;
                    if (value > bestValue) {
                        bestValue = value;
                        bestPiece = { piece: p, row: r, col: c };
                    }
                }
            }
        }
    }
    return bestPiece;
}

// ============================================================
// RENDER BOARD WITH HIGHLIGHTS
// ============================================================
function renderBoard() {
    const b = document.getElementById('board');
    if (!b) return;
    b.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const sq = document.createElement('div');
            const dark = isDarkSquare(r, c);
            sq.className = 'square' + (dark ? ' dark' : '');
            
            if (lastMove) {
                if (r === lastMove.fromRow && c === lastMove.fromCol) {
                    if (lastMoveType === 'capture') {
                        sq.classList.add('highlight-from-capture');
                    } else if (lastMoveType === 'death') {
                        sq.classList.add('highlight-from-death');
                    } else {
                        sq.classList.add('highlight-from');
                    }
                }
                if (r === lastMove.toRow && c === lastMove.toCol) {
                    if (lastMoveType === 'capture') {
                        sq.classList.add('highlight-to-capture');
                    } else if (lastMoveType === 'death') {
                        sq.classList.add('highlight-to-death');
                    } else {
                        sq.classList.add('highlight-to');
                    }
                }
            }
            
            if (selectedSquare && selectedSquare.row === r && selectedSquare.col === c) {
                sq.classList.add('selected');
            }
            
            const piece = boardState[r][c];
            if (piece) {
                const img = document.createElement('img');
                img.className = 'piece-img';
                img.src = getPieceImage(piece);
                img.alt = piece.color + '-' + piece.type;
                sq.appendChild(img);
            }
            
            const mv = validMoves.find(m => m.row === r && m.col === c);
            if (mv) {
                const el = document.createElement('div');
                el.className = mv.isCapture ? 'capture-ring' : 'move-dot';
                sq.appendChild(el);
            }
            sq.dataset.row = r;
            sq.dataset.col = c;
            sq.addEventListener('click', function() {
                if (gameOver || isAnimating) return;
                handleSquareClick(parseInt(this.dataset.row), parseInt(this.dataset.col));
            });
            b.appendChild(sq);
        }
    }
    updateUI();
}

// ============================================================
// UI UPDATE
// ============================================================
function updateUI() {
    document.getElementById('capturedDisplay').textContent = `${capturedCount}/${totalBlackPieces}`;
    document.getElementById('movesDisplay').textContent = moveCount;
    document.getElementById('piecesLeft').textContent = totalBlackPieces - capturedCount;

    const container = document.getElementById('capturedPieces');
    let html = '<span class="label">Captured:</span>';
    if (capturedList.length > 0) {
        capturedList.forEach(p => {
            const imgSrc = getPieceImage(p);
            html += `<img src="${imgSrc}" class="captured-piece-img" alt="captured" />`;
        });
    }
    container.innerHTML = html;
}

// ============================================================
// ANIMATION HELPERS
// ============================================================
function animateMove(fromRow, fromCol, toRow, toCol, callback) {
    isAnimating = true;
    
    const board = document.getElementById('board');
    const squares = board.children;
    const fromIndex = fromRow * 8 + fromCol;
    const toIndex = toRow * 8 + toCol;
    
    const fromSquare = squares[fromIndex];
    const toSquare = squares[toIndex];
    
    const imgEl = fromSquare.querySelector('.piece-img');
    if (imgEl) {
        imgEl.classList.add('moving');
    }
    
    setTimeout(() => {
        if (imgEl && toSquare) {
            fromSquare.removeChild(imgEl);
            toSquare.appendChild(imgEl);
            imgEl.classList.remove('moving');
        }
        isAnimating = false;
        if (callback) callback();
    }, 450);
}

function animateCapture(fromRow, fromCol, toRow, toCol, callback) {
    isAnimating = true;
    
    const board = document.getElementById('board');
    const squares = board.children;
    const fromIndex = fromRow * 8 + fromCol;
    const toIndex = toRow * 8 + toCol;
    
    const fromSquare = squares[fromIndex];
    const toSquare = squares[toIndex];
    
    const imgEl = fromSquare.querySelector('.piece-img');
    const capturedEl = toSquare.querySelector('.piece-img');
    
    if (capturedEl) {
        capturedEl.classList.add('captured-burst');
    }
    
    if (imgEl) {
        imgEl.classList.add('moving');
    }
    
    setTimeout(() => {
        if (capturedEl && capturedEl.parentNode) {
            capturedEl.parentNode.removeChild(capturedEl);
        }
        
        if (imgEl && toSquare) {
            fromSquare.removeChild(imgEl);
            toSquare.appendChild(imgEl);
            imgEl.classList.remove('moving');
        }
        
        isAnimating = false;
        if (callback) callback();
    }, 600);
}

// ============================================================
// GAME LOGIC
// ============================================================
function loadFEN(fen) {
    try {
        boardState = parseFEN(fen);
        currentFEN = fen;
        selectedSquare = null;
        validMoves = [];
        moveCount = 0;
        capturedCount = 0;
        capturedList = [];
        gameOver = false;
        lastMove = null;
        lastMoveType = null;
        isAnimating = false;

        totalBlackPieces = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = boardState[r][c];
                if (p && p.color === 'black') totalBlackPieces++;
            }
        }

        document.getElementById('fenDisplay').textContent = fen;
        document.getElementById('problemText').innerHTML = 
            'Capture all black pieces with your pieces. <span class="fen-display" id="fenDisplay">' + fen + '</span>';
        document.getElementById('statusMessage').textContent = 'Select a white piece to move. Stay safe!';
        document.getElementById('statusMessage').className = 'status-message info';
        renderBoard();
    } catch (e) {
        showToast('Error', 'Invalid FEN string! Please check and try again.', 'OK');
    }
}

function handleSquareClick(row, col) {
    if (gameOver || isAnimating) return;

    const piece = boardState[row][col];

    if (selectedSquare) {
        const move = validMoves.find(m => m.row === row && m.col === col);
        if (move) {
            const fromRow = selectedSquare.row;
            const fromCol = selectedSquare.col;
            const from = boardState[fromRow][fromCol];
            const wasCapture = !!boardState[row][col];
            const capturedPieceType = wasCapture ? boardState[row][col].type : null;

            lastMove = {
                fromRow: fromRow,
                fromCol: fromCol,
                toRow: row,
                toCol: col
            };

            if (wasCapture) {
                lastMoveType = 'capture';
                animateCapture(fromRow, fromCol, row, col, function() {
                    boardState[row][col] = from;
                    boardState[fromRow][fromCol] = null;
                    moveCount++;
                    capturedCount++;
                    
                    const capturedPiece = { type: capturedPieceType, color: 'black' };
                    capturedList.push(capturedPiece);
                    
                    selectedSquare = null;
                    validMoves = [];
                    renderBoard();

                    if (capturedCount === totalBlackPieces) {
                        gameOver = true;
                        document.getElementById('statusMessage').textContent = '🎉 You captured all pieces! You win!';
                        document.getElementById('statusMessage').className = 'status-message success';
                        setTimeout(() => {
                            showToast('Victory!', 'You captured all ' + totalBlackPieces + ' black pieces!\nMoves: ' + moveCount, 'Play Again');
                        }, 300);
                        return;
                    }

                    // Check if any white piece is threatened
                    let threatFound = false;
                    for (let r = 0; r < 8; r++) {
                        for (let c = 0; c < 8; c++) {
                            const p = boardState[r][c];
                            if (p && p.color === 'white') {
                                const threat = findMostValuableAttacker(boardState, r, c, 'black');
                                if (threat) {
                                    threatFound = true;
                                    const attacker = threat.piece;
                                    const attackerRow = threat.row;
                                    const attackerCol = threat.col;
                                    
                                    lastMoveType = 'death';
                                    
                                    animateCapture(attackerRow, attackerCol, r, c, function() {
                                        boardState[r][c] = attacker;
                                        boardState[attackerRow][attackerCol] = null;
                                        gameOver = true;
                                        
                                        lastMove = {
                                            fromRow: attackerRow,
                                            fromCol: attackerCol,
                                            toRow: r,
                                            toCol: c
                                        };
                                        lastMoveType = 'death';
                                        
                                        renderBoard();
                                        document.getElementById('statusMessage').textContent =
                                            `💀 Your ${p.type} was captured by the ${attacker.type}! Game Over.`;
                                        document.getElementById('statusMessage').className = 'status-message danger';
                                        
                                        setTimeout(() => {
                                            showToast('Game Over',
                                                `Your ${p.type} was captured by the ${attacker.type}!\nPieces captured: ${capturedCount}/${totalBlackPieces}`,
                                                'Try Again');
                                        }, 3000);
                                    });
                                    return;
                                }
                            }
                        }
                    }

                    if (!threatFound) {
                        document.getElementById('statusMessage').textContent =
                            `Safe! ${capturedCount}/${totalBlackPieces} pieces captured. Keep going!`;
                        document.getElementById('statusMessage').className = 'status-message info';
                        renderBoard();
                    }
                });
            } else {
                lastMoveType = 'normal';
                animateMove(fromRow, fromCol, row, col, function() {
                    boardState[row][col] = from;
                    boardState[fromRow][fromCol] = null;
                    moveCount++;
                    
                    selectedSquare = null;
                    validMoves = [];
                    renderBoard();

                    // Check if any white piece is threatened
                    let threatFound = false;
                    for (let r = 0; r < 8; r++) {
                        for (let c = 0; c < 8; c++) {
                            const p = boardState[r][c];
                            if (p && p.color === 'white') {
                                const threat = findMostValuableAttacker(boardState, r, c, 'black');
                                if (threat) {
                                    threatFound = true;
                                    const attacker = threat.piece;
                                    const attackerRow = threat.row;
                                    const attackerCol = threat.col;
                                    
                                    lastMoveType = 'death';
                                    
                                    animateCapture(attackerRow, attackerCol, r, c, function() {
                                        boardState[r][c] = attacker;
                                        boardState[attackerRow][attackerCol] = null;
                                        gameOver = true;
                                        
                                        lastMove = {
                                            fromRow: attackerRow,
                                            fromCol: attackerCol,
                                            toRow: r,
                                            toCol: c
                                        };
                                        lastMoveType = 'death';
                                        
                                        renderBoard();
                                        document.getElementById('statusMessage').textContent =
                                            `💀 Your ${p.type} was captured by the ${attacker.type}! Game Over.`;
                                        document.getElementById('statusMessage').className = 'status-message danger';
                                        
                                        setTimeout(() => {
                                            showToast('Game Over',
                                                `Your ${p.type} was captured by the ${attacker.type}!\nPieces captured: ${capturedCount}/${totalBlackPieces}`,
                                                'Try Again');
                                        }, 3000);
                                    });
                                    return;
                                }
                            }
                        }
                    }

                    if (!threatFound) {
                        document.getElementById('statusMessage').textContent =
                            `Safe! ${capturedCount}/${totalBlackPieces} pieces captured. Keep going!`;
                        document.getElementById('statusMessage').className = 'status-message info';
                        renderBoard();
                    }
                });
            }
            return;
        }

        if (piece && piece.color === 'white') {
            selectedSquare = { row, col };
            validMoves = getLegalMovesForPiece(boardState, row, col);
            renderBoard();
            return;
        }

        selectedSquare = null;
        validMoves = [];
        renderBoard();
        return;
    }

    if (piece && piece.color === 'white') {
        selectedSquare = { row, col };
        validMoves = getLegalMovesForPiece(boardState, row, col);
        renderBoard();
    }
}

// ============================================================
// TOAST / POPUP
// ============================================================
function showToast(title, msg, confirmText = 'OK') {
    return new Promise((resolve) => {
        const o = document.getElementById('toastOverlay');
        const titleEl = document.getElementById('toastTitle');
        const msgEl = document.getElementById('toastMessage');
        const c = document.getElementById('toastConfirm');
        const icon = document.getElementById('toastIcon');

        if (titleEl) titleEl.textContent = title;
        if (msgEl) msgEl.textContent = msg;
        if (c) c.textContent = confirmText;
        if (o) o.classList.add('active');

        if (title.includes('Victory') || title.includes('Win')) {
            icon.className = 'toast-success-icon';
            icon.style.display = 'block';
            icon.textContent = '🏆';
        } else if (title.includes('Error')) {
            icon.className = 'toast-error-icon';
            icon.style.display = 'block';
            icon.textContent = '⚠';
        } else {
            icon.className = 'toast-error-icon';
            icon.style.display = 'block';
            icon.textContent = '⚠';
        }

        if (c) c.onclick = () => {
            if (o) o.classList.remove('active');
            if (title.includes('Victory') || title.includes('Win') || title.includes('Game Over') || title.includes('Error')) {
                if (currentFEN) loadFEN(currentFEN);
            }
            resolve(true);
        };
        if (o) o.onclick = (e) => {
            if (e.target === o) {
                o.classList.remove('active');
                if (title.includes('Victory') || title.includes('Win') || title.includes('Game Over') || title.includes('Error')) {
                    if (currentFEN) loadFEN(currentFEN);
                }
                resolve(true);
            }
        };
    });
}

// ============================================================
// LOAD FEN FROM INPUT
// ============================================================
document.getElementById('loadBtn').addEventListener('click', function() {
    const fen = document.getElementById('fenInput').value.trim();
    if (fen) {
        loadFEN(fen);
    } else {
        showToast('Info', 'Please enter a FEN string first.', 'OK');
    }
});

document.getElementById('fenInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const fen = document.getElementById('fenInput').value.trim();
        if (fen) {
            loadFEN(fen);
        } else {
            showToast('Info', 'Please enter a FEN string first.', 'OK');
        }
    }
});

// ============================================================
// CLEAR BUTTON - Clears the input field
// ============================================================
document.getElementById('clearBtn').addEventListener('click', function() {
    document.getElementById('fenInput').value = '';
    document.getElementById('fenInput').focus();
});

// ============================================================
// INIT - Empty board with placeholder
// ============================================================
window.onload = function() {
    // Initialize with empty board
    boardState = Array.from({ length: 8 }, () => Array(8).fill(null));
    currentFEN = '';
    renderBoard();
    document.getElementById('fenDisplay').textContent = 'No FEN loaded yet';
    document.getElementById('problemText').innerHTML = 
        'Enter a FEN string and click Load to start. <span class="fen-display" id="fenDisplay">No FEN loaded yet</span>';
    document.getElementById('statusMessage').textContent = 'Paste a FEN string above and click Load.';
    document.getElementById('statusMessage').className = 'status-message info';
};
