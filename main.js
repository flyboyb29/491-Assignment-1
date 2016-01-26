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
// Block
function Block(game, startX, startY, width, height, color, trans, fill, border) {
    this.x = startX;
    this.y = startY;
    this.width = width;
    this.height = height;
    this.fColor = color;
    this.t = trans / 100;
    this.fill = fill;
    this.b = border;
    Entity.call(this, game, startX, startY);
    this.radius = width / 2;
}

Block.prototype = new Entity();
Block.prototype.constructor = Block;

Block.prototype.update = function () {
}

Block.prototype.draw = function (ctx) {
    ctx.fillStyle = this.fColor;
    ctx.globalAlpha = this.t;
    ctx.lineWidth = this.b;
    if (this.fill) {
        ctx.fillRect(this.x, this.y, this.width, this.height);
    } else {
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    };
    Entity.prototype.draw.call(this);
}

// Character
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
        this.attackAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y - 20, 4);
    }
    else if (this.run) {
        this.runAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 4);
    }
    else if (this.blocking) {
        this.blockingAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, 4);
    }
     else if (this.duck) {
        this.duckAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y - 70, 4);
    } else {
        this.standing.drawFrame(this.game.clockTick, ctx, this.x, this.y - 70, 4);
    }
    Entity.prototype.draw.call(this);
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./sound/bleachMain.mp3");
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

    // four move pad
    var run = new Block(gameEngine, 750, 750, 50, 50, "blue", 25, true, 10);
    var duck = new Block(gameEngine, 700, 750, 50, 50, "blue", 25, true, 10);
    var block = new Block(gameEngine, 650, 750, 50, 50, "blue", 25, true, 10);
    var jump = new Block(gameEngine, 700, 700, 50, 50, "blue", 25, true, 10);
    
    // outline the four buttons
    var outline1 = new Block(gameEngine, 750, 750, 50, 50, "black", 25, false, 1);
    var outline2 = new Block(gameEngine, 650, 750, 50, 50, "black", 25, false, 1);
    var outline3 = new Block(gameEngine, 700, 700, 50, 50, "black", 25, false, 1);

    // arrow right
    var rightArrow = [];
    rightArrow[0] = new Block(gameEngine, 770, 775, 3, 3, "black", 50, false, 1);
    rightArrow[1] = new Block(gameEngine, 773, 775, 3, 3, "black", 50, false, 1);
    rightArrow[2] = new Block(gameEngine, 776, 775, 3, 3, "black", 50, false, 1);
    rightArrow[3] = new Block(gameEngine, 779, 775, 3, 3, "black", 50, false, 1);
    rightArrow[4] = new Block(gameEngine, 782, 775, 3, 3, "black", 50, false, 1);
    rightArrow[5] = new Block(gameEngine, 785, 775, 3, 3, "black", 50, false, 1);
    rightArrow[6] = new Block(gameEngine, 782, 772, 3, 3, "black", 50, false, 1);
    rightArrow[7] = new Block(gameEngine, 782, 778, 3, 3, "black", 50, false, 1);
    rightArrow[8] = new Block(gameEngine, 779, 772, 3, 3, "black", 50, false, 1);
    rightArrow[9] = new Block(gameEngine, 779, 778, 3, 3, "black", 50, false, 1);
    rightArrow[10] = new Block(gameEngine, 779, 769, 3, 3, "black", 50, false, 1);
    rightArrow[11] = new Block(gameEngine, 779, 781, 3, 3, "black", 50, false, 1);

    // arrow left
    var left1 = new Block(gameEngine, 670, 775, 3, 3, "black", 50, false, 1);
    var left2 = new Block(gameEngine, 673, 775, 3, 3, "black", 50, false, 1);
    var left3 = new Block(gameEngine, 676, 775, 3, 3, "black", 50, false, 1);
    var left4 = new Block(gameEngine, 679, 775, 3, 3, "black", 50, false, 1);
    var left5 = new Block(gameEngine, 682, 775, 3, 3, "black", 50, false, 1);
    var left6 = new Block(gameEngine, 685, 775, 3, 3, "black", 50, false, 1);
    var left7 = new Block(gameEngine, 673, 772, 3, 3, "black", 50, false, 1);
    var left8 = new Block(gameEngine, 673, 778, 3, 3, "black", 50, false, 1);
    var left9 = new Block(gameEngine, 676, 772, 3, 3, "black", 50, false, 1);
    var left10 = new Block(gameEngine, 676, 778, 3, 3, "black", 50, false, 1);
    var left11 = new Block(gameEngine, 676, 769, 3, 3, "black", 50, false, 1);
    var left12 = new Block(gameEngine, 676, 781, 3, 3, "black", 50, false, 1);

    // arrow up
    var up1 = new Block(gameEngine, 725, 726, 3, 3, "black", 50, false, 1);
    var up2 = new Block(gameEngine, 725, 723, 3, 3, "black", 50, false, 1);
    var up3 = new Block(gameEngine, 725, 720, 3, 3, "black", 50, false, 1);
    var up4 = new Block(gameEngine, 725, 717, 3, 3, "black", 50, false, 1);
    var up5 = new Block(gameEngine, 725, 714, 3, 3, "black", 50, false, 1);
    var up6 = new Block(gameEngine, 725, 711, 3, 3, "black", 50, false, 1);
    var up7 = new Block(gameEngine, 722, 714, 3, 3, "black", 50, false, 1);
    var up8 = new Block(gameEngine, 728, 714, 3, 3, "black", 50, false, 1);
    var up9 = new Block(gameEngine, 722, 717, 3, 3, "black", 50, false, 1);
    var up10 = new Block(gameEngine, 728, 717, 3, 3, "black", 50, false, 1);
    var up11 = new Block(gameEngine, 719, 717, 3, 3, "black", 50, false, 1);
    var up12 = new Block(gameEngine, 731, 717, 3, 3, "black", 50, false, 1);

    // arrow down
    var down1 = new Block(gameEngine, 725, 770, 3, 3, "black", 50, false, 1);
    var down2 = new Block(gameEngine, 725, 773, 3, 3, "black", 50, false, 1);
    var down3 = new Block(gameEngine, 725, 776, 3, 3, "black", 50, false, 1);
    var down4 = new Block(gameEngine, 725, 779, 3, 3, "black", 50, false, 1);
    var down5 = new Block(gameEngine, 725, 782, 3, 3, "black", 50, false, 1);
    var down6 = new Block(gameEngine, 725, 785, 3, 3, "black", 50, false, 1);
    var down7 = new Block(gameEngine, 722, 782, 3, 3, "black", 50, false, 1);
    var down8 = new Block(gameEngine, 728, 782, 3, 3, "black", 50, false, 1);
    var down9 = new Block(gameEngine, 722, 779, 3, 3, "black", 50, false, 1);
    var down10 = new Block(gameEngine, 728, 779, 3, 3, "black", 50, false, 1);
    var down11 = new Block(gameEngine, 719, 779, 3, 3, "black", 50, false, 1);
    var down12 = new Block(gameEngine, 731, 779, 3, 3, "black", 50, false, 1);

    gameEngine.addEntity(bleach);
    gameEngine.addEntity(run);
    gameEngine.addEntity(duck);
    gameEngine.addEntity(block);
    gameEngine.addEntity(jump);
    gameEngine.addEntity(outline1);
    gameEngine.addEntity(outline2);
    gameEngine.addEntity(outline3);
    // right arrow
    gameEngine.addEntity(rightArrow[0]);
    gameEngine.addEntity(rightArrow[1]);
    gameEngine.addEntity(rightArrow[2]);
    gameEngine.addEntity(rightArrow[3]);
    gameEngine.addEntity(rightArrow[4]);
    gameEngine.addEntity(rightArrow[5]);
    gameEngine.addEntity(rightArrow[6]);
    gameEngine.addEntity(rightArrow[7]);
    gameEngine.addEntity(rightArrow[8]);
    gameEngine.addEntity(rightArrow[9]);
    gameEngine.addEntity(rightArrow[10]);
    gameEngine.addEntity(rightArrow[11]);
    // left arrow
    gameEngine.addEntity(left1);
    gameEngine.addEntity(left2);
    gameEngine.addEntity(left3);
    gameEngine.addEntity(left4);
    gameEngine.addEntity(left5);
    gameEngine.addEntity(left6);
    gameEngine.addEntity(left7);
    gameEngine.addEntity(left8);
    gameEngine.addEntity(left9);
    gameEngine.addEntity(left10);
    gameEngine.addEntity(left11);
    gameEngine.addEntity(left12);
    // up arrow
    gameEngine.addEntity(up1);
    gameEngine.addEntity(up2);
    gameEngine.addEntity(up3);
    gameEngine.addEntity(up4);
    gameEngine.addEntity(up5);
    gameEngine.addEntity(up6);
    gameEngine.addEntity(up7);
    gameEngine.addEntity(up8);
    gameEngine.addEntity(up9);
    gameEngine.addEntity(up10);
    gameEngine.addEntity(up11);
    gameEngine.addEntity(up12);
    // down arrow
    gameEngine.addEntity(down1);
    gameEngine.addEntity(down2);
    gameEngine.addEntity(down3);
    gameEngine.addEntity(down4);
    gameEngine.addEntity(down5);
    gameEngine.addEntity(down6);
    gameEngine.addEntity(down7);
    gameEngine.addEntity(down8);
    gameEngine.addEntity(down9);
    gameEngine.addEntity(down10);
    gameEngine.addEntity(down11);
    gameEngine.addEntity(down12);

    gameEngine.init(ctx);
    gameEngine.start();
});
