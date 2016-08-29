const ColorSchema = {
  type: 'array',
  items: {
    type: 'integer',
    required: true,
    minimum: 0,
    maximum: 255
  },
  minItems: 3,
  maxItems: 3
};

const SchemaShape = {
  type: 'object',
  additionalProperties: false,
  properties: {
    angles: {
      type: 'array',
      required: true,
      minItems: 1024,
      maxItems: 1024,
      items: {
        type: 'number',
        minimum: -16,
        maximum: 15
      }
    },
    scale: {
      type: 'number',
      required: true,
      minimum: 0,
      maximum: 1
    },
    position: {
      type: 'array',
      items: {
        type: 'number',
        required: true,
        minimum: 0,
        maximum: 1
      },
      minItems: 2,
      maxItems: 2
    },
    blendingMode: {
      enum: ['normal', 'darken', 'lighten', 'multiply', 'screen', 'difference']
    },
    colorCycleSteps: {
      type: 'integer',
      required: true,
      minimum: 0,
      maximum: 31
    },
    startAngle: {
      type: 'number',
      required: true,
      minimum: 0,
      maximum: 2 * Math.PI
    },
    color: ColorSchema,
    dotted: {
      type: 'boolean',
      required: true
    },
    solid: {
      type: 'boolean',
      required: true
    },
    lineWidth: {
      type: 'number',
      required: true,
      minimum: 0,
      maximum: 10
    },
    enabled: {
      type: 'boolean',
      required: true
    }
  }
};

const SchemaDrawing = {
  type: 'object',
  required: true,
  additionalProperties: false,
  properties: {
    shapes: {
      type: 'array',
      minItems: 1,
      maxItems: 1,
      required: true,
      items: SchemaShape
    }
  }
};

export default SchemaDrawing;
