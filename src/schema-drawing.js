const ColorSchema = {
  type: 'array',
  required: true,
  items: {
    type: 'integer',
    required: true,
    minimum: 0,
    maximum: 255
  },
  minItems: 3,
  maxItems: 3
};

const FractionSchema = {
  type: 'number',
  required: true,
  minimum: 0,
  maximum: 1
};

const RequiredBool = {
  type: 'boolean',
  required: true
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
      items: FractionSchema,
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
    dotted: RequiredBool,
    solid: RequiredBool,
    lineWidth: {
      type: 'number',
      required: true,
      minimum: 0,
      maximum: 10
    },
    enabled: RequiredBool,
    gradient: {
      additionalProperties: false,
      type: 'object',
      required: true,
      properties: {
        enabled: RequiredBool,
        type: {
          required: true,
          enum: ['linear', 'radial']
        },
        stops: {
          type: 'array',
          minItems: 2,
          maxItems: 2,
          required: true,
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              color: ColorSchema,
              position: FractionSchema
            }
          }
        },
        position: {
          type: 'array',
          minItems: 6,
          maxItems: 6,
          items: FractionSchema,
          required: true
        }
      }
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
      minItems: 3,
      maxItems: 3,
      required: true,
      items: SchemaShape
    }
  }
};

export default SchemaDrawing;
