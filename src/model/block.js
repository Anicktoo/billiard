import { Vector2 } from "../utils/vector";

export class Block {

    static RESTITUTION = 0.65;
    _x;
    _y;
    _width;
    _height;

    constructor(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
    }

    findNearestVertexPos(pos) {
        const topLeftPos = new Vector2(this._x, this._y);
        const bottomRightPos = new Vector2(this._x + this._width, this.y + this._height);

        if (Math.abs(topLeftPos.x - pos.x) < Math.abs(bottomRightPos.x - pos.x)) {
            if (Math.abs(topLeftPos.y - pos.y) < Math.abs(bottomRightPos.y - pos.y)) {
                console.log('topLeft');
                return { pos: topLeftPos, horVector: new Vector2(-1, 0), vertVector: new Vector2(0, -1) };
            }
            else {
                console.log('bottomLeft');
                return { pos: new Vector2(this._x, this._y + this._height), horVector: new Vector2(-1, 0), vertVector: new Vector2(0, 1) };
            }
        }
        else {
            if (Math.abs(topLeftPos.y - pos.y) < Math.abs(bottomRightPos.y - pos.y)) {
                console.log('topRight');
                return { pos: new Vector2(this._x + this._width, this._y), horVector: new Vector2(1, 0), vertVector: new Vector2(0, -1) };
            }
            else {
                console.log('bottomRight');
                return { pos: bottomRightPos, horVector: new Vector2(1, 0), vertVector: new Vector2(0, 1) };
            }
        }
    }

    collide(ball, ballRadius) {
        // if (this._x === 136.5685424949238 && this._y === 944) {
        //     console.log(ball.dir);
        // }

        const ballNextPos = ball.pos.add(ball.dir, ball.vel);

        //check if square around ball intersects with block
        if (!this.isNextPosInBox(ballRadius, ballNextPos)) {
            return;
        }

        //collision with vertical edge
        if (ballNextPos.y > this._y && ballNextPos.y < this._y + this._height) {
            ball.dir.x *= -1;
            ball.vel *= Block.RESTITUTION;
            this.checkTrappedBall(ball, ballRadius);
        }
        //collision with horizontal edge
        else if (ballNextPos.x > this._x && ballNextPos.x < this._x + this._width) {
            ball.dir.y *= -1;
            ball.vel *= Block.RESTITUTION;
            this.checkTrappedBall(ball, ballRadius);
        }
        //collision with corner
        else {
            console.log(ball.dir, ball.pos);

            //check if ball intersects with corners
            const nearestVertex = this.findNearestVertexPos(ballNextPos);
            const vertexToBallVector = ballNextPos.substract(nearestVertex.pos);
            const vertexToBallDist = vertexToBallVector.getLength();
            if (vertexToBallDist > ballRadius) {
                return;
            }

            let normal = vertexToBallVector.getNormalized();

            //For cases when normal vector is chosen incorrectly we return it to possible range
            if (Math.abs(nearestVertex.horVector.x - normal.x) > 1) {
                console.log('hor normal change');
                normal = nearestVertex.vertVector;
            }
            else if (Math.abs(nearestVertex.vertVector.y - normal.y) > 1) {
                console.log('vert normal change');
                normal = nearestVertex.horVector;
            }

            const doubledProjectionLength = 2 * ball.dir.dot(normal);
            ball.dir = ball.dir.substract(normal.scale(doubledProjectionLength));

            //correction, so the ball wouldn't stuck in the corner
            ball.pos = ball.pos.add(normal, ballRadius - vertexToBallDist);

            ball.vel *= Block.RESTITUTION;
        }

    }

    //check if ball due to descrete steps collided with a wrong edge and reflected inside the block
    checkTrappedBall(ball, ballRadius) {
        const ballNextPos = ball.pos.add(ball.dir, ball.vel);
        if (this.isNextPosInBox(ballRadius, ballNextPos)) {
            console.log('ball trap is avoided');
            ball.dir.x *= -1;
            ball.dir.y *= -1;
        }
    }

    //if next ball position will be withtin block
    isNextPosInBox(ballRadius, ballNextPos) {
        return ballNextPos.x + ballRadius > this._x &&
            ballNextPos.x - ballRadius < this._x + this._width &&
            ballNextPos.y + ballRadius > this._y &&
            ballNextPos.y - ballRadius < this._y + this._height;
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

    get width() {
        return this._width;
    }
    set width(value) {
        this._width = value;
    }

    get height() {
        return this._height;
    }
    set height(value) {
        this._height = value;
    }
}