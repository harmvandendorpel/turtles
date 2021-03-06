import { BitStream } from 'bit-buffer';
import { forOwn, each } from 'lodash';

const floatingRoundingMultiplier = 10e6;
const requiredBits = (maxValue) => Math.floor(Math.log(maxValue) / Math.LN2) + 1;

function traceObject(object, schema, processValue) {
  function processInteger(nodeValue, nodeSchema) {
    const range = nodeSchema.maximum - nodeSchema.minimum;
    const bits = requiredBits(range);
    const unsignedValue = nodeValue - nodeSchema.minimum;
    processValue(unsignedValue, bits);
  }

  function processFloat(nodeValue, nodeSchema) {
    const range = nodeSchema.maximum - nodeSchema.minimum;
    const maxValue = parseInt(range * floatingRoundingMultiplier, 10);
    const bits = requiredBits(maxValue);
    const storeAs = parseInt((nodeValue - nodeSchema.minimum) * floatingRoundingMultiplier, 10);
    processValue(storeAs, bits);
  }

  function processArray(elements, itemSchema) {
    each(elements, element => processNode(element, itemSchema));
  }

  function processEnum(nodeValue, nodeSchema) {
    const index = nodeSchema.enum.indexOf(nodeValue);
    const maxIndex = nodeSchema.enum.length;
    const bits = requiredBits(maxIndex);
    processValue(index, bits);
  }

  function processObject(nodeValue, schemaProperties) {
    forOwn(schemaProperties, (schemaProperty, schemaPropertyKey) => {
      const propertyValue = nodeValue[schemaPropertyKey];
      processNode(propertyValue, schemaProperty);
    });
  }

  function processNode(nodeValue, nodeSchema) {
    switch (nodeSchema.type) {
      case 'object':
        processObject(nodeValue, nodeSchema.properties);
        break;

      case 'array':
        processArray(nodeValue, nodeSchema.items);
        break;

      case 'number':
        processFloat(nodeValue, nodeSchema);
        break;

      case 'integer':
        processInteger(nodeValue, nodeSchema);
        break;

      case 'boolean':
        processValue(nodeValue ? 1 : 0, 1);
        break;

      default:
        if (nodeSchema.enum) {
          processEnum(nodeValue, nodeSchema);
        } else {
          throw new Error('unsupported: ', nodeSchema.type ? nodeSchema.type : nodeSchema);
        }
    }
  }

  processNode(object, schema);
}

function reconstructObject(schema, getBits) {
  function processInteger(nodeSchema) {
    const range = nodeSchema.maximum - nodeSchema.minimum;
    const bits = requiredBits(range);
    return getBits(bits) - nodeSchema.minimum;
  }

  function processFloat(nodeSchema) {
    const range = nodeSchema.maximum - nodeSchema.minimum;
    const maxValue = parseInt(range * floatingRoundingMultiplier, 10);
    const bits = requiredBits(maxValue);
    return getBits(bits) / floatingRoundingMultiplier + nodeSchema.minimum;
  }

  function processArray(itemSchema) {
    const result = [];
    if (itemSchema.minItems !== itemSchema.maxItems) {
      throw new Error('minItems should maxItems');
    }

    for (let i = 0; i < itemSchema.minItems; i++) {
      result.push(processNode(itemSchema.items));
    }
    return result;
  }

  function processEnum(nodeSchema) {
    const maxIndex = nodeSchema.enum.length;
    const bits = requiredBits(maxIndex);
    return nodeSchema.enum[getBits(bits)];
  }

  function processObject(schemaProperties) {
    const result = {};
    forOwn(schemaProperties.properties, (schemaProperty, nodeName) => {
      result[nodeName] = processNode(schemaProperty);
    });
    return result;
  }

  function processNode(nodeSchema) {
    switch (nodeSchema.type) {
      case 'object':
        return processObject(nodeSchema);

      case 'array':
        return processArray(nodeSchema);

      case 'number':
        return processFloat(nodeSchema);

      case 'integer':
        return processInteger(nodeSchema);

      case 'boolean':
        return getBits(1) === 1;

      default:
        if (nodeSchema.enum) {
          return processEnum(nodeSchema);
        }
        throw new Error('unsupported: ', nodeSchema.type ? nodeSchema.type : nodeSchema);
    }
  }

  return processNode(schema);
}

function createBitsArrayBuffer(length) {
  return new ArrayBuffer(Math.ceil(length / 8));
}

export function objectToBitStream(object, schema, totalBitsRequired) {
  const buffer = createBitsArrayBuffer(totalBitsRequired);
  const bitStream = new BitStream(buffer);

  traceObject(object, schema, (value, bits) => {
    bitStream.writeBits(value, bits);
  });

  return bitStream;
}

export function bitStreamToObject(bitStream, schema) {
  bitStream._index = 0;
  return reconstructObject(schema, (bits) => {
    return bitStream.readBits(bits, false);
  });
}

export function combineChromosomes([bitStream1, bitStream2], chromosomeLength) {
  const buffer = createBitsArrayBuffer(chromosomeLength);
  const result = new BitStream(buffer);

  bitStream1._index = bitStream2._index = 0;

  for (let i = 0; i < chromosomeLength; i++) {
    const a = bitStream1.readBits(1, false);
    const b = bitStream2.readBits(1, false);
    result.writeBits(Math.random() > 0.5 ? a : b, 1);
  }

  return result;
}

export function uint8ArrayToBase64(bytesArray) {
  const count = bytesArray.byteLength;
  let binary = '';
  for (let i = 0; i < count; i++) {
    binary += String.fromCharCode(bytesArray[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const count = binaryString.length;
  const bytes = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
