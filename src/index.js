import '@/styles/reset.css';
import '@/styles/styles.css';
import 'canvas-roundrect-polyfill';
import { View } from '@/view/view.js';
import { Game } from '@/model/game.js';
import { Controller } from './controller/controller';

const canvasTable = document.getElementById('canvas-table');
const canvasBalls = document.getElementById('canvas-balls');
const canvasCue = document.getElementById('canvas-cue');

let view;
let model;
let controller;

const setCanvasSizes = function () {
    const canvasRect = canvasTable.getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;

    canvasTable.width = canvasWidth;
    canvasTable.height = canvasHeight;
    canvasBalls.width = canvasWidth;
    canvasBalls.height = canvasHeight;
    canvasCue.width = window.innerWidth;
    canvasCue.height = window.innerHeight;
}

const loadAndStart = async function () {
    setCanvasSizes();
    view = new View(canvasTable, canvasBalls, canvasCue);
    await view.init(canvasTable, canvasCue, Game.TABLE_WIDTH);
    model = new Game(view);
    controller = new Controller(model, canvasTable, view.viewToModelProportion);
    model.start();

    window.addEventListener('resize', async () => {
        setCanvasSizes();
        await view.init(canvasTable, canvasCue, Game.TABLE_WIDTH);
        model.renderGame();
        controller.resizeInit(canvasTable, view.viewToModelProportion);
    });
}

loadAndStart();
console.log('v1');