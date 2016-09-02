import $ from 'jquery';
import schema from 'is-my-json-valid';
import createDrawer from './drawer';
import SchemaDrawing from './schema-drawing';
import imagineDrawing from './imagine-drawing';

// import {
//   combineChromosomes,
//   objectToBitStream,
//   bitStreamToObject
// } from './binary';

const schemaDrawing = schema(SchemaDrawing);

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

const canvas = document.getElementById('main');

initViewport({ canvas });

const drawer = createDrawer({ canvas });


// const toStore = objectToUint8Array(shapeSettings, SchemaShape);
// const base64 = uint8ArrayToBase64(toStore);
// const convertBack = base64ToArrayBuffer(base64);
//
// console.log(isEqual(toStore, convertBack));

const drawing = imagineDrawing();
console.log(drawing);
schemaDrawing(drawing);
if (schemaDrawing.errors !== null) {
  console.log(schemaDrawing.errors);
} else {
  drawer.draw(drawing);
}
// const parent2 = createDrawingSettings();
//
//
// const DRAWING_BITS = 1024 * 60 * 5;
//
// const dnaStream1 = objectToBitStream(parent1, SchemaDrawing, DRAWING_BITS);
// const dnaStream2 = objectToBitStream(parent2, SchemaDrawing, DRAWING_BITS);
//
//
// for (let i = 0; i < 10; i++) {
//   const child = combineChromosomes([dnaStream1, dnaStream2], DRAWING_BITS);
//   const childObject = bitStreamToObject(child, SchemaDrawing);
//   drawer.draw(childObject);
// }
