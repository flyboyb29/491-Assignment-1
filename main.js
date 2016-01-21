var bx = 0;
var bx2 = 0;

function Animation(spriteSheet, back, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.back = back;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;

    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }

    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;

    ctx.drawImage(this.back, 0, 0, 200, 100, -bx2 + 511, 0, 800, 800);

    ctx.drawImage(this.back, 0, 0, 200, 100, -bx, 0, 800, 800);

    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Bleach(game, spritSheet, background) {
    this.runAnimation = new Animation(spritSheet, background, 5, 84, 62.375, 48, 0.1, 8, true, false);
    this.jumpAnimation = new Animation(spritSheet, background, 13, 455, 60, 68, 0.15, 5, false, false);
    this.standing = new Animation(spritSheet, background, 6, 3, 62.375, 68, .1, 1, true, false);
    this.blockingAnimation = new Animation(spritSheet, background, 78, 20, 62.375, 48, .1, 1, true, false);
    this.duckAnimation = new Animation(spritSheet, background, 263, 455, 60, 68, .1, 1, true, false);
    this.attackAnimation = new Animation(spritSheet, background, 10, 258, 62, 68, .1 , 6, false, false);
    this.blocking = false;
    this.jumping = false;
    this.attack = false;
    this.run = false;
    this.radius = 100;
    this.ground = 400;
    Entity.call(this, game, 0, 400);
}

Bleach.prototype = new Entity();
Bleach.prototype.constructor = Bleach;

Bleach.prototype.update = function () {
    var addspeed = 4;

    if (this.game.jump) this.jumping = true;
    if (this.game.swing) this.attack = true;
    this.run = this.game.run;
    this.blocking = this.game.block;
    this.duck = this.game.duck;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 150;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        var height = totalHeight * (-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
    } else if (this.attack) {
        if (this.attackAnimation.isDone()) {
            this.attackAnimation.elapsedTime = 0;
            this.attack = false;
        }
        switch (this.attackAnimation.currentFrame()) {
            case 1:
                this.attackAnimation.frameWidth = 76
                break;
            case 2:
                this.attackAnimation.frameWidth = 105;
                break;
            case 3:
                this.attackAnimation.frameWidth = 70;
                break;
            default:
                this.attackAnimation.frameWidth = 68;
        }
        console.log(this.attackAnimation.currentFrame() === 3);
    }
    if (this.run) {
        bx += addspeed;
        bx2 += addspeed;
    }

    Entity.prototype.update.call(this);
}

Bleach.prototype.draw = function (ctx) {
    //console.log(this.jumping);

    if (bx > 400) {
        bx = 0;
    }
    if (bx2 > 400) {
        bx2 = 0;
    }

    if (this.jumping) {
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 17, this.y - 34, 4);
    }
    else if (this.attack) {
        this.attackAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 4);
    }
    else if (this.run) {
        this.runAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 4);
    }
    else if (this.blocking) {
        this.blockingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 4);
    }
     else if (this.duck) {
        this.duckAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 4);
    } else {
        this.standing.drawFrame(this.game.clockTick, ctx, this.x, this.y, 4);
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/clouds.png");
ASSET_MANAGER.queueDownload("./img/bleach-char2.png");
ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    var hero1 = ASSET_MANAGER.getAsset("./img/bleach-char2.png");
    var cloud1 =  ASSET_MANAGER.getAsset("./img/clouds.png");

    var gameEngine = new GameEngine();
    var bleach = new Bleach(gameEngine, hero1, cloud1);

    gameEngine.addEntity(bleach);

    gameEngine.init(ctx);
    gameEngine.start();
});
