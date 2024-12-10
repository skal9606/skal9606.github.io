class Game {
    constructor() {
        console.log('Initializing game...');
        this.board = document.querySelector('.game-board');
        this.wallsLayer = document.querySelector('.walls-layer');
        this.dotsLayer = document.querySelector('.dots-layer');
        this.pacman = document.querySelector('.pacman');
        this.ghost = document.querySelector('.ghost');
        
        if (!this.board || !this.wallsLayer || !this.dotsLayer || !this.pacman || !this.ghost) {
            console.error('Failed to find required elements');
            return;
        }

        this.dotsCount = 0;
        this.dotsCollected = 0;
        this.gameStarted = false;
        this.gameOver = false;

        // Grid size (30px per cell, scaled for mobile)
        this.isMobile = window.innerWidth <= 768;
        this.cellSize = this.isMobile ? 21.42 : 30; // 300/14 for mobile
        this.gridWidth = 14;
        this.gridHeight = 14;

        // Pacman position
        this.pacmanPos = { x: 1, y: 1 };
        this.ghostPos = { x: 12, y: 12 };
        
        // Maze layout (1 = wall, 0 = path)
        this.maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,1,0,0,0,0,1,0,0,0,1],
            [1,0,1,0,0,0,1,1,0,0,0,1,0,1],
            [1,0,1,1,1,0,0,0,0,1,1,1,0,1],
            [1,0,0,0,1,1,1,1,1,1,0,0,0,1],
            [1,1,1,0,0,0,0,0,0,0,0,1,1,1],
            [1,0,0,0,1,1,0,1,1,1,0,0,0,1],
            [1,0,1,0,0,0,0,0,0,0,0,1,0,1],
            [1,0,1,1,1,1,0,1,1,1,1,1,0,1],
            [1,0,0,0,0,1,0,1,0,0,0,0,0,1],
            [1,0,1,1,0,0,0,0,0,1,1,1,0,1],
            [1,0,0,1,1,1,1,1,1,1,0,0,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        this.bindEvents();
        console.log('Game initialized successfully');
    }

    bindEvents() {
        try {
            // Keyboard controls
            document.addEventListener('keydown', this.handleKeyPress.bind(this));

            // Mobile controls
            const controlButtons = document.querySelectorAll('.control-btn');
            controlButtons.forEach(button => {
                ['touchstart', 'mousedown'].forEach(eventType => {
                    button.addEventListener(eventType, (e) => {
                        e.preventDefault(); // Prevent double-firing on mobile
                        if (!this.gameStarted || this.gameOver) return;
                        const direction = button.dataset.direction;
                        this.handleDirectionPress(direction);
                    });
                });
            });

            // Start button
            const startButton = document.getElementById('start-button');
            if (startButton) {
                startButton.addEventListener('click', () => {
                    console.log('Start button clicked');
                    if (!this.gameStarted) {
                        this.startGame();
                    }
                });
            }
        } catch (error) {
            console.error('Error binding events:', error);
        }
    }

    handleDirectionPress(direction) {
        let newPos = { ...this.pacmanPos };

        switch (direction) {
            case 'up':
                newPos.y--;
                this.pacman.style.transform = 'rotate(-90deg)';
                break;
            case 'down':
                newPos.y++;
                this.pacman.style.transform = 'rotate(90deg)';
                break;
            case 'left':
                newPos.x--;
                this.pacman.style.transform = 'rotate(180deg)';
                break;
            case 'right':
                newPos.x++;
                this.pacman.style.transform = 'rotate(0deg)';
                break;
        }

        if (!this.maze[newPos.y][newPos.x]) {
            this.pacmanPos = newPos;
            this.updatePacmanPosition();
        }
    }

    handleKeyPress(e) {
        if (!this.gameStarted || this.gameOver) return;

        const key = e.key.toLowerCase();
        let direction;

        switch (key) {
            case 'arrowup':
            case 'w':
                direction = 'up';
                break;
            case 'arrowdown':
            case 's':
                direction = 'down';
                break;
            case 'arrowleft':
            case 'a':
                direction = 'left';
                break;
            case 'arrowright':
            case 'd':
                direction = 'right';
                break;
            default:
                return;
        }

        this.handleDirectionPress(direction);
    }

    startGame() {
        try {
            console.log('Starting game...');
            this.gameStarted = true;
            this.gameOver = false;
            this.dotsCount = 0;
            this.createMaze();
            this.placePacman();
            this.placeGhost();
            this.pacman.classList.add('active');
            this.moveGhost();
            document.getElementById('start-button').disabled = true;
            console.log('Game started successfully');
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }

    createMaze() {
        try {
            console.log('Creating maze...');
            this.wallsLayer.innerHTML = '';
            this.dotsLayer.innerHTML = '';

            for (let y = 0; y < this.gridHeight; y++) {
                for (let x = 0; x < this.gridWidth; x++) {
                    if (this.maze[y][x] === 1) {
                        const wall = document.createElement('div');
                        wall.className = 'wall';
                        wall.style.width = this.cellSize + 'px';
                        wall.style.height = this.cellSize + 'px';
                        wall.style.left = (x * this.cellSize) + 'px';
                        wall.style.top = (y * this.cellSize) + 'px';
                        this.wallsLayer.appendChild(wall);
                    } else if (!(x === 1 && y === 1) && !(x === 12 && y === 12)) {
                        const dot = document.createElement('div');
                        dot.className = 'dot';
                        dot.style.left = (x * this.cellSize + this.cellSize/2 - 3) + 'px';
                        dot.style.top = (y * this.cellSize + this.cellSize/2 - 3) + 'px';
                        this.dotsLayer.appendChild(dot);
                        this.dotsCount++;
                    }
                }
            }
            document.getElementById('dots-count').textContent = this.dotsCollected;
            console.log(`Maze created with ${this.dotsCount} dots`);
        } catch (error) {
            console.error('Error creating maze:', error);
        }
    }

    placePacman() {
        this.pacmanPos = { x: 1, y: 1 };
        this.updatePacmanPosition();
    }

    placeGhost() {
        this.ghostPos = { x: 12, y: 12 };
        this.updateGhostPosition();
    }

    updatePacmanPosition() {
        this.pacman.style.left = (this.pacmanPos.x * this.cellSize) + 'px';
        this.pacman.style.top = (this.pacmanPos.y * this.cellSize) + 'px';
        this.checkDotCollection();
        this.checkGhostCollision();
    }

    updateGhostPosition() {
        this.ghost.style.left = (this.ghostPos.x * this.cellSize) + 'px';
        this.ghost.style.top = (this.ghostPos.y * this.cellSize) + 'px';
        this.checkGhostCollision();
    }

    moveGhost() {
        if (this.gameOver) return;

        const directions = [
            { x: 0, y: -1 },
            { x: 0, y: 1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 }
        ];

        let validMoves = directions.filter(dir => {
            const newX = this.ghostPos.x + dir.x;
            const newY = this.ghostPos.y + dir.y;
            return !this.maze[newY][newX];
        });

        if (validMoves.length > 0) {
            validMoves.sort((a, b) => {
                const distA = Math.abs((this.ghostPos.x + a.x) - this.pacmanPos.x) + 
                            Math.abs((this.ghostPos.y + a.y) - this.pacmanPos.y);
                const distB = Math.abs((this.ghostPos.x + b.x) - this.pacmanPos.x) + 
                            Math.abs((this.ghostPos.y + b.y) - this.pacmanPos.y);
                return distA - distB;
            });

            const move = Math.random() < 0.7 ? validMoves[0] : 
                validMoves[Math.floor(Math.random() * validMoves.length)];

            this.ghostPos.x += move.x;
            this.ghostPos.y += move.y;
            this.updateGhostPosition();
        }

        setTimeout(() => this.moveGhost(), 400);
    }

    checkDotCollection() {
        const dots = this.dotsLayer.querySelectorAll('.dot');
        dots.forEach(dot => {
            const dotX = parseInt(dot.style.left) - (this.cellSize/2 - 3);
            const dotY = parseInt(dot.style.top) - (this.cellSize/2 - 3);
            if (dotX === this.pacmanPos.x * this.cellSize && 
                dotY === this.pacmanPos.y * this.cellSize) {
                dot.remove();
                this.dotsCollected++;
                document.getElementById('dots-count').textContent = this.dotsCollected;
                
                if (this.dotsCollected === this.dotsCount) {
                    this.win();
                }
            }
        });
    }

    checkGhostCollision() {
        if (this.pacmanPos.x === this.ghostPos.x && 
            this.pacmanPos.y === this.ghostPos.y) {
            this.gameOver = true;
            this.pacman.classList.remove('active');
            alert('Game Over! Try again!');
            this.resetGame();
        }
    }

    win() {
        this.gameOver = true;
        this.pacman.classList.remove('active');
        document.querySelector('.social-links').style.display = 'block';
        document.querySelector('.social-links').classList.add('celebration');
    }

    resetGame() {
        this.gameStarted = false;
        this.gameOver = false;
        this.dotsCount = 0;
        this.dotsCollected = 0;
        document.getElementById('start-button').disabled = false;
        document.querySelector('.social-links').style.display = 'none';
        this.pacman.classList.remove('active');
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    console.log('Page loaded, creating game instance...');
    try {
        window.gameInstance = new Game();
        console.log('Game instance created and stored globally');
    } catch (error) {
        console.error('Error creating game instance:', error);
    }
});
