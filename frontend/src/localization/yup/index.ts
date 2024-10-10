// @ts-nocheck
import * as yup from 'yup';
import i18next from 'i18next';

/**
 * String map to func map
 */
const withTranslation = (source: { [x: string]: string | Function }) => {
  Object.entries(source).map(([key, value]) => {
    source[key] = ({ path, values, min, max, less, more, length }) =>
      i18next
        .t(<string>value)
        .replace(/\$\{path\}/gi, i18next.t(path))
        .replace(/\$\{values\}/gi, i18next.t(values))
        .replace(/\$\{length\}/gi, i18next.t(length))
        .replace(/\$\{min\}/gi, i18next.t(min))
        .replace(/\$\{max\}/gi, i18next.t(max))
        .replace(/\$\{less\}/gi, i18next.t(less))
        .replace(/\$\{more\}/gi, i18next.t(more));
  });

  return source;
};

/**
 * Set formik messages with func handlers
 */
yup.setLocale({
  mixed: withTranslation({
    required: 'errors.mixed.required',
    default: 'errors.mixed.default',
    oneOf: 'errors.mixed.oneOf',
    notOneOf: 'errors.mixed.notOneOf'
  }),
  string: withTranslation({
    length: 'errors.string.length',
    required: 'errors.string.required',
    min: 'errors.string.min',
    max: 'errors.string.max',
    matches: 'errors.string.matches',
    email: 'errors.string.email',
    url: 'errors.string.url',
    trim: 'errors.string.trim',
    lowercase: 'errors.string.lowercase',
    uppercase: 'errors.string.uppercase'
  }),
  number: withTranslation({
    min: 'errors.number.min',
    max: 'errors.number.max',
    lessThan: 'errors.number.lessThan',
    moreThan: 'errors.number.moreThan',
    positive: 'errors.number.positive',
    negative: 'errors.number.negative',
    integer: 'errors.number.integer'
  }),
  date: withTranslation({
    min: 'errors.date.min',
    max: 'errors.date.max'
  }),
  array: withTranslation({
    min: 'errors.array.min',
    max: 'errors.array.max'
  })
});
