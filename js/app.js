const ironApp = {
    name: 'Good Guy Lenin',
    description: 'Kepp my wifes name out of your f****** mouth',
    version: '1.1.0',
    author: 'Pablo & Roberto',
    license: undefined,
    canvasNode: undefined,
    ctx: undefined,
    gameSize: { w: undefined, h: undefined },
    framesIndex: 0,
    enemyArr: [],
    shootBonusArr: [],
    clearBonusArr: [],
    slowBonusArr: [],
    bulletsArr: [],
    canShoot: false,
    nextLevelText: false,
    enemyGenerateSpeed: undefined,
    onPlaying: false,
    musicOnPlay: false,
    enemySpeed: undefined,
    highScore: undefined,



    init(canvasID) {
        this.canvasNode = document.querySelector(`#${canvasID}`)
        this.ctx = this.canvasNode.getContext('2d')
        this.loadImages()
        this.setDimensions()
        this.drawBackground()
        this.clearAll()
        this.start()
        this.createPlayer()
        this.setEventListeners()
        this.gameStart()
        this.displayCopyright()

    },

    displayCopyright() {
        this.ctx.fillStyle = 'grey'
        this.ctx.font = '11px arial'
        this.ctx.fillText('Developed by:', 10, this.gameSize.h - 25)
        this.ctx.fillText('Roberto Ezquerro & Pablo Quintana', 10, this.gameSize.h - 10)
    },

    setDimensions() {
        this.gameSize = {
            w: window.innerWidth,
            h: window.innerHeight
        }
        this.canvasNode.setAttribute('width', this.gameSize.w)
        this.canvasNode.setAttribute('height', this.gameSize.h)
    },

    setEventListeners() {
        document.addEventListener('keydown', event => {
            const { key } = event
            if (key === 'ArrowLeft' && (this.player.playerPos.x > 200 || this.player.playerPos.y <= 200)) {
                this.player.moveLeft()
            }
            if (key === 'ArrowRight' && this.player.playerPos.x < this.gameSize.w - 220 - this.player.playerSize.w) {
                this.player.moveRight()
            }
            if (key === 'ArrowUp' && this.player.playerPos.y > 160) {
                this.player.moveUp()
            }
            if (key === 'ArrowDown' && this.player.playerPos.y < this.gameSize.h - 40 - this.player.playerSize.h) {
                this.player.moveDown()
            } if (event.code === 'Space') {
                this.shoot()
            } if (event.code === 'Enter') {
                if (this.onPlaying === false) {
                    this.reset()
                    if (!this.musicOnPlay) {
                        let backgroundMusic = new Audio("./sounds/main_song.mp3")
                        backgroundMusic.volume = 0.3
                        backgroundMusic.play()
                        this.musicOnPlay = true

                    }
                }
            }

        })
    },
    start() {
        this.onPlaying = true
        this.enemyGenerateSpeed = 15
        this.enemySpeed = 0

        this.interval = setInterval(() => {
            this.clearAll()
            this.drawAll()
            this.generateEnemy()
            this.generateShootBonus()
            this.generateClearBonus()
            this.generateSlowBonus()
            this.displayCopyright()
            console.log(this.enemySpeed)
            this.framesIndex++
        }, 30);
    },

    reset() {
        this.enemyArr.splice(0, this.enemyArr.length)
        this.shootBonusArr.splice(0, this.shootBonusArr.length)
        this.clearBonusArr.splice(0, this.clearBonusArr.length)
        this.framesIndex = 0

        this.start()

    },

    clearAll() {
        this.ctx.clearRect(0, 0, this.gameSize.w, this.gameSize.h)
    },

    drawAll() {
        this.drawBackground()
        this.player.draw()
        this.pointsCounter(this.framesIndex)
        this.displayNextLevelText()
        if (this.framesIndex % 300 === 0 && this.framesIndex !== 0) {
            this.nextLevel()
            this.enemyGenerateSpeed / 2
            this.enemySpeed += .5
        }

        this.shootBonusArr.forEach(bonus => bonus.draw());
        this.clearBonusArr.forEach(bonus => bonus.draw())
        this.slowBonusArr.forEach(bonus => bonus.draw())
        this.enemyArr.forEach(enemy => enemy.draw())
        this.bulletsArr.forEach(bullet => { bullet.draw() });
        this.clearEnemies()
        this.clearBullets()

        this.enemyArr.forEach(enemy => {
            if (this.player.playerPos.x < enemy.enemyPos.x + enemy.enemySize.w &&
                this.player.playerPos.x + this.player.playerSize.w > enemy.enemyPos.x &&
                this.player.playerPos.y < enemy.enemyPos.y + enemy.enemySize.h &&
                this.player.playerSize.h + this.player.playerPos.y > enemy.enemyPos.y) {

                this.playerEnemyCollision()


            }
        });

        this.clearBonusArr.forEach(clearBonus => {
            if (this.player.playerPos.x < clearBonus.clearBonusPos.x + clearBonus.clearBonusSize.w &&
                this.player.playerPos.x + this.player.playerSize.w > clearBonus.clearBonusPos.x &&
                this.player.playerPos.y < clearBonus.clearBonusPos.y + clearBonus.clearBonusSize.h &&
                this.player.playerSize.h + this.player.playerPos.y > clearBonus.clearBonusPos.y) {
                this.playerClearBonusCollision()
            }
        });

        this.shootBonusArr.forEach(shootBonus => {
            if (this.player.playerPos.x < shootBonus.shootBonusPos.x + shootBonus.shootBonusSize.w &&
                this.player.playerPos.x + this.player.playerSize.w > shootBonus.shootBonusPos.x &&
                this.player.playerPos.y < shootBonus.shootBonusPos.y + shootBonus.shootBonusSize.h &&
                this.player.playerSize.h + this.player.playerPos.y > shootBonus.shootBonusPos.y) {
                this.playerShootBonusCollision()
            }
        });

        this.slowBonusArr.forEach(slowBonus => {
            if (this.player.playerPos.x < slowBonus.slowBonusPos.x + slowBonus.slowBonusSize.w &&
                this.player.playerPos.x + this.player.playerSize.w > slowBonus.slowBonusPos.x &&
                this.player.playerPos.y < slowBonus.slowBonusPos.y + slowBonus.slowBonusSize.h &&
                this.player.playerSize.h + this.player.playerPos.y > slowBonus.slowBonusPos.y) {
                this.playerSlowBonusCollision()

            }
        })

        this.enemyArr.forEach(enemy => {
            this.bulletsArr.forEach(bullet => {
                if (bullet.bulletPos.x < enemy.enemyPos.x + enemy.enemySize.w &&
                    bullet.bulletPos.x + bullet.bulletSize.w > enemy.enemyPos.x &&
                    bullet.bulletPos.y < enemy.enemyPos.y + enemy.enemySize.h &&
                    bullet.bulletSize.h + bullet.bulletPos.y > enemy.enemyPos.y) {
                    this.enemyArr.splice(this.enemyArr.indexOf(enemy), 1)
                    this.bulletsArr.splice(this.bulletsArr.indexOf(bullet), 1)
                }
            });
        });


    },

    drawBackground() {
        this.ctx.fillStyle = 'grey'
        this.ctx.drawImage(this.imageInstanceBackgroundImage, 0, 0, this.gameSize.w, this.gameSize.h)
        this.ctx.fillStyle = 'blue'
        this.ctx.drawImage(this.imageInstanceAside1, 0, 0, 200, this.gameSize.h)
        this.ctx.drawImage(this.imageInstanceAside2, this.gameSize.w - 200, 0, 200, this.gameSize.h)

    },

    pointsCounter(counter) {
        // this.ctx.fillStyle = 'white'
        // this.ctx.font = '20px helvetica'
        // this.ctx.fillText("Your score", this.gameSize.w / 2 - 50, 45)
        this.ctx.fillStyle = 'white'
        this.ctx.font = '75px helvetica'
        this.ctx.fillText(counter * 30, this.gameSize.w / 2 - 120, 100)
    },

    nextLevel() {
        this.nextLevelText = true
        window.setTimeout(() => {
            this.nextLevelText = false

        }, 1000);
    },

    displayNextLevelText() {
        if (this.nextLevelText === true) {
            this.ctx.fillStyle = 'black'
            this.ctx.font = '100px helvetica'
            this.ctx.fillText('SPEED UP!', this.gameSize.w / 2 - 300, this.gameSize.h / 2)
            this.ctx.fillStyle = 'white'
            this.ctx.font = '100px helvetica'
            this.ctx.fillText('SPEED UP!', this.gameSize.w / 2 - 301, this.gameSize.h / 2 - 10)
        }
    },

    highscore() {
        this.ctx.fillStyle = 'white'
        this.ctx.font = '20px helvetica'
        this.ctx.fillText("Your score", this.gameSize.w / 2 + 325, 40)
        this.ctx.fillStyle = 'white'
        this.ctx.font = '50px helvetica'
        this.ctx.fillText(this.highScore, this.gameSize.w / 2 + 320, 100)
    },

    createPlayer() {
        this.player = new Player(this.ctx, this.gameSize.w / 2 - 40, this.gameSize.h / 2 - 40, 80, 80)
        this.player.draw()
    },

    generateEnemy() {
        if (this.framesIndex % this.enemyGenerateSpeed === 0) {
            this.enemyArr.push(new Enemy(this.ctx, Math.random() * (this.gameSize.w - 550) + 250, 100, 80, 80, this.enemySpeed))
        }
    },

    clearEnemies() {
        this.enemyArr = this.enemyArr.filter(enemy => enemy.enemyPos.y < this.gameSize.h)
    },

    clearBullets() {
        this.bulletsArr = this.bulletsArr.filter(bullet => bullet.bulletPos.y > 0 - bullet.bulletSize.h)

    },

    generateShootBonus() {
        if (this.framesIndex % 501 === 0 && this.framesIndex !== 0) {
            this.shootBonusArr.push(new ShootBonus(this.ctx, Math.random() * (this.gameSize.w - 550) + 250, Math.random() * (this.gameSize.h - 600) + 400))
        }
    },
    generateClearBonus() {
        if (this.framesIndex % 801 === 0 && this.framesIndex !== 0) {
            this.clearBonusArr.push(new ClearBonus(this.ctx, Math.random() * (this.gameSize.w - 550) + 250, Math.random() * (this.gameSize.h - 400) + 280))
        }
    },

    generateSlowBonus() {
        if (this.framesIndex % 1200 === 0 && this.framesIndex !== 0) {
            this.slowBonusArr.push(new SlowBonus(this.ctx, Math.random() * (this.gameSize.w - 550) + 250, Math.random() * (this.gameSize.h - 400) + 280))
        }
    },

    shoot() {
        if (this.canShoot) {
            let shootMusic = new Audio("./sounds/Bullet_sound.mov")
            shootMusic.play()
            this.bulletsArr.push(new Bullet(this.ctx, this.player.playerPos.x + 20, this.player.playerPos.y, 30, 40))
        }
    },

    playerEnemyCollision() {
        this.gameOver()
        this.highscore()
    },

    playerClearBonusCollision() {
        this.enemyArr.splice(0, this.enemyArr.length)
        this.clearBonusArr.splice(0, this.clearBonusArr.length)
        let clearBonusMusic = new Audio("./sounds/groot_sound.mp3")
        clearBonusMusic.volume = 1
        clearBonusMusic.play()
    },

    playerSlowBonusCollision() {
        this.enemySpeed = 0
        this.slowBonusArr.splice(0, this.slowBonusArr.length)
        let slowBonusMusic = new Audio("./sounds/groot_sound.mp3")
        slowBonusMusic.volume = 1
        slowBonusMusic.play()
    },

    playerShootBonusCollision() {
        this.canShoot = true
        this.shootBonusArr.splice(0, this.shootBonusArr.length)
        let shootBonusMusic = new Audio("./sounds/Jeff.mov")
        shootBonusMusic.volume = 1
        shootBonusMusic.play()
        window.setTimeout(() => {
            this.canShoot = false

        }, 2000);
    },

    gameStart() {
        clearInterval(this.interval)
        this.onPlaying = false

    },

    gameOver() {
        this.ctx.drawImage(this.imageInstanceGameOver, 0, 0, this.gameSize.w, this.gameSize.h)
        clearInterval(this.interval)
        this.onPlaying = false
        this.highScore = this.framesIndex * 30
    },

    loadImages() {
        this.imageInstanceGameOver = new Image()
        this.imageInstanceGameOver.src = './img/newGameOver.png'
        this.imageInstanceBackgroundImage = new Image()
        this.imageInstanceBackgroundImage.src = './img/fondo_3.png'
        this.imageInstanceAside1 = new Image()
        this.imageInstanceAside1.src = './img/ad_2.png'
        this.imageInstanceAside2 = new Image()
        this.imageInstanceAside2.src = './img/Captura de pantalla 2022-04-06 a las 16.40.51.png'
    }
}