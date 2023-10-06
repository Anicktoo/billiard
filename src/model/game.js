import { Cue } from "./cue";
import { Ball } from "./ball";
import { Vector2 } from "../utils/vector";

export class Game {

    static WALL_RESTITUTION = 0.75;

    cue;
    view;
    balls;
    oldTime;
    _hitPower;
    _targetPos;
    tableWidth;
    _chosenBall;
    tableHeight;
    _isWaitingForHit;


    constructor(view, tableWidth, tableHeight, ballRadius) {
        this.view = view;
        this.tableWidth = tableWidth;
        this.tableHeight = tableHeight;
        this.cue = new Cue();
        Ball.radius = ballRadius;
        this.initBalls();
        this.oldTime = 0;
        this._isWaitingForHit = true;
        this._targetPos = new Vector2(0, 0);
        this.view.renderBalls(
            this.balls.map(el => el.pos),
            Ball.radius,
        );
    }

    initBalls() {
        this.balls = new Array(16);
        let radius = Ball.radius;
        let diameter = radius * 2;
        let xShiftSize = Math.sqrt(3 * radius * radius);
        let x = this.tableWidth / 3 * 2;
        let y = this.tableHeight / 2 - radius;
        let xShift = 0, yShift = 0, yInColumnShift = 0;
        let maxInLayer = 1;
        let addition = 2;
        this.balls[0] = new Ball(new Vector2(this.tableWidth / 3, y));
        this.chosenBall = this.balls[0];
        for (let i = 1; i < 16; i++) {
            this.balls[i] = new Ball(new Vector2(x + xShift, y + yShift + yInColumnShift));
            yInColumnShift += diameter + 1;
            if (i % maxInLayer === 0) {
                maxInLayer += addition;
                xShift += xShiftSize + 1;
                yShift -= radius;
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
            this.balls[i].simulate();
            this.checkBounds(this.balls[i]);
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
        if (!this.balls.includes(this._chosenBall) || !this._hitPower) {
            return;
        }
        this._isWaitingForHit = false;
        this._chosenBall.dir = this._targetPos.substract(this._chosenBall.pos);
        this._chosenBall.vel = this._hitPower * 20;
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
        else if (pos.x + Ball.radius >= this.tableWidth) {
            const newX = 2 * (this.tableWidth - Ball.radius) - pos.x;
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
        else if (pos.y + Ball.radius >= this.tableHeight) {
            const newY = 2 * (this.tableHeight - Ball.radius) - pos.y;
            ball.pos = new Vector2(pos.x, newY);
            ball.dir = new Vector2(dir.x, -dir.y);
            ball.vel *= Game.WALL_RESTITUTION;
        }
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
}