import { Vector2 } from "../utils/vector";

export class Controller {

    static HIT_POWER_TRASHOLD = 0.05;
    _model;
    _canvasRect;
    _mouseMoveFunction;
    _mouseDownFunction;
    _modelToControlProportion;

    constructor(model, canvas, viewToModelProportion) {
        this._model = model;
        this._canvasRect = canvas.getBoundingClientRect();
        this._modelToControlProportion = 1 / viewToModelProportion;
        this.initMouseControl();
    }

    resizeInit(canvas, viewToModelProportion) {
        this._canvasRect = canvas.getBoundingClientRect();
        this._modelToControlProportion = 1 / viewToModelProportion;
    }

    initMouseControl() {

        let pressPos = null;
        let dirToBall;
        let shiftVector = new Vector2(0, 0);

        const mouseMoveFunction = (e) => {
            const curPos = new Vector2(e.clientX - this._canvasRect.x, e.clientY - this._canvasRect.y);

            if (pressPos) {
                shiftVector = curPos.substract(pressPos);
                this._model.hitPower = 4 * this._modelToControlProportion * dirToBall.dot(shiftVector) / this._canvasRect.width;
            }
            else {
                shiftVector = new Vector2(0, 0);
                this._model.targetPos = curPos.scale(this._modelToControlProportion);
            }
        };

        const mouseDownFunction = (e) => {
            if (!this._model.isWaitingForHit) {
                return;
            }
            pressPos = new Vector2(e.clientX - this._canvasRect.x, e.clientY - this._canvasRect.y);
            dirToBall = this._model.chosenBall.pos
                .scale(1 / this._modelToControlProportion)
                .substract(pressPos)
                .getNormalized();
            window.addEventListener('mouseup', () => {
                if (this._model.hitPower < Controller.HIT_POWER_TRASHOLD) {
                    this._model.chooseBall(pressPos.scale(this._modelToControlProportion));
                }
                else {
                    this._model.hitBall();
                }
                this._model.hitPower = 0;
                pressPos = null;
            }, { once: true });

        };

        window.addEventListener('mousemove', mouseMoveFunction);
        window.addEventListener('mousedown', mouseDownFunction);

        // this._mouseMoveFunction = mouseMoveFunction;
        // this._mouseDownFunction = mouseDownFunction;

        document.getElementById('restart').addEventListener('click', () => {
            this._model.restart()
        });
    }

    mouseMoveFunction() {

    }

    mouseDownFunction() {

    }
}