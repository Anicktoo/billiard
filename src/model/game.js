import { Ball } from './ball';
import { Vector2 } from '../utils/vector';
import { Block } from './block';

export class Game {

    static WALL_WIDTH = 80;
    static BALL_RADIUS = 20;
    static TABLE_WIDTH = 2048;
    static TABLE_HEIGHT = 1024;
    static INTENDED_FPS = 60;
    static MAX_HIT_POWER = 30;
    static POCKET_RADIUS = 35;
    static WALL_RESTITUTION = 0.65;
    static POCKET_SHIFT_KOEF = 0.5;

    _view;
    _balls;
    _walls;
    _pockets;
    _hitPower;
    _targetPos;
    _chosenBall;
    _isFirstHit;
    _isWaitingForHit;


    constructor(view) {
        this._view = view;
        Ball.radius = Game.BALL_RADIUS;
        this._oldTime = 0;
        this._fpsAdhustKoef = 1;
        this._isWaitingForHit = true;
        this._isFirstHit = true;
        this._hitPower = 0;
        this._targetPos = new Vector2(0, 0);
        this.initPockets();
        this.initWalls();
        this.initBalls();
        this.renderGame();
        // this.testingStart();
    }

    renderGame() {
        this._view.renderTable(Game.POCKET_RADIUS);
        this._view.renderWalls(
            this._walls,
            Game.POCKET_RADIUS,
            Game.WALL_WIDTH
        );
        this._view.renderPockets(
            this._pockets,
            Game.POCKET_RADIUS,
            Game.WALL_WIDTH,
            Game.POCKET_SHIFT_KOEF
        );
        this._view.renderBalls(
            this._balls,
            Ball.radius,
        );
    }

    //testing method
    testingStart() {
        this._isWaitingForHit = false;
        this._chosenBall.dir = new Vector2(-0.6865867239941715, 0.6370479148137013);
        this._chosenBall.vel = 10;
    }

    initBalls() {
        this._balls = new Array(16);
        let diameter = Ball.radius * 2;
        let xShiftSize = Math.sqrt(3 * Ball.radius * Ball.radius);
        let x = Game.TABLE_WIDTH / 3 * 2;
        let y = Game.TABLE_HEIGHT / 2;
        let xShift = 0, yShift = 0, yInColumnShift = 0;
        let maxInLayer = 1;
        let addition = 2;
        this._balls[0] = new Ball(new Vector2(Game.TABLE_WIDTH / 4, y), 'main');
        this.chosenBall = this._balls[0];
        for (let i = 1; i < 16; i++) {
            this._balls[i] = new Ball(new Vector2(x + xShift, y + yShift + yInColumnShift));
            yInColumnShift += diameter + 1;
            if (i % maxInLayer === 0) {
                maxInLayer += addition;
                xShift += xShiftSize + 1;
                yShift -= Ball.radius;
                yInColumnShift = 0;
                addition++;
            }
        }
    }

    initWalls() {
        const pRadius = Game.POCKET_RADIUS;
        const pWidth = pRadius * 2;
        const tWidth = Game.TABLE_WIDTH;
        const tHeight = Game.TABLE_HEIGHT;
        const wallWidth = Game.WALL_WIDTH;
        const cornerWallWidth = 2 * wallWidth;
        const pocketSideShift = Math.sqrt(pWidth * pWidth / 2) + wallWidth;
        const horWallLength = (tWidth - pWidth - 2 * pocketSideShift) / 2;
        const vertWallLength = (tHeight - 2 * pocketSideShift);
        const secondRowXStart = pocketSideShift + horWallLength + pWidth;
        this._walls = [];
        //two upper walls
        this._walls[0] = new Block(pocketSideShift, 0, horWallLength, wallWidth);
        this._walls[1] = new Block(secondRowXStart, 0, horWallLength, wallWidth);
        //two bottom walls
        this._walls[2] = new Block(pocketSideShift, tHeight - wallWidth, horWallLength, wallWidth);
        this._walls[3] = new Block(secondRowXStart, tHeight - wallWidth, horWallLength, wallWidth);
        //left wall
        this._walls[4] = new Block(0, pocketSideShift, wallWidth, vertWallLength);
        //right wall
        this._walls[5] = new Block(tWidth - wallWidth, pocketSideShift, wallWidth, vertWallLength);

        //additional corner walls
        //from top left corner (most left triangle) clockwise for each side
        this._walls[6] = new Block(wallWidth, pocketSideShift, cornerWallWidth, cornerWallWidth, Math.PI * 3 / 4);
        this._walls[7] = new Block(pocketSideShift, wallWidth, cornerWallWidth, cornerWallWidth, -Math.PI * 3 / 4);

        this._walls[8] = new Block(tWidth - wallWidth, pocketSideShift, cornerWallWidth, cornerWallWidth, -Math.PI / 4);
        this._walls[9] = new Block(tWidth - pocketSideShift, wallWidth, cornerWallWidth, cornerWallWidth, -Math.PI * 3 / 4);

        this._walls[10] = new Block(tWidth - wallWidth, tHeight - pocketSideShift, cornerWallWidth, cornerWallWidth, -Math.PI / 4);
        this._walls[11] = new Block(tWidth - pocketSideShift, tHeight - wallWidth, cornerWallWidth, cornerWallWidth, Math.PI / 4);

        this._walls[12] = new Block(wallWidth, tHeight - pocketSideShift, cornerWallWidth, cornerWallWidth, Math.PI * 3 / 4);
        this._walls[13] = new Block(pocketSideShift, tHeight - wallWidth, cornerWallWidth, cornerWallWidth, Math.PI / 4);
    }

