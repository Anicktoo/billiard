import '@/styles/reset.css';
import '@/styles/styles.css';
import { View } from '@/view/view.js';
import { Game } from '@/model/game.js';
import { Controller } from './controller/controller';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = CANVAS_WIDTH / 2;
const BALL_RADIUS = CANVAS_WIDTH / 64;
const FRICTION_KOEF = 0.1;

const canvasTable = document.getElementById('canvas-table');
const canvasForeground = document.getElementById('canvas-foreground');
canvasTable.width = CANVAS_WIDTH;
canvasTable.height = CANVAS_HEIGHT;
canvasForeground.width = CANVAS_WIDTH;
canvasForeground.height = CANVAS_HEIGHT;

const view = new View(canvasTable, canvasForeground);
const game = new Game(view, CANVAS_WIDTH, CANVAS_HEIGHT, BALL_RADIUS, FRICTION_KOEF);
const controller = new Controller(game);

game.start();

controller;