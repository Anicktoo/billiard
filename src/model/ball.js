import { Vector2 } from "../utils/vector";

export class Ball {

    static radius;
    static frictionKoef;
    static restitution;
    _pos;
    _dir;
    _vel;

    constructor(position) {
        this._pos = position;
        this._dir = new Vector2(0, 0);
        this._vel = 0;
    }

    set(position, dir, vel) {
        this.pos = position;
        this.dir = dir;
        this.vel = vel;
    }

    simulate() {
        this.move();
        // this.slowDown();
    }

    slowDown() {
        this._vel -= Ball.frictionKoef;
        if (this._vel < 0) {
            this._vel = 0;
        }
    }

    move() {
        this._pos = this._pos.add(this._dir, this._vel);
    }

    collide(ball) {
        let dirFromFirstToSecond = this.pos.substract(ball.pos);
        const dist = dirFromFirstToSecond.getLength();
        if (dist === 0.0 || dist > 2 * Ball.radius) {
            return;
        }

        dirFromFirstToSecond = dirFromFirstToSecond.scale(1 / dist);
    }

    get pos() {
        return this._pos;
    }
    set pos(pos) {
        this._pos = pos;
    }
    get dir() {
        return this._dir;
    }
    set dir(dir) {
        if (!dir.isNormal()) {
            this._dir = dir.getNormalized();
        }
        else {
            this._dir = dir;
        }
    }
    get vel() {
        return this._vel;
    }
    set vel(vel) {
        this._vel = vel;
    }
}