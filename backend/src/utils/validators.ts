export const isString = (x: unknown): x is string => typeof x === 'string';
export const isNumber = (x: unknown): x is number => typeof x === 'number';
export const isBoolean = (x: unknown): x is boolean => typeof x === 'boolean';
export const isFilledString = (x: unknown): x is string => isString(x) && x.length !== 0;
export const isArray = (x: unknown): x is unknown[] => Array.isArray(x);
export const isEmail = (x: unknown): x is string => {
  const emailRegExp = /^([\w]+((-|.)?([\w+])?)){2,}@\w{2,}\.\w{2,}(\.\w{2,})?$/;
  return isString(x) && emailRegExp.test(x);
};

const validateProperty = (object: Object, property: string, validator: (x: unknown) => boolean): boolean =>
  object.hasOwnProperty(property) && validator(object[property]);

export default {
  isArray,
  isBoolean,
  isString,
  isNumber,
  isEmail,
  isFilledString,
  validateProperty,
};