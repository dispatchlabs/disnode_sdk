/*!
 * @dispatchlabs/disnode-sdk <https://github.com/dispatchlabs/disnode_sdk>
 *
 * Copyright © 2018, [Dispatch Labs](http://dispatchlabs.io).
 * Released under the LGPL v3 License.
 */

'use strict'

const bigInt = require('big-integer');

var toString = Object.prototype.toString;

// TypeError
exports.isString = (value, message) => {
  if (toString.call(value) !== '[object String]') throw TypeError(message);
}

exports.isNumber = (value, message) => {
  if (toString.call(value) !== '[object Number]') throw TypeError(message);
}

exports.isArray = (value, message) => {
  if (!Array.isArray(value)) throw TypeError(message);
}

exports.isObject = (value, message) => {
  if (toString.call(value) !== '[object Object]') throw TypeError(message);
}

exports.exists = (value, message) => {
	if (value === null || value === undefined) throw TypeError(message);
};

exports.isPositiveNumber = (value, message) => {
  if (bigInt.isInstance(value) === true) {
    if (value.isPositive() === false) throw RangeError(message);
  } else {
    if (toString.call(value) !== '[object Number]') throw TypeError(message);
    if (value <= 0) throw RangeError(message);
  }
}

exports.isGTEZero = (value, message) => {
  if (bigInt.isInstance(value) === true) {
    if (value.isNegative() === true) throw RangeError(message);
  } else {
    if (toString.call(value) !== '[object Number]') throw TypeError(message);
    if (value < 0) throw RangeError(message);
  }
}

exports.isNumberOrNull = (value, message) => {
  if (value !== null && toString.call(value) !== '[object Number]') throw TypeError(message);
}

exports.isAccountable = (value, message) => {
	if (['[object String]', '[object Object]'].indexOf(toString.call(value)) === -1) throw TypeError(message);
}

// RangeError
exports.isLengthEqualTo = (value, length, message) => {
  if (value.length !== length) throw RangeError(message);
}

exports.isLengthGTZero = (value, message) => {
  if (value.length <= 0) throw RangeError(message);
}

exports.isNumberInRange = (value, l, h, message) => {
	if (toString.call(value) !== '[object Number]') throw TypeError(message);
  if (value < l || value > h) throw RangeError(message);
}
