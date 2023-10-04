import { Cue } from "./cue";
import { Ball } from "./ball";
import { Vector2 } from "../utils/vector";

export class Game {

    cue;
    view;
    balls;
    oldTime;
    tableWidth;
    tableHeight;
    gameIsRunning;


    constructor(view, tableWidth, tableHeight, ballRadius, frictionKoef, restitution) {
        this.view = view;
        this.tableWidth = tableWidth;
        this.tableHeight = tableHeight;
        this.cue = new Cue();
        Ball.radius = ballRadius;
        Ball.frictionKoef = frictionKoef;
        Ball.restitution = restitution;
        this.initBalls();
        this.oldTime = 0;
        this.gameIsRunning = false;
    }

    start() {
        this.gameIsRunning = true;
        this.run();
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
        this.balls[0].set(new Vector2(this.tableWidth / 3, y), new Vector2(1, 1), 10);
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
        this.update();
        if (this.gameIsRunning) {
            this.view.render(
                this.balls.map(el => el.pos),
                Ball.radius,
            );
            requestAnimationFrame((time) => {
                // this.ball.fpsAdjust(time - this.old_time)
                this.oldTime = time;
                this.run();
            });
        }
    }

    //update game state
    update() {
        for (let ball of this.balls) {
            ball.simulate();
            this.checkBounds(ball);
        }
    }

    checkBounds(ball) {
        const pos = ball.pos;
        const dir = ball.dir;
        console.log(Ball.radius);

        if (pos.x <= Ball.radius) {
            const newX = 2 * Ball.radius - pos.x;
            ball.pos = new Vector2(newX, pos.y);
            ball.dir = new Vector2(-dir.x, dir.y);
        }
        else if (pos.x + Ball.radius >= this.tableWidth) {
            const newX = 2 * (this.tableWidth - Ball.radius) - pos.x;
            ball.pos = new Vector2(newX, pos.y);
            ball.dir = new Vector2(-dir.x, dir.y);
        }
        if (pos.y <= Ball.radius) {
            const newY = 2 * Ball.radius - pos.y;
            ball.pos = new Vector2(pos.x, newY);
            ball.dir = new Vector2(dir.x, -dir.y);
        }
        else if (pos.y + Ball.radius >= this.tableHeight) {
            const newY = 2 * (this.tableHeight - Ball.radius) - pos.y;
            ball.pos = new Vector2(pos.x, newY);
            ball.dir = new Vector2(dir.x, -dir.y);
        }
    }
}