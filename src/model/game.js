import { Cue } from "./cue";
import { Ball } from "./ball";
import { Vector2 } from "../utils/vector";

export class Game {

    static TABLE_WIDTH = 2048;
    static TABLE_HEIGHT = 1024;
    static WALL_RESTITUTION = 0.65;
    static MAX_HIT_POWER = 30;
    static BALL_RADIUS = 20;

    cue;
    view;
    balls;
    oldTime;
    _hitPower;
    _targetPos;
    _chosenBall;
    _isFirstHit;
    _isWaitingForHit;


    constructor(view) {
        this.view = view;
        this.cue = new Cue();
        Ball.radius = Game.BALL_RADIUS;
        this.initBalls();
        this.oldTime = 0;
        this._isWaitingForHit = true;
        this._isFirstHit = true;
        this._targetPos = new Vector2(0, 0);
        this.view.renderBalls(
            this.balls.map(el => el.pos),
            Ball.radius,
        );
    }

    initBalls() {
        this.balls = new Array(16);
        let diameter = Ball.radius * 2;
        let xShiftSize = Math.sqrt(3 * Ball.radius * Ball.radius);
        let x = Game.TABLE_WIDTH / 3 * 2;
        let y = Game.TABLE_HEIGHT / 2;
        let xShift = 0, yShift = 0, yInColumnShift = 0;
        let maxInLayer = 1;
        let addition = 2;
        this.balls[0] = new Ball(new Vector2(Game.TABLE_WIDTH / 4, y));
        this.chosenBall = this.balls[0];
        for (let i = 1; i < 16; i++) {
            this.balls[i] = new Ball(new Vector2(x + xShift, y + yShift + yInColumnShift));
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

    //update game state, render, request new frame
    run() {
        if (!this._isWaitingForHit) {
            this.update();
            this.view.renderBalls(
                this.balls.map(el => el.pos),
                Ball.radius,
            );
        }
        else {
            this.view.renderCue(
                this.chosenBall.pos,
                this.targetPos,
                Ball.radius,
                this.hitPower
            );
        }
        requestAnimationFrame((time) => {
            // this.ball.fpsAdjust(time - this.old_time)
            this.oldTime = time;
            this.run();
        });
    }

    //update game state
    update() {
        let endOfMovement = true;
        for (let i = 0; i < this.balls.length; i++) {
            this.checkBounds(this.balls[i]);
            this.balls[i].simulate();
            for (let j = i + 1; j < this.balls.length; j++) {
                this.balls[i].collide(this.balls[j]);
            }
            if (this.balls[i].vel !== 0) {
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
        for (let i = 0; i < this.balls.length; i++) {
            let vectToBall = this.balls[i].pos.substract(pos);
            const dist = vectToBall.getLength();
            if (dist <= Ball.radius) {
                this._chosenBall = this.balls[i];
                return;
            }
        }
    }

    hitBall() {
        if (!this.balls.includes(this._chosenBall) || this._hitPower < 0.1) {
            return;
        }
        this._isWaitingForHit = false;
        this._isFirstHit = false;
        this._chosenBall.dir = this._targetPos.substract(this._chosenBall.pos);
        this._chosenBall.vel = this._hitPower * Game.MAX_HIT_POWER;
        console.log('model hit power: ' + this._chosenBall.vel);

        this.view.renderCue(
            this.chosenBall.pos,
            this.targetPos,
            Ball.radius,
        );
        this.view.fadeOutCue();
    }

    checkBounds(ball) {
        const pos = ball.pos;
        const dir = ball.dir;

        if (pos.x <= Ball.radius) {
            const newX = 2 * Ball.radius - pos.x;
            ball.pos = new Vector2(newX, pos.y);
            ball.dir = new Vector2(-dir.x, dir.y);
            ball.vel *= Game.WALL_RESTITUTION;
        }
        else if (pos.x + Ball.radius >= Game.TABLE_WIDTH) {
            const newX = 2 * (Game.TABLE_WIDTH - Ball.radius) - pos.x;
            ball.pos = new Vector2(newX, pos.y);
            ball.dir = new Vector2(-dir.x, dir.y);
            ball.vel *= Game.WALL_RESTITUTION;
        }
        if (pos.y <= Ball.radius) {
            const newY = 2 * Ball.radius - pos.y;
            ball.pos = new Vector2(pos.x, newY);
            ball.dir = new Vector2(dir.x, -dir.y);
            ball.vel *= Game.WALL_RESTITUTION;
        }
        else if (pos.y + Ball.radius >= Game.TABLE_HEIGHT) {
            const newY = 2 * (Game.TABLE_HEIGHT - Ball.radius) - pos.y;
            ball.pos = new Vector2(pos.x, newY);
            ball.dir = new Vector2(dir.x, -dir.y);
            ball.vel *= Game.WALL_RESTITUTION;
        }
    }

    restart() {
        this.initBalls();
        this._isWaitingForHit = true;
        this._isFirstHit = true;
        this.view.renderBalls(
            this.balls.map(el => el.pos),
            Ball.radius,
        );
    }

    set targetPos(pos) {
        this._targetPos = pos;
    }

    get targetPos() {
        return this._targetPos;
    }
    set chosenBall(ball) {
        this._chosenBall = ball;
    }

    get chosenBall() {
        return this._chosenBall;
    }
    set hitPower(power) {
        if (power < 0) {
            power = 0;
        }
        else if (power > 1) {
            power = 1;
        }
        this._hitPower = power;
    }

    get hitPower() {
        return this._hitPower;
    }

    set isWaitingForHit(bool) {
        this._isWaitingForHit = bool;
    }

    get isWaitingForHit() {
        return this._isWaitingForHit;
    }

    get canvasAdjKoef() {
        return this._canvasAdjKoef;
    }

}