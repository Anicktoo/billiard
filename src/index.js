import '@/styles/reset.css';
import '@/styles/styles.css';
import { View } from '@/view/view.js';
import { Game } from '@/model/game.js';
import { Controller } from './controller/controller';


const canvasTable = document.getElementById('canvas-table');
const canvasBalls = document.getElementById('canvas-balls');
const canvasCue = document.getElementById('canvas-cue');

const canvasRect = canvasTable.getBoundingClientRect();
const canvasWidth = canvasRect.width;
const canvasHeight = canvasRect.height;

canvasTable.width = canvasWidth;
canvasTable.height = canvasHeight;
canvasBalls.width = canvasWidth;
canvasBalls.height = canvasHeight;
canvasCue.width = window.innerWidth;
canvasCue.height = window.innerHeight;

const view = new View(canvasTable, canvasBalls, canvasCue, Game.TABLE_WIDTH);
const game = new Game(view);
new Controller(game, canvasRect, view.viewToModelProportion);

game.start();
