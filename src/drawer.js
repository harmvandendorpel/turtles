import { minBy, min, maxBy, reduce, clone, each, last, map } from 'lodash';

export default function createDrawer({ canvas }) {
  const ctx = canvas.getContext('2d');
  const startPos = [0, 0];
  const pos = clone(startPos);

  function startWalk() {
    ctx.moveTo(startPos[0], startPos[1]);
    ctx.beginPath();
  }

  function walk(distance, angle) {
    pos[0] += distance * Math.cos(angle);
    pos[1] += distance * Math.sin(angle);
    return clone(pos);
  }

  function connectStartWithEnd(coordinates) {
    const translate = [
      last(coordinates)[0] - coordinates[0][0],
      last(coordinates)[1] - coordinates[0][1]
    ];

    return map(coordinates, (coordinate, index) => {
      const progressed = index / (coordinates.length - 1);

      const delta = [
        translate[0] * progressed,
        translate[1] * progressed
      ];

      return [
        coordinate[0] - delta[0],
        coordinate[1] - delta[1]
      ];
    });
  }

  function getBoundingBox(coordinates) {
    return [
      [
        minBy(coordinates, coordinate => coordinate[0])[0],
        minBy(coordinates, coordinate => coordinate[1])[1]
      ],
      [
        maxBy(coordinates, coordinate => coordinate[0])[0],
        maxBy(coordinates, coordinate => coordinate[1])[1]
      ]
    ];
  }

  const coordsToOrigin = (coordinates, topLeftPosition) =>
    map(coordinates, coordinate =>
      [
        coordinate[0] - topLeftPosition[0],
        coordinate[1] - topLeftPosition[1]
      ]
    );

  function scaleCoords({ coordinates, boundingBox, targetSize, position, scale }) {
    const dimensions = [
      boundingBox[1][0] - boundingBox[0][0],
      boundingBox[1][1] - boundingBox[0][1]
    ];

    const scaleToFit = min([
      targetSize[0] / dimensions[0] * scale,
      targetSize[1] / dimensions[1] * scale
    ]);

    const scaledCoords = map(
      coordinates,
      coordinate => [coordinate[0] * scaleToFit, coordinate[1] * scaleToFit]
    );

    const move = [
      (targetSize[0] - dimensions[0] * scaleToFit) * position[0],
      (targetSize[1] - dimensions[1] * scaleToFit) * position[1]
    ];

    return map(scaledCoords, coordinate => [coordinate[0] + move[0], coordinate[1] + move[1]]);
  }

  function calculateShape({ dimensions, startAngle, angles, position, scale }) {
    let angle = startAngle;
    const sum = reduce(angles, (a, b) => a + b, 0);
    const angleUnit = 2 * Math.PI / sum;
    let coordinates = [];

    each(angles, point => {
      coordinates.push(walk(2, angle));
      angle += angleUnit * point;
    });

    coordinates = connectStartWithEnd(coordinates);
    const boundingBox = getBoundingBox(coordinates);
    coordinates = coordsToOrigin(coordinates, boundingBox[0]);
    return scaleCoords({ coordinates, boundingBox, targetSize: dimensions, position, scale });
  }

  function shape({
    enabled,
    lineWidth,
    blendingMode,
    colorCycleSteps,
    startAngle,
    angles,
    position,
    scale,
    color,
    solid,
    dotted
  }) {
    if (!enabled) return;
    const coordinates = calculateShape({
      dimensions: [canvas.width, canvas.height],
      startAngle,
      angles,
      position,
      scale
    });

    ctx.globalCompositeOperation = blendingMode;

    startWalk();
    let colorCycle = 0;

    each(coordinates, (coordinate) => {
      (colorCycle > colorCycleSteps / 2 && !dotted
        ?
        ctx.moveTo :
        ctx.lineTo
      )
      .apply(ctx, coordinate);

      if (colorCycle-- < 0) colorCycle = colorCycleSteps;
    });

    ctx.lineWidth = lineWidth;

    const [r, g, b] = color;
    const rgbString = `rgb(${r},${g},${b})`;
    if (solid) {
      ctx.strokeStyle = null;
      ctx.fillStyle = rgbString;
      ctx.fill();
    } else {
      ctx.fillStyle = null;
      ctx.strokeStyle = rgbString;
      ctx.stroke();
    }
  }

  function draw(drawing) {
    drawing.shapes.forEach(shape);
  }

  function clear() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  return { shape, clear, draw };
}
