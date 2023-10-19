import { Vector2 } from "../utils/vector";

export class View {
    static CUE_COLOR = '#2f1212';
    static DECOR_COLOR = '#CFB725';
    static TABLE_COLOR = '#145127';
    static BALLS_COLORS = {
        main: '#670730',
        ordinary: '#D9D9C3'
    }
    static POCKET_COLORS = [
        '#181111',
        '#222222',
        '#CFB725'
    ];
    static WALL_COLORS = [
        '#A47461',
        '#C48B68',
        '#733D29',
        '#5E2D19',
        '#60311D',
        '#60311D',
        '#60311D',
        '#60311D',
        '#5E2D1B',
        '#411B10',
        '#238E3B',
        '#1D8C39',
        '#238E3B',
        '#177834'
    ];
    /** */

    _sprites = {
        cue: undefined,
        ball: undefined,
        shadow: undefined,
    }
    _ctxCue;
    _ctxBalls;
    _cueWidth;
    _maxSpace;
    _ctxTable;
    _fadeStop;
    _tablePos;
    _cueLength;
    _tableWidth;
    _tableHeight;
    _initialSpace;
    _cueSpaceWidth;
    _cueSpaceHeight;
    _viewToModelProportion;

    constructor(canvasTable, canvasBalls, canvasCue) {
        this._ctxTable = canvasTable.getContext('2d');
        this._ctxCue = canvasCue.getContext('2d');
        this._ctxBalls = canvasBalls.getContext('2d');
    }

    async init(canvasTable, canvasCue, modelTableWidth) {
        const tablePosRect = canvasTable.getBoundingClientRect();
        this._cueSpaceWidth = canvasCue.width;
        this._cueSpaceHeight = canvasCue.height;
        this._tableWidth = canvasTable.width;
        this._tableHeight = canvasTable.height;
        this._viewToModelProportion = this._tableWidth / modelTableWidth;
        this._tablePos = new Vector2(tablePosRect.left, tablePosRect.top);
        this._cueLength = this._tableHeight;
        this._cueWidth = this._cueLength / 32;
        this._initialSpace = this._cueWidth;
        this._maxSpace = this._initialSpace * 30;
        await this.loadSprites();
    }

    loadSprites() {
        return new Promise((resolve) => {
            const keys = Object.keys(this._sprites);
            let i = 0;
            const loop = (key) => {
                this._sprites[key] = new Image();
                this._sprites[key].onload = () => {
                    if (i == keys.length - 1) {
                        resolve();
                    }
                    else {
                        loop(keys[++i]);
                    }
                }

                this._sprites[key].src = `./img/${key}.png`;
            }
            loop(keys[i]);
        })
    }

    renderTable(pocketRadius) {
        this._ctxTable.clearRect(0, 0, this._tableWidth, this._tableHeight);
        this._ctxTable.fillStyle = View.TABLE_COLOR;
        this._ctxTable.roundRect(0, 0, this._tableWidth, this._tableHeight, pocketRadius);
        this._ctxTable.fill();
    }

    renderPockets(pockets, pocketRadius, wallWidth) {
        const viewPocketRadius = pocketRadius * this._viewToModelProportion;
        const viewWallWidth = wallWidth * this._viewToModelProportion;
        const lineWidth = 0.3 * viewPocketRadius;
        this._ctxTable.lineWidth = lineWidth;
        // const pocketShift = lineWidth;

        //render pocket
        const renderPocket = (x, y, emptyPart) => {

            const angle = -Math.PI * (emptyPart / 2 - 1 / 4);

            //draw path to pocket
            this._ctxTable.fillStyle = View.TABLE_COLOR;
            this._ctxTable.translate(x, y);
            this._ctxTable.rotate(-angle);
            this._ctxTable.translate(-x, -y);
            this._ctxTable.fillRect(x, y - viewPocketRadius, viewWallWidth * 2, viewPocketRadius * 2);
            this._ctxTable.setTransform(1, 0, 0, 1, 0, 0);

            //draw pocket
            this._ctxTable.fillStyle = View.POCKET_COLORS[0];
            this._ctxTable.beginPath();
            this._ctxTable.arc(
                x,
                y,
                viewPocketRadius,
                0, Math.PI * 2, false
            );
            this._ctxTable.fill();

            //draw golden border
            this._ctxTable.beginPath();
            this._ctxTable.strokeStyle = View.POCKET_COLORS[2];
            this._ctxTable.lineCap = 'round';
            const middleKoef = emptyPart % 1 === 0 ? 0.3 : 0.5;
            this._ctxTable.arc(
                x,
                y,
                viewPocketRadius,
                (emptyPart + middleKoef) * Math.PI / 2,
                Math.PI * (3 + (emptyPart - middleKoef)) / 2,
                false
            );
            this._ctxTable.stroke();
        };

        for (let i = 0; i < pockets.length; i++) {
            let dir = i > 3 ? i * 2 + 1.5 : i + 1;
            renderPocket(
                pockets[i].x * this._viewToModelProportion,
                pockets[i].y * this._viewToModelProportion,
                dir
            );
        }
    }

