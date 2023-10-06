import '@/styles/reset.css';
import '@/styles/styles.css';
import { View } from '@/view/view.js';
import { Game } from '@/model/game.js';
import { Controller } from './controller/controller';


const canvasTable = document.getElementById('canvas-table');
const canvasBalls = document.getElementById('canvas-balls');
const canvasCue = document.getElementById('canvas-cue');

const canvasWidth = canvasTable.getBoundingClientRect().width;
const canvasHeight = canvasTable.getBoundingClientRect().height;
const ballRadius = canvasWidth / 64;

canvasTable.width = canvasWidth;
canvasTable.height = canvasHeight;
canvasBalls.width = canvasWidth;
canvasBalls.height = canvasHeight;
canvasCue.width = window.innerWidth;
canvasCue.height = window.innerHeight;

const view = new View(canvasTable, canvasBalls, canvasCue);
const game = new Game(view, canvasWidth, canvasHeight, ballRadius);
const controller = new Controller(game, canvasTable);

game.run();

controller;