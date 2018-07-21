'use strict'

var toString = Object.prototype.toString;

// TypeError
exports.isString = function (value, message) {
  if (toString.call(value) !== '[object String]') throw TypeError(message);
}

exports.isNumber = function (value, message) {
  if (toString.call(value) !== '[object Number]') throw TypeError(message);
}

exports.isNumberOrNull = function (value, message) {
  if (value !== null && toString.call(value) !== '[object Number]') throw TypeError(message);
}

exports.isLengthEqualTo = function (value, length, message) {
  if (value.length !== length) throw RangeError(message);
}

exports.isLengthGTZero = function (value, message) {
  if (value.length <= 0) throw RangeError(message);
}

exports.isNumberInRange = function (value, l, h, message) {
  if (toString.call(value) !== '[object Number]' || value <= l || value >= h) throw RangeError(message);
}