    initPockets() {
        const pR = Game.POCKET_RADIUS;
        const pocketCenterShift = pR * (1 + Game.POCKET_SHIFT_KOEF);
        const tWidth = Game.TABLE_WIDTH;
        const tHeight = Game.TABLE_HEIGHT;
        this._pockets = [];
        //numbers to corner pockets are given starting with top left clockwise
        this._pockets[0] = new Vector2(pocketCenterShift, pocketCenterShift);
        this._pockets[1] = new Vector2(tWidth - pocketCenterShift, pocketCenterShift);
        this._pockets[2] = new Vector2(tWidth - pocketCenterShift, tHeight - pocketCenterShift);
        this._pockets[3] = new Vector2(pocketCenterShift, tHeight - pocketCenterShift);
        //middle pockets top and bottom
        this._pockets[4] = new Vector2(tWidth / 2, pocketCenterShift);
        this._pockets[5] = new Vector2(tWidth / 2, tHeight - pocketCenterShift);
    }

    //start game and adjust fps
    async start() {
        let then = performance.now();
        const interval = 1000 / Game.INTENDED_FPS;
        let delta = 0;
        while (true) {
            let now = await new Promise(requestAnimationFrame);
            if (now - then < interval - delta) {
                continue;
            }
            delta = Math.min(interval, delta + now - then - interval);
            then = now;

            this.run();
        }
    }

    //update game state and render
    run() {
        //ball moving phase
        if (!this._isWaitingForHit) {
            this.update();
            this._view.renderBalls(
                this._balls,
                Ball.radius,
            );
        }
        //hitting phase
        else {
            this._view.fadeOutStop();
            this._view.renderCue(
                this._chosenBall.pos,
                this._targetPos,
                Ball.radius,
                this._hitPower
            );
            const intersection = this.updateTargetPoint();
            this._view.showAimLine(this._chosenBall, intersection.pos, intersection.fromBallDir, Ball.radius);
        }
        this._view.animate();
    }

    //update game state
    update() {
        let endOfMovement = true;
        let curBall;

        out: for (let i = 0; i < this._balls.length; i++) {
            curBall = this._balls[i];

            for (let j = i + 1; j < this._balls.length; j++) {
                curBall.collide(this._balls[j]);
            }

            for (let wall of this._walls) {
                wall.collide(curBall, Ball.radius);
            }

            curBall.simulate();

            for (let pocket of this._pockets) {
                if (this.checkPocket(pocket, curBall)) {
                    this._view.animatePocketHitStart(pocket, curBall, Ball.radius);
                    this._balls.splice(i, 1);
                    if (!this._balls) {
                        this.endGame();
                        return;
                    }
                    if (this._chosenBall === curBall) {
                        this._chosenBall = this._balls[0];
                    }
                    i--;
                    continue out;
                }
            }

            if (curBall.vel !== 0) {
                endOfMovement = false;
            }
        }


        if (endOfMovement) {
            this._isWaitingForHit = true;
            if (this._balls.length < 2) {
                this.endGame();
                return;
            }
        }
    }

    chooseBall(pos) {
        if (this._isFirstHit) {
            return;
        }
        for (let i = 0; i < this._balls.length; i++) {
            let vectToBall = this._balls[i].pos.substract(pos);
            const dist = vectToBall.getLength();
            if (dist <= Ball.radius) {
                this._chosenBall = this._balls[i];
                return;
            }
        }
    }

    hitBall() {
        if (!this._balls.includes(this._chosenBall) || this._hitPower < 0.05) {
            return;
        }

        this._isWaitingForHit = false;
        this._isFirstHit = false;
        this._chosenBall.dir = this._targetPos.substract(this._chosenBall.pos);
        this._chosenBall.vel = this._hitPower * Game.MAX_HIT_POWER;

        this._view.renderCue(
            this.chosenBall.pos,
            this.targetPos,
            Ball.radius,
        );
        this._view.fadeOutStart();
        // this._view.fadeOutCue();
    }

