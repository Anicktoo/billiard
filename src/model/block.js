import { Vector2 } from "../utils/vector";

export class Block {

    static RESTITUTION = 0.7;

    _x;
    _y;
    _width;
    _height;
    _rotate;


    constructor(x, y, width, height, rotate = 0) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._rotate = rotate;
    }

    findNearestVertexPos(ballPos, blockPos) {
        const topLeftPos = new Vector2(blockPos.x, blockPos.y);
        const bottomRightPos = new Vector2(blockPos.x + this._width, this.y + this._height);

        if (Math.abs(topLeftPos.x - ballPos.x) < Math.abs(bottomRightPos.x - ballPos.x)) {
            if (Math.abs(topLeftPos.y - ballPos.y) < Math.abs(bottomRightPos.y - ballPos.y)) {
                // console.log('topLeft');
                return { pos: topLeftPos, horVector: new Vector2(-1, 0), vertVector: new Vector2(0, -1) };
            }
            else {
                // console.log('bottomLeft');
                return { pos: new Vector2(blockPos.x, blockPos.y + this._height), horVector: new Vector2(-1, 0), vertVector: new Vector2(0, 1) };
            }
        }
        else {
            if (Math.abs(topLeftPos.y - ballPos.y) < Math.abs(bottomRightPos.y - ballPos.y)) {
                // console.log('topRight');
                return { pos: new Vector2(blockPos.x + this._width, blockPos.y), horVector: new Vector2(1, 0), vertVector: new Vector2(0, -1) };
            }
            else {
                // console.log('bottomRight');
                return { pos: bottomRightPos, horVector: new Vector2(1, 0), vertVector: new Vector2(0, 1) };
            }
        }
    }

    collide(ball, ballRadius) {
        let ballPos, ballDir, blockPos;
        //If block is rotated we switch to a new basis
        let test = false;
        test;
        if (this._rotate) {
            test = true;
            ballPos = ball.pos.getVectorInRotatedBasis(this._rotate);
            ballDir = ball.dir.getVectorInRotatedBasis(this._rotate);
            blockPos = new Vector2(this._x, this._y).getVectorInRotatedBasis(this._rotate);
        }
        else {
            ballPos = ball.pos;
            ballDir = ball.dir;
            blockPos = new Vector2(this._x, this._y);
        }
        const ballNextPos = ballPos.add(ballDir, ball.vel);

        //check if square around ball intersects with block
        if (!this.isNextPosInBox(ballRadius, ballNextPos, blockPos)) {
            return;
        }

        //collision with vertical edge
        if (ballNextPos.y > blockPos.y && ballNextPos.y < blockPos.y + this._height) {
            ballDir.x *= -1;
            ball.vel *= Block.RESTITUTION;
            this.checkTrappedBall(ballPos, ballDir, ball.vel, ballRadius, blockPos);
        }
        //collision with horizontal edge
        else if (ballNextPos.x > blockPos.x && ballNextPos.x < blockPos.x + this._width) {
            ballDir.y *= -1;
            ball.vel *= Block.RESTITUTION;
            this.checkTrappedBall(ballPos, ballDir, ball.vel, ballRadius, blockPos);
        }
        //collision with corner
        else {
            //check if ball intersects with corners
            const nearestVertex = this.findNearestVertexPos(ballNextPos, blockPos);
            const vertexToBallVector = ballNextPos.substract(nearestVertex.pos);
            const vertexToBallDist = vertexToBallVector.getLength();
            if (vertexToBallDist > ballRadius) {
                return;
            }

            let normal = vertexToBallVector.getNormalized();

            //For cases when normal vector is chosen incorrectly we return it to possible range
            if (Math.abs(nearestVertex.horVector.x - normal.x) > 1) {
                normal = nearestVertex.vertVector;
            }
            else if (Math.abs(nearestVertex.vertVector.y - normal.y) > 1) {
                normal = nearestVertex.horVector;
            }

            const doubledProjectionLength = 2 * ballDir.dot(normal);
            ballDir = ballDir.substract(normal.scale(doubledProjectionLength));

            //correction, so the ball wouldn't stuck in the corner
            ballPos = ballPos.add(normal, ballRadius - vertexToBallDist);

            ball.vel *= Block.RESTITUTION;
        }

        //If block is rotated we switch back to a main basis
        if (this._rotate) {
            ball.pos = ballPos.getVectorInRotatedBasis(-this._rotate);
            ball.dir = ballDir.getVectorInRotatedBasis(-this._rotate);
        }
        else {
            ball.pos = ballPos;
            ball.dir = ballDir;
        }
    }

    //check if ball due to descrete steps collided with a wrong edge and reflected inside the block
    checkTrappedBall(ballPos, ballDir, ballVel, ballRadius, blockPos) {
        const ballNextPos = ballPos.add(ballDir, ballVel);

        if (this.isNextPosInBox(ballRadius, ballNextPos, blockPos)) {
            ballDir.x *= -1;
            ballDir.y *= -1;
        }
    }

    //if next ball position will be withtin block
    isNextPosInBox(ballRadius, ballNextPos, blockPos) {
        return ballNextPos.x + ballRadius > blockPos.x &&
            ballNextPos.x - ballRadius < blockPos.x + this._width &&
            ballNextPos.y + ballRadius > blockPos.y &&
            ballNextPos.y - ballRadius < blockPos.y + this._height;
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

    get rotate() {
        return this._rotate;
    }
    set rotate(value) {
        this._rotate = value;
    }
}