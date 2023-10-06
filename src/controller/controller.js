import { Vector2 } from "../utils/vector";

export class Controller {

    model;
    canvas;

    constructor(model, canvas) {
        this.model = model;
        this.canvas = canvas;
        this.initMouseControl();
    }


    initMouseControl() {

        const rect = this.canvas.getBoundingClientRect()
        let pressPos = null;
        let dirToBall;
        let shiftVector;

        window.addEventListener('mousemove', (e) => {
            const curPos = new Vector2(e.clientX - rect.x, e.clientY - rect.y);
            if (pressPos) {
                shiftVector = curPos.substract(pressPos);
                this.model.hitPower = 2 * dirToBall.dot(shiftVector) / rect.width;
            }
            else {
                shiftVector = null;
                this.model.targetPos = curPos;
            }
        });
        window.addEventListener('mousedown', (e) => {
            if (!this.model.isWaitingForHit) {
                return;
            }
            pressPos = new Vector2(e.clientX - rect.x, e.clientY - rect.y)
            dirToBall = this.model.chosenBall.pos.substract(pressPos).getNormalized();
            window.addEventListener('mouseup', () => {
                if (!shiftVector) {
                    this.model.chooseBall(pressPos)
                }
                else {
                    this.model.hitBall();
                    console.log('hit power: ' + this.model.hitPower);
                    this.model.hitPower = 0;
                }
                pressPos = null;
            }, { once: true })
        });
    }
}