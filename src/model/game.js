import { Ball } from './ball';
// import { Block } from './block';
import { Vector2 } from '../utils/vector';
import { Block } from './block';

export class Game {

    static TABLE_WIDTH = 2048;
    static TABLE_HEIGHT = 1024;
    static POCKET_RADIUS = 40;
    static WALL_WIDTH = 80;
    static WALL_RESTITUTION = 0.65;
    static MAX_HIT_POWER = 30;
    static BALL_RADIUS = 25;

    _view;
    _balls;
    _walls;
    _pockets;
    _oldTime;
    _hitPower;
    _targetPos;
    _chosenBall;
    _isFirstHit;
    _isWaitingForHit;


    constructor(view) {
        this._view = view;
        Ball.radius = Game.BALL_RADIUS;
        this._oldTime = 0;
        this._isWaitingForHit = true;
        this._isFirstHit = true;
        this._targetPos = new Vector2(0, 0);

        this.initPockets();
        this.initWalls();
        this.initBalls();

        this._view.renderTable();
        this._view.renderPockets(
            this._pockets,
            Game.POCKET_RADIUS
        );
        this._view.renderWalls(
            this._walls.map(el => {
                return { x: el.x, y: el.y, width: el.width, height: el.height }
            })
        );
        this._view.renderBalls(
            this._balls,
            Ball.radius,
        );

        // this.testingStart();
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
        const pWidth = Game.POCKET_RADIUS * 2;
        const tWidth = Game.TABLE_WIDTH;
        const tHeight = Game.TABLE_HEIGHT;
        const wallWidth = Game.WALL_WIDTH;
        const pocketSideShift = Math.sqrt(pWidth * pWidth / 2) + wallWidth;
        const horWallLength = (tWidth - pWidth - 2 * pocketSideShift) / 2;
        const vertWallLength = (tHeight - 2 * pocketSideShift);
        const secondRowXStart = pocketSideShift + horWallLength + pWidth;
        this._walls = new Array(6);
        this._walls[0] = new Block(pocketSideShift, 0, horWallLength, wallWidth);
        this._walls[1] = new Block(secondRowXStart, 0, horWallLength, wallWidth);
        this._walls[2] = new Block(pocketSideShift, tHeight - wallWidth, horWallLength, wallWidth);
        this._walls[3] = new Block(secondRowXStart, tHeight - wallWidth, horWallLength, wallWidth);
        this._walls[4] = new Block(0, pocketSideShift, wallWidth, vertWallLength);
        this._walls[5] = new Block(tWidth - wallWidth, pocketSideShift, wallWidth, vertWallLength);
    }

    initPockets() {
        const pR = Game.POCKET_RADIUS;
        const tWidth = Game.TABLE_WIDTH;
        const tHeight = Game.TABLE_HEIGHT;
        const wallWidth = Game.WALL_WIDTH;
        // const pocketSideShift = Math.sqrt(pR * pR / 2);
        this._pockets = [];

        this._pockets[0] = new Vector2(wallWidth, wallWidth);
        this._pockets[1] = new Vector2(tWidth / 2, wallWidth - pR);
        this._pockets[2] = new Vector2(tWidth - wallWidth, wallWidth);
        this._pockets[3] = new Vector2(tWidth - wallWidth, tHeight - wallWidth);
        this._pockets[4] = new Vector2(tWidth / 2, tHeight - wallWidth + pR);
        this._pockets[5] = new Vector2(wallWidth, tHeight - wallWidth);

    }

    //update game state, render, request new frame
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
                this.chosenBall.pos,
                this.targetPos,
                Ball.radius,
                this.hitPower
            );
        }
        requestAnimationFrame((time) => {
            // this.ball.fpsAdjust(time - this.old_time)
            this._oldTime = time;
            this.run();
        });
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
                    this._balls.splice(i, 1);
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
        console.log('model hit power: ' + this._chosenBall.vel);

        this._view.renderCue(
            this.chosenBall.pos,
            this.targetPos,
            Ball.radius,
        );
        this._view.fadeOutCue();
    }


    checkPocket(pocket, ball) {
        return ball.pos.substract(pocket).getLength() < Game.POCKET_RADIUS;
    }

    restart() {
        this.initBalls();
        this._isWaitingForHit = true;
        this._isFirstHit = true;
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