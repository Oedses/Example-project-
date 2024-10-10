const regex = {
  email: /^([\w\.\-]+)@([\w\-]+)((\.(\w){2,})+)$/,
  phone:  /^(\s*)?(\+)?\d{8,15}$/,
  postcode: /^\d{4}\s?\w{2}$/,
  alphabetic: /^[a-zA-Z][a-zA-Z\s\-]*$/,
  onlyLetters: /^[a-zA-Z\s\—\-]+$/,
  lettersAndNumbers: /^[A-Za-z0-9\s\.\-\,]+$/,
  plusAndNumbersOnly: /^(\s*)?(\+)?[\d]*$/,
  numbersOnly: /^[\d]+$/,
  numbersWithPlus: /^[\d+]+$/,
  numbersDecimal: /^\d+(?:[\.]\d*)?$/,
  withNumbers: /\d/,
  currency: /^[+-]?[0-9]{1,3}(?:[0-9]*(?:[.,][0-9]{2})?|(?:,[0-9]{3})*(?:\.[0-9]{2})?|(?:\.[0-9]{3})*(?:,[0-9]{2})?)$/,
  allEmojis: /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/,
  unicodeSymbols: /[^\u0000-\u007F]+]/,
  vat: /^[\w]{2}[\d]{9}$/
};

export default regex;