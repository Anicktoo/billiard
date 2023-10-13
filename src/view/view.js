import { Vector2 } from "../utils/vector";

export class View {
    static CUE_COLOR = '#2f1212';
    static WALL_COLOR = '#221205';
    static TABLE_COLOR = '#225522';
    static POCKET_COLOR = '#000000';
    static BALLS_COLORS = {
        main: '#551122',
        ordinary: '#FFFFFF'
    }

    _ctxBalls;
    _ctxCue;
    _cueWidth;
    _maxSpace;
    _ctxTable;
    _cueLength;
    _tableWidth;
    _tableHeight;
    _initialSpace;
    _cueSpaceWidth;
    _cueSpaceHeight;
    _viewToModelProportion;

    constructor(canvasTable, canvasBalls, canvasCue, modelTableWidth) {
        this._ctxTable = canvasTable.getContext('2d');
        this._ctxCue = canvasCue.getContext('2d');
        this._ctxBalls = canvasBalls.getContext('2d');
        this.init(canvasTable, canvasCue, modelTableWidth);
    }

    // recreate(canvasTable, canvasCue, modelTableWidth) {
    //     this.init(canvasTable, canvasCue, modelTableWidth);
    // }

    init(canvasTable, canvasCue, modelTableWidth) {
        this._cueSpaceWidth = canvasCue.width;
        this._cueSpaceHeight = canvasCue.height;
        this._tableWidth = canvasTable.width;
        this._tableHeight = canvasTable.height;
        this._viewToModelProportion = this._tableWidth / modelTableWidth;
        this.tablePos = new Vector2(canvasTable.getBoundingClientRect().left, canvasTable.getBoundingClientRect().top);
        this._cueLength = this._tableHeight;
        this._cueWidth = this._cueLength / 64;
        this._initialSpace = this._cueWidth;
        this._maxSpace = this._initialSpace * 30;
    }

    renderTable() {
        this._ctxTable.clearRect(0, 0, this._tableWidth, this._tableHeight);
        this._ctxTable.fillStyle = View.TABLE_COLOR;
        this._ctxTable.fillRect(0, 0, this._tableWidth, this._tableHeight);
    }

    renderPockets(pocketsPositions, pocketRadius) {
        this._ctxTable.fillStyle = View.POCKET_COLOR;

        for (let { x, y } of pocketsPositions) {
            this._ctxTable.beginPath();
            this._ctxTable.arc(
                x * this._viewToModelProportion,
                y * this._viewToModelProportion,
                pocketRadius * this._viewToModelProportion,
                0, Math.PI * 2, false
            );
            this._ctxTable.fill();
        }
    }

    renderWalls(blockRects) {
        this._ctxTable.fillStyle = View.WALL_COLOR;
        for (let block of blockRects) {
            this._ctxTable.fillRect(
                block.x * this._viewToModelProportion,
                block.y * this._viewToModelProportion,
                block.width * this._viewToModelProportion,
                block.height * this._viewToModelProportion);
        }
    }

    renderBalls(balls, radius) {
        this._ctxBalls.clearRect(0, 0, this._tableWidth, this._tableHeight);
        radius *= this._viewToModelProportion;

        for (let i = 0; i < balls.length; i++) {
            const { x, y } = balls[i].pos.scale(this._viewToModelProportion);
            this._ctxBalls.fillStyle = View.BALLS_COLORS[balls[i].type];
            this._ctxBalls.beginPath();
            this._ctxBalls.arc(x, y, radius, 0, Math.PI * 2, false);
            this._ctxBalls.fill();
        }
    }

    renderCue(ballPosition, targetPosition, ballRadius, cueShift = 0) {
        ballPosition = ballPosition.scale(this._viewToModelProportion);
        targetPosition = targetPosition.scale(this._viewToModelProportion);
        ballRadius *= this._viewToModelProportion;
        cueShift *= this._viewToModelProportion;

        this._ctxCue.clearRect(0, 0, this._cueSpaceWidth, this._cueSpaceHeight);
        const dir = ballPosition.substract(targetPosition).getNormalized();
        const cueTop = ballPosition.add(this.tablePos).add(dir, ballRadius + this._initialSpace + cueShift * this._maxSpace);
        const cueBottom = cueTop.add(dir, this._cueLength);

        this._ctxCue.globalCompositeOperation = 'source-over';
        this._ctxCue.strokeStyle = View.CUE_COLOR;
        this._ctxCue.beginPath();
        this._ctxCue.moveTo(cueTop.x, cueTop.y);
        this._ctxCue.lineTo(cueBottom.x, cueBottom.y);
        this._ctxCue.lineWidth = this._cueWidth;
        this._ctxCue.stroke();
        this._ctxCue.closePath();

    }

    fadeOutCue(visible = 1) {
        visible -= 0.01;
        this._ctxCue.globalCompositeOperation = 'destination-in';
        this._ctxCue.fillStyle = `rgba(255, 255, 255, ${visible})`;
        this._ctxCue.fillRect(0, 0, this._cueSpaceWidth, this._cueSpaceHeight);
        if (visible > 0) {
            requestAnimationFrame(this.fadeOutCue.bind(this, visible));
        }
        else {
            this._ctxCue.clearRect(0, 0, this._cueSpaceWidth, this._cueSpaceHeight);
        }
    }

    get viewToModelProportion() {
        return this._viewToModelProportion;
    }
}