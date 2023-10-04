export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    isNormal() {
        return this.getLength() === 1;
    }

    getNormalized() {
        const length = this.getLength();
        const newX = this.x / length;
        const newY = this.y / length;
        return new Vector2(newX, newY);
    }

    add(v, k = 1) {
        return new Vector2(
            this.x + v.x * k,
            this.y + v.y * k);
    }

    substact(v2) {
        return new Vector2(this.x - v2.x, this.y - v2.y);
    }

    scale(k) {
        return new Vector2(this.x * k, this.y * k);
    }

    dot(v) {
        return new Vector2(this.x * v.x + this.y * v.y);
    }

}