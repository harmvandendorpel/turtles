import { min, max, map, sample, random, isEmpty, isEqual } from 'lodash';
import $ from 'jquery';
import schema from 'is-my-json-valid';
import createDrawer from './drawer';
import SchemaDrawing from './schema-drawing';
import {
  combineChromosomes,
  objectToBitStream,
  bitStreamToObject
} from './binary';

const schemaDrawing = schema(SchemaDrawing);
const blendingModes = ['difference', 'multiply', 'screen', 'lighten', 'darken', 'normal'];
const shapesInDrawing = SchemaDrawing.properties.shapes.minItems;

function initViewport({ canvas }) {
  const pixelRatio = window.devicePixelRatio;
  const viewport = [
    $(canvas).outerWidth(),
    $(canvas).outerHeight()
  ];

  canvas.width = viewport[0] * pixelRatio;
  canvas.height = viewport[1] * pixelRatio;

  canvas.style.width = `${viewport[0]}px`;
  canvas.style.height = `${viewport[1]}px`;
}

function randomAngleList({ damping, count }) {
  let d = 0;

  return map(new Array(count), () => {
    d += (random(true) - 0.5);
    d *= damping;

    d = min([d, 15]);
    d = max([d, -16]);
    return d;
  });
}

function createRandomLineSettings() {
  const solid = !!random();
  const dotted = !!random();
  const lineWidth = solid ? 0 : random(10.0, true);

  return {
    angles: randomAngleList({
      damping: random(true) > 0.9 ? random(0.9, 1.0) : 1,
      count: 1024
    }),
    scale: random(true),
    position: map(new Array(2), () => random(true)),
    blendingMode: sample(blendingModes),
    colorCycleSteps: random(true) > 0.9 ? random(32) : 0,
    startAngle: random(2 * Math.PI),
    color: map(new Array(3), () => random(100, 255)),
    solid,
    dotted,
    lineWidth,
    enabled: true // !!random()
  };
}

const canvas = document.getElementById('main');

initViewport({ canvas });

const drawer = createDrawer({ canvas });


// const toStore = objectToUint8Array(shapeSettings, SchemaShape);
// const base64 = uint8ArrayToBase64(toStore);
// const convertBack = base64ToArrayBuffer(base64);
//
// console.log(isEqual(toStore, convertBack));

function createDrawingSettings() {
  return {
    shapes: [...Array(shapesInDrawing)].map(() => createRandomLineSettings())
  };
}

const parent1 = createDrawingSettings();
const parent2 = createDrawingSettings();


const DRAWING_BITS = 1024 * 60 * 5;

const dnaStream1 = objectToBitStream(parent1, SchemaDrawing, DRAWING_BITS);
const dnaStream2 = objectToBitStream(parent2, SchemaDrawing, DRAWING_BITS);


setInterval(() => {
  const child = combineChromosomes([dnaStream1, dnaStream2], DRAWING_BITS);
  const childObject = bitStreamToObject(child, SchemaDrawing);
  drawer.draw(childObject);
}, 250);
