import { Vector2 } from "../utils/vector";

export class Controller {

    static HIT_POWER_TRASHOLD = 0.05;
    _model;
    _canvasRect;
    _modelToControlProportion;


    constructor(model, canvasRect, viewToModelProportion) {
        this._model = model;
        this._canvasRect = canvasRect;
        this._modelToControlProportion = 1 / viewToModelProportion;
        this.initMouseControl();
    }

    initMouseControl() {
        let pressPos = null;
        let dirToBall;
        let shiftVector = new Vector2(0, 0);

        window.addEventListener('mousemove', (e) => {
            const curPos = new Vector2(e.clientX - this._canvasRect.x, e.clientY - this._canvasRect.y);

            if (pressPos) {
                shiftVector = curPos.substract(pressPos);
                this._model.hitPower = 4 * this._modelToControlProportion * dirToBall.dot(shiftVector) / this._canvasRect.width;
            }
            else {
                shiftVector = new Vector2(0, 0);
                this._model.targetPos = curPos.scale(this._modelToControlProportion);
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (!this._model.isWaitingForHit) {
                return;
            }
            pressPos = new Vector2(e.clientX - this._canvasRect.x, e.clientY - this._canvasRect.y);
            dirToBall = this._model.chosenBall.pos
                .scale(1 / this._modelToControlProportion)
                .substract(pressPos)
                .getNormalized();
            window.addEventListener('mouseup', () => {
                console.log('control hit power: ' + this._model.hitPower);
                if (this._model.hitPower < Controller.HIT_POWER_TRASHOLD) {
                    this._model.chooseBall(pressPos.scale(this._modelToControlProportion));
                }
                else {
                    this._model.hitBall();
                }
                this._model.hitPower = 0;
                pressPos = null;
            }, { once: true });

        });

        document.getElementById('restart').addEventListener('click', () => {
            this._model.restart()
        });
    }
}