    updateTargetPoint() {
        if (!this._chosenBall) {
            return;
        }
        //object in which we contain info about intesection position and direction from chosen ball to intersection
        let intersection = {};
        const dir = this._targetPos.substract(this._chosenBall.pos).getNormalized();
        intersection.fromBallDir = dir;
        let minDist = Number.POSITIVE_INFINITY;

        for (let ball of this._balls) {
            if (ball === this._chosenBall) {
                continue;
            }
            minDist = this.findIntersectionDistOfLineAndCircle(dir, this._chosenBall.pos, ball.pos, minDist, Ball.radius);
        }
        if (Number.isFinite(minDist)) {
            intersection.pos = this._chosenBall.pos.add(dir, minDist);
        }
        else {
            intersection.pos = this.findIntersectionWithWall(dir.x, dir.y, this._chosenBall.pos.x, this._chosenBall.pos.y);
        }

        return intersection;
    }

    findIntersectionWithWall(dirX, dirY, startX, startY) {
        const intersection = new Vector2(0, 0);
        let lengthToWallX;
        let lengthToWallY;
        let forwardX = 1;
        let forwardY = 1;

        if (dirX > 0) {
            lengthToWallX = Game.TABLE_WIDTH - Game.WALL_WIDTH - startX;
            intersection.x = Game.TABLE_WIDTH - Game.WALL_WIDTH;
        }
        else {
            lengthToWallX = startX - Game.WALL_WIDTH;
            intersection.x = Game.WALL_WIDTH;
            forwardX = -1;
        }

        if (dirY < 0) {
            lengthToWallY = startY - Game.WALL_WIDTH;
            intersection.y = Game.WALL_WIDTH;
            forwardY = -1;
        }
        else {
            lengthToWallY = Game.TABLE_HEIGHT - Game.WALL_WIDTH - startY;
            intersection.y = Game.TABLE_HEIGHT - Game.WALL_WIDTH;
        }


        let isVerticalWallIntesection = false;
        if (dirX === 0) {
            isVerticalWallIntesection = false;
        }
        else if (dirY === 0) {
            isVerticalWallIntesection = true;
        }
        else if (lengthToWallX / Math.abs(dirX) < lengthToWallY / Math.abs(dirY)) {
            isVerticalWallIntesection = true;
        }
        else {
            isVerticalWallIntesection = false;
        }


        const angle = Math.acos(Math.abs(dirX));

        if (isVerticalWallIntesection) {
            lengthToWallY = lengthToWallX * Math.tan(angle);
            intersection.y = startY + lengthToWallY * forwardY;
        }
        else {
            lengthToWallX = lengthToWallY / Math.tan(angle);
            intersection.x = startX + lengthToWallX * forwardX;
        }

        return intersection;
    }

    // method works with a circle in the center of coordinats
    findIntersectionDistOfLineAndCircle(dir, startPos, ballPos, distMax, r) {
        const fromTarget = startPos.substract(ballPos);
        const b = 2 * fromTarget.dot(dir);
        const c = fromTarget.dot(fromTarget) - r * r;
        const D = b * b - 4 * c;

        if (D < 0) {
            return distMax;
        }

        let dist1 = (-b - Math.sqrt(D)) / 2;
        let dist2 = (-b + Math.sqrt(D)) / 2;

        let dist = Math.min(dist1, dist2);

        if (dist < 0 || dist > distMax) {
            return distMax;
        }

        return dist;
    }

    checkPocket(pocket, ball) {
        return ball.pos.substract(pocket).getLength() < Game.POCKET_RADIUS;
    }

    endGame() {
        this.restart();
    }

    restart() {
        this.initBalls();
        this._isWaitingForHit = true;
        this._isFirstHit = true;
        this._hitPower = 0;
        this._view.renderBalls(
            this._balls,
            Ball.radius,
        );
    }


    set targetPos(value) {
        this._targetPos = value;
    }
    get targetPos() {
        return this._targetPos;
    }

    set chosenBall(value) {
        this._chosenBall = value;
    }
    get chosenBall() {
        return this._chosenBall;
    }

    set hitPower(value) {
        if (value < 0) {
            value = 0;
        }
        else if (value > 1) {
            value = 1;
        }
        this._hitPower = value;
    }
    get hitPower() {
        return this._hitPower;
    }

    set isWaitingForHit(value) {
        this._isWaitingForHit = value;
    }
    get isWaitingForHit() {
        return this._isWaitingForHit;
    }

    get canvasAdjKoef() {
        return this._canvasAdjKoef;
    }

}