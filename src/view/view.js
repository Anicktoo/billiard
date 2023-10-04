export class View {
    static TABLE_COLOR = "#225522";
    static BALL_COLOR = "#FFFFFF";
    ctx;
    ctxTable;
    tableWidth;
    tableHeight;

    constructor(canvasTable, canvasForeground) {
        this.ctxTable = canvasTable.getContext('2d');
        this.ctx = canvasForeground.getContext('2d');
        this.tableWidth = canvasTable.width;
        this.tableHeight = canvasTable.height;
        this.renderTable();
    }

    renderTable() {
        this.ctxTable.clearRect(0, 0, this.tableWidth, this.tableHeight);
        this.ctxTable.fillStyle = View.TABLE_COLOR;
        this.ctxTable.fillRect(0, 0, this.tableWidth, this.tableHeight);
    }

    //render foreground elements
    render(ballsPositions, radius) {
        this.ctx.clearRect(0, 0, this.tableWidth, this.tableHeight);
        this.ctx.fillStyle = View.BALL_COLOR;
        for (let { x, y } of ballsPositions) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            this.ctx.fill();
        }
    }
}