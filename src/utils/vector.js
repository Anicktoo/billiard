export class Vector2 {

    _x;
    _y;

    constructor(x, y) {
        this._x = x;
        this._y = y;
    }

    getLength() {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    }

    isNormal() {
        return this.getLength() === 1;
    }

    getNormalized() {
        const length = this.getLength();
        if (!length) {
            return new Vector2(0, 0);
        }
        const newX = this._x / length;
        const newY = this._y / length;
        return new Vector2(newX, newY);
    }

    add(v, k = 1) {
        return new Vector2(
            this._x + v.x * k,
            this._y + v.y * k);
    }

    substract(v2) {
        return new Vector2(this._x - v2.x, this._y - v2.y);
    }

    scale(k) {
        return new Vector2(this._x * k, this._y * k);
    }

    dot(v) {
        return this._x * v.x + this._y * v.y;
    }

    getVectorInRotatedBasis(angle) {
        //clockwise rotation
        return new Vector2(
            this._x * Math.cos(angle) + this._y * Math.sin(angle),
            this._x * -Math.sin(angle) + this._y * Math.cos(angle),
        );
    }

    isZero() {
        return this._x === 0 && this._y === 0;
    }

    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
    }
}