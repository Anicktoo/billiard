import { Vector2 } from "../utils/vector";

export class Controller {

    model;
    canvasRect;
    modelToControlProportion;


    constructor(model, canvasRect, viewToModelProportion) {
        this.model = model;
        this.canvasRect = canvasRect;
        this.modelToControlProportion = 1 / viewToModelProportion;
        this.initMouseControl();
    }

    initMouseControl() {

        let pressPos = null;
        let dirToBall;
        let shiftVector;

        window.addEventListener('mousemove', (e) => {
            const curPos = new Vector2(e.clientX - this.canvasRect.x, e.clientY - this.canvasRect.y);

            if (pressPos) {
                shiftVector = curPos.substract(pressPos);
                this.model.hitPower = 2 * dirToBall.dot(shiftVector) / this.canvasRect.width;
            }
            else {
                shiftVector = null;
                this.model.targetPos = curPos.scale(this.modelToControlProportion);
            }
        });
        window.addEventListener('mousedown', (e) => {
            if (!this.model.isWaitingForHit) {
                return;
            }
            pressPos = new Vector2(e.clientX - this.canvasRect.x, e.clientY - this.canvasRect.y);
            dirToBall = this.model.chosenBall.pos.scale(1 / this.modelToControlProportion).substract(pressPos).getNormalized();
            window.addEventListener('mouseup', () => {
                if (!shiftVector) {
                    this.model.chooseBall(pressPos.scale(this.modelToControlProportion));
                }
                else {
                    console.log('control hit power: ' + this.model.hitPower);
                    this.model.hitBall();
                    this.model.hitPower = 0;
                }
                pressPos = null;
            }, { once: true });

        });
    }
}