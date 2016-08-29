import { reduce, clone } from 'lodash';

const bitsPerByte = 8;

function repeat(str, inputNumber) {
  let num = clone(inputNumber);
  if (str.length === 0 || num <= 1) {
    if (num === 1) {
      return str;
    }

    return '';
  }

  let result = '';
  let pattern = str;

  while (num > 0) {
    if (num & 1) {
      result += pattern;
    }

    num >>= 1;
    pattern += pattern;
  }

  return result;
}

function padding(obj, str, num) {
  return repeat(str, num - obj.length) + obj;
}


export default function uint8ArrayToChromosome(array) {
  return reduce(array, (result, element) => {
    return result + padding(element.toString(2), '0', bitsPerByte);
  }, '');
}
