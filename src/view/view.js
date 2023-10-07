import { Vector2 } from "../utils/vector";

export class View {
    static TABLE_COLOR = '#225522';
    static BALL_COLOR = '#FFFFFF';
    static MAIN_BALL_COLLOR = '#551122';
    static CUE_COLOR = '#2f1212';

    ctx;
    ctxCue;
    cueWidth;
    maxSpace;
    ctxTable;
    cueLength;
    tableWidth;
    tableHeight;
    initialSpace;
    _viewToModelProportion;

    constructor(canvasTable, canvasBalls, canvasCue, modelTableWidth) {
        this.ctxTable = canvasTable.getContext('2d');
        this.ctxCue = canvasCue.getContext('2d');
        this.ctx = canvasBalls.getContext('2d');
        this.init(canvasTable, canvasCue, modelTableWidth);
    }

    recreate(canvasTable, canvasCue, modelTableWidth) {
        this.init(canvasTable, canvasCue, modelTableWidth);
    }

    init(canvasTable, canvasCue, modelTableWidth) {
        this.width = canvasCue.width;
        this.height = canvasCue.height;
        this.tableWidth = canvasTable.width;
        this.tableHeight = canvasTable.height;
        this._viewToModelProportion = this.tableWidth / modelTableWidth;
        this.tablePos = new Vector2(canvasTable.getBoundingClientRect().left, canvasTable.getBoundingClientRect().top);
        this.cueLength = this.tableHeight;
        this.cueWidth = this.cueLength / 64;
        this.initialSpace = this.cueWidth;
        this.maxSpace = this.initialSpace * 20;
        this.renderTable();
    }

    renderTable() {
        this.ctxTable.clearRect(0, 0, this.tableWidth, this.tableHeight);
        this.ctxTable.fillStyle = View.TABLE_COLOR;
        this.ctxTable.fillRect(0, 0, this.tableWidth, this.tableHeight);
    }

    //render balls elements
    renderBalls(ballsPositions, radius) {
        radius *= this._viewToModelProportion;
        this.ctx.clearRect(0, 0, this.tableWidth, this.tableHeight);
        this.ctx.fillStyle = View.MAIN_BALL_COLLOR;

        const { x, y } = ballsPositions[0].scale(this._viewToModelProportion);
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        this.ctx.fill();
        this.ctx.fillStyle = View.BALL_COLOR;

        for (let i = 1; i < ballsPositions.length; i++) {
            const { x, y } = ballsPositions[i].scale(this._viewToModelProportion);
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            this.ctx.fill();
        }
    }

    renderCue(ballPosition, targetPosition, ballRadius, cueShift = 0) {
        ballPosition = ballPosition.scale(this._viewToModelProportion);
        targetPosition = targetPosition.scale(this._viewToModelProportion);
        ballRadius *= this._viewToModelProportion;
        cueShift *= this._viewToModelProportion;

        this.ctxCue.clearRect(0, 0, this.width, this.height);
        const dir = ballPosition.substract(targetPosition).getNormalized();
        const cueTop = ballPosition.add(this.tablePos).add(dir, ballRadius + this.initialSpace + cueShift * this.maxSpace);
        const cueBottom = cueTop.add(dir, this.cueLength);

        this.ctxCue.globalCompositeOperation = 'source-over';
        this.ctxCue.strokeStyle = View.CUE_COLOR;
        this.ctxCue.beginPath();
        this.ctxCue.moveTo(cueTop.x, cueTop.y);
        this.ctxCue.lineTo(cueBottom.x, cueBottom.y);
        this.ctxCue.lineWidth = this.cueWidth;
        this.ctxCue.stroke();
        this.ctxCue.closePath();

    }

    fadeOutCue(visible = 1) {
        this.ctxCue.fillStyle = `rgba(255, 255, 255, ${visible})`;
        visible -= 0.01;
        this.ctxCue.globalCompositeOperation = 'destination-in';
        this.ctxCue.fillRect(0, 0, this.width, this.height);
        if (visible > 0) {
            requestAnimationFrame(this.fadeOutCue.bind(this, visible));
        }
        else {
            this.ctxCue.clearRect(0, 0, this.width, this.height);
        }
    }

    get viewToModelProportion() {
        return this._viewToModelProportion;
    }
}