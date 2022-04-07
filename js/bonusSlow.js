class SlowBonus {
    constructor(ctx, posX, posY) {
        this.ctx = ctx
        this.slowBonusPos = { x: posX, y: posY }
        this.slowBonusSize = { w: 50, h: 50 }

        this.imageInstance = undefined

        this.init()
    }

    init() {
        this.imageInstance = new Image()
        this.imageInstance.src = './img/slow_bonus.png'
    }

    draw() {
        this.ctx.drawImage(this.imageInstance, this.slowBonusPos.x, this.slowBonusPos.y, this.slowBonusSize.w, this.slowBonusSize.h)
    }
}