import { min, max, map, sample, random } from 'lodash';
import SchemaDrawing from './schema-drawing';

const blendingModes = ['difference', 'multiply', 'screen', 'lighten', 'darken', 'normal'];
const shapesInDrawing = SchemaDrawing.properties.shapes.minItems;

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

function randomFraction() {
  return random(true);
}

function threshold(threshold, yes, no) {
  return randomFraction() > threshold ? yes : no;
}

function fill(count, callback) {
  return map(new Array(count), () => callback());
}

function randomColor() {
  return fill(3, () => random(100, 255));
}

function createGradient() {
  return {
    enabled: threshold(0.5, true, false),
    type: threshold(0.5, 'linear', 'radial'),
    stops: [{
      position: 0.0,
      color: randomColor()
    }, {
      position: 1.0,
      color: randomColor()
    }],
    position: fill(6, () => random(true))
  };
}

function createRandomLineSettings() {
  const solid = !!random();
  const dotted = !!random();
  const lineWidth = solid ? 0 : random(10.0, true);

  return {
    angles: randomAngleList({
      damping: threshold(0.9, random(0.9, 1.0), 1),
      count: 1024
    }),
    scale: random(true),
    position: fill(2, randomFraction),
    blendingMode: sample(blendingModes),
    colorCycleSteps: threshold(0.9, random(31), 0),
    startAngle: random(2 * Math.PI),
    color: randomColor(),
    solid,
    dotted,
    lineWidth,
    gradient: createGradient(),
    enabled: !!random()
  };
}

export default function imagineDrawing() {
  return {
    shapes: [...Array(shapesInDrawing)].map(() => createRandomLineSettings())
  };
}
