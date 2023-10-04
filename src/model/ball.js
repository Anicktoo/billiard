import { Vector2 } from "../utils/vector";

export class Ball {

    static radius;
    static frictionKoef;
    pos;
    dir;
    vel;

    constructor(position) {
        this.pos = position;
        this.dir = new Vector2(0, 0);
        this.vel = 0;
    }

    set(position, dir, vel) {
        this.pos = position;
        this.dir = dir;
        this.vel = vel;
    }

    simulate() {
        this.move();
        this.vel -= Ball.frictionKoef;
        if (this.vel < 0) {
            this.vel = 0;
        }
    }

    move() {
        this.pos = this.pos.add(this.dir, this.vel);
    }

    getPosition() {
        return {
            x: this.pos.x,
            y: this.pos.y
        }
    }
}