    renderWalls(blocks, pocketRadius, blockWidth) {
        const layerWidth = blockWidth * this._viewToModelProportion / View.WALL_COLORS.length;
        let curShift = layerWidth / 2;
        this._ctxTable.lineWidth = layerWidth + 1;

        for (let i = 0; i < View.WALL_COLORS.length; i++, curShift += layerWidth) {
            this._ctxTable.strokeStyle = View.WALL_COLORS[i];
            this._ctxTable.beginPath();
            let radius = 0.5 * (pocketRadius - curShift);
            radius = radius > 0 ? radius : 0;
            this._ctxTable.roundRect(
                curShift,
                curShift,
                this._tableWidth - 2 * curShift,
                this._tableHeight - 2 * curShift,
                radius
            );
            this._ctxTable.stroke();
        }

        const decorRadius = blockWidth * this._viewToModelProportion / 15;
        for (let block of blocks) {
            if (block.rotate) continue;
            const x = block.x * this._viewToModelProportion;
            const y = block.y * this._viewToModelProportion;
            const quartWidth = block.width * this._viewToModelProportion / 4;
            const halfHeight = block.height * this._viewToModelProportion / 2;

            this._ctxTable.fillStyle = View.DECOR_COLOR;
            for (let i = 1; i <= 3; i++) {

                let curX = x + quartWidth * i;
                let curY = y + halfHeight;

                if (block.width < block.height) {
                    curX = x + block.width * this._viewToModelProportion / 2;
                    curY = y + block.height * this._viewToModelProportion / 4 * i;
                }
                this._ctxTable.beginPath();
                this._ctxTable.arc(
                    curX,
                    curY,
                    decorRadius,
                    0,
                    Math.PI * 2,
                );
                this._ctxTable.fill();
            }
        }

        // show real walls
        // for (let i = 0; i < blocks.length; i++) {
        //     this._ctxTable.fillStyle = '#000';
        //     this._ctxTable.fillStyle = `#${111 * (i % 10)}`;
        //     const x = blocks[i].x * this._viewToModelProportion;
        //     const y = blocks[i].y * this._viewToModelProportion;
        //     const width = blocks[i].width * this._viewToModelProportion;
        //     const height = blocks[i].height * this._viewToModelProportion;
        //     if (blocks[i].rotate) {
        //         this._ctxTable.translate(x, y);
        //         this._ctxTable.rotate(blocks[i].rotate);
        //         this._ctxTable.translate(-x, -y);
        //     }
        //     this._ctxTable.fillRect(
        //         x,
        //         y,
        //         width,
        //         height,
        //     );
        //     this._ctxTable.setTransform(1, 0, 0, 1, 0, 0);
        // }
    }

    renderBalls(balls, radius) {
        this._ctxBalls.clearRect(0, 0, this._tableWidth, this._tableHeight);
        radius *= this._viewToModelProportion;
        let ballPoses = [];
        const ballW = radius * 2;
        const shadowShift = radius * 1.3;
        //draw shadow 
        for (let i = 0; i < balls.length; i++) {
            const { x, y } = balls[i].pos.scale(this._viewToModelProportion);
            ballPoses.push({ x, y });
            this._ctxBalls.drawImage(this._sprites.shadow, x - radius, y - ballW + shadowShift, ballW, ballW);
        }
        //draw ball
        for (let i = 0; i < balls.length; i++) {
            const { x, y } = balls[i].pos.scale(this._viewToModelProportion);
            this._ctxBalls.fillStyle = View.BALLS_COLORS[balls[i].type];
            this._ctxBalls.beginPath();
            this._ctxBalls.arc(x, y, radius, 0, Math.PI * 2, false);
            this._ctxBalls.fill();
            this._ctxBalls.drawImage(this._sprites.ball, x - radius, y - radius, ballW, ballW);
        }
    }

    renderCue(ballPosition, targetPosition, ballRadius, cueShift = 0) {
        ballPosition = ballPosition.scale(this._viewToModelProportion);
        targetPosition = targetPosition.scale(this._viewToModelProportion);
        ballRadius *= this._viewToModelProportion;
        cueShift *= this._viewToModelProportion;
        const dir = ballPosition.substract(targetPosition).getNormalized();
        const ortDir = new Vector2(-dir.y, dir.x);
        const cueLeftTop = ballPosition.add(this._tablePos).add(dir, ballRadius + this._initialSpace + cueShift * this._maxSpace + this._cueLength).add(ortDir, this._cueWidth / 2);
        let angle = Math.acos(-dir.x);
        if (dir.y > 0) {
            angle *= -1;
        }
        angle;
        this._ctxCue.clearRect(0, 0, this._cueSpaceWidth, this._cueSpaceHeight);
        this._ctxCue.globalCompositeOperation = 'source-over';
        this._ctxCue.translate(cueLeftTop.x, cueLeftTop.y);
        this._ctxCue.rotate(angle);
        this._ctxCue.translate(-cueLeftTop.x, -cueLeftTop.y);
        this._ctxCue.drawImage(this._sprites.cue, cueLeftTop.x, cueLeftTop.y, this._cueLength, this._cueWidth);
        // this._ctxCue.fillRect(cueLeftTop.x, cueLeftTop.y, this._cueLength, this._cueWidth);
        this._ctxCue.setTransform(1, 0, 0, 1, 0, 0);
    }

    fadeOutCue(firstCall = true, visible = 1) {
        if (firstCall) {
            this._fadeStop = false;
        }
        visible -= 0.01;
        this._ctxCue.globalCompositeOperation = 'destination-in';
        this._ctxCue.fillStyle = `rgba(255, 255, 255, ${visible})`;
        this._ctxCue.fillRect(0, 0, this._cueSpaceWidth, this._cueSpaceHeight);
        if (visible > 0) {
            if (!this._fadeStop) {
                requestAnimationFrame(this.fadeOutCue.bind(this, false, visible));
            }
            else {
                this._fadeStop = false;
            }
        }
        else {
            this._ctxCue.clearRect(0, 0, this._cueSpaceWidth, this._cueSpaceHeight);
        }
    }

    fadeOutStop() {
        this._fadeStop = true;
    }

    get viewToModelProportion() {
        return this._viewToModelProportion;
    }
}