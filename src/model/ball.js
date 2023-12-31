import { Vector2 } from "../utils/vector";

export class Ball {

    static RESTITUTION = 0.8;
    static FRICTION_KOEF = 0.03;
    static radius;
    static adjusted_friction_koef;

    _pos;
    _dir;
    _vel;
    _type;


    constructor(position, type = 'ordinary') {
        this._pos = position;
        this._dir = new Vector2(0, 0);
        this._vel = 0;
        this._removed = false;
        this._type = type;
    }

    simulate() {
        this.move();
        this.slowDown();
    }

    slowDown() {
        this._vel -= Ball.FRICTION_KOEF;
        if (this._vel < 0) {
            this._vel = 0;
        }
    }

    move() {
        this._pos = this._pos.add(this._dir, this._vel);
    }

    collide(ball) {
        let dirFromSecondToFirst = this.pos.substract(ball.pos);
        const dist = dirFromSecondToFirst.getLength();
        if (dist === 0 || dist >= 2 * Ball.radius) {
            return;
        }

        dirFromSecondToFirst = dirFromSecondToFirst.getNormalized();

        const correction = (2 * Ball.radius - dist) / 2;
        this.pos = this.pos.add(dirFromSecondToFirst, correction);
        ball.pos = ball.pos.add(dirFromSecondToFirst, -correction);
        const velVect1 = this.dir.scale(this.vel);
        const velVect2 = ball.dir.scale(ball.vel);
        const vel1Projection = velVect1.dot(dirFromSecondToFirst);
        const vel2Projection = velVect2.dot(dirFromSecondToFirst);

        const newVel1Projection = (vel1Projection + vel2Projection - (vel1Projection - vel2Projection) * Ball.RESTITUTION) / 2;
        const newVel2Projection = (vel1Projection + vel2Projection - (vel2Projection - vel1Projection) * Ball.RESTITUTION) / 2;

        const newVelVect1 = velVect1.add(dirFromSecondToFirst, newVel1Projection - vel1Projection);
        const newVelVect2 = velVect2.add(dirFromSecondToFirst, newVel2Projection - vel2Projection);

        this.dir = newVelVect1.getNormalized();
        ball.dir = newVelVect2.getNormalized();
        this.vel = newVelVect1.getLength();
        ball.vel = newVelVect2.getLength();
    }

    isInPocket(pocketPos, pocketRadius) {
        return (this._pos.substract(pocketPos).getLength() <= pocketRadius);
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
        if (vel < 0) {
            vel *= -1;
            this.dir = this.dir.scale(-1);
        }
        this._vel = vel;
    }

    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
}