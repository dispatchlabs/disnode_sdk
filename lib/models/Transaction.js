/*!
 * @dispatchlabs/disnode-sdk <https://github.com/dispatchlabs/disnode_sdk>
 *
 * Copyright © 2018, [Dispatch Labs](http://dispatchlabs.io).
 * Released under the LGPL v3 License.
 */

'use strict';

const assert = require('./../assert');
const messages = require('./../messages.json');

const Network = require('./..').Network;

const secp256k1 = require('secp256k1');
const keccak = require('keccak');
const solc = require('solc');

function numberToBuffer(value) {
  let bytes = [0, 0, 0, 0, 0, 0, 0, 0],
      i = 0;
  for (; i < bytes.length; i++) {
    const byte = value & 0xff;
    bytes[i] = byte;
    value = (value - byte) / 256;
  }
  return new Buffer(bytes);
}

/**
 * Transaction constructor. Create an instance of a transaction, which can then be sent to a delegate.
 *
 * ```js
 * // Create a new transaction
 * let account = new DisNodeSDK.Account().init();
 * let tx = new DisNodeSDK.Transaction({from: account});
 * ```
 *
 * @name constructor
 * @constructor
 * @returns {Object} instance of `Transaction`
 * @api public
 */
const Transaction = module.exports = class Transaction {
  constructor(data) {
    this.type = data.type !== undefined ? data.type : 0; // default to token transfer
    this.from = data.from;
    this.to = data.to || '';
    this.value = data.value;
    this.time = data.time !== undefined ? data.time : new Date();

    this.code = data.code;
    this.abi = data.abi;
    this.method = data.method;
    this.params = data.params;

    this.hash = data.hash;
    this.signature = data.signature;
    this.address = data.address;
    this._id = data.id;

    this.hertz = data.hertz;
  }

  set type(type) {
    assert.isNumber(type, messages.TRANSACTION_TYPE_ISNUMBERINRANGE);
    assert.isNumberInRange(type, 0, 2, messages.TRANSACTION_TYPE_ISNUMBERINRANGE);
    this._type = type;
  }
  get type() {
    return this._type || 0;
  }
  get typeBuffer() {
    return Buffer.from(('0' + this.type).slice(-2), 'hex');
  }

  set from(from) {
    assert.isAccountable(from, messages.TRANSACTION_FROM_ISACCOUNTABLE);
    if (from.constructor.name !== 'Account') {
      this._from = new Account(from);
    } else {
      this._from = from;
    }
  }
  get from() {
    return this._from;
  }

  set to(to) {
    if (to !== undefined) {
      assert.isAccountable(to, messages.TRANSACTION_TO_ISACCOUNTABLE);
      if (to.constructor.name !== 'Account') {
        this._to = new Account(to);
      } else {
        this._to = to;
      }
    }
  }
  get to() {
    if (this._to === undefined) {
      this._to = new Account();
    }
    return this._to;
  }

  set value(value) {
    if (value !== undefined) {
      assert.isPositiveNumber(value, messages.TRANSACTION_VALUE_ISPOSITIVENUMBER);
      this._value = value;
    }
  }
  get value() {
    return this._value || 0;
  }

  set time(time) {
    try {
      time = new Date(time);
      if (isNaN(time)) {
        throw Error();
      }
    } catch(e) {
      throw TypeError(messages.TRANSACTION_TIME_ISDATE);
    }
    this._time = time;
  }
  get time() {
    return this._time;
  }
  get timeBuffer() {
    return numberToBuffer(+(this._time));
  }

  set code(code) {
    if (code !== undefined) {
      assert.isString(code, messages.TRANSACTION_CODE_ISSTRING);
      assert.isLengthGTZero(code, messages.TRANSACTION_CODE_ISSTRING);
      this._code = code;
    }
  }
  get code() {
    return this._code || '';
  }

  set abi(abi) {
    if (abi !== undefined) {
      if (Object.prototype.toString.call(abi) === '[object String]') {
        abi = JSON.parse(abi);
      }
      assert.isArray(abi, messages.TRANSACTION_ABI_ISARRAY);
      this._abi = abi;
    }
  }
  get abi() {
    return this._abi || {};
  }
  get abiString() {
    if (this.type === 2) {
      return new Buffer(JSON.stringify(this.abi)).toString('hex');
    }
    return JSON.stringify(this.abi);
  }

  set method(method) {
    if (method !== undefined) {
      assert.isString(method, messages.TRANSACTION_METHOD_ISSTRING);
      this._method = method;
    }
  }
  get method() {
    return this._method || '';
  }

  set params(params) {
    if (params !== undefined) {
      assert.isArray(params, messages.TRANSACTION_PARAMS_ISARRAY);
      this._params = params;
    }
  }
  get params() {
    return this._params || [];
  }

  set hash(hash) {
    if (hash !== undefined) {
      assert.isString(hash, messages.TRANSACTION_HASH_ISSTRING);
      this._hash = hash;
    }
  }
  get hash() {
    if (this._hash !== undefined) {
      return this._hash;
    }
    assert.isString(this.from.address, messages.TRANSACTION_FROMACCOUNT_ISVALID);
    this._hash = keccak('keccak256').update(Buffer.concat([
      this.typeBuffer,
      new Buffer.from(this.from.address, 'hex'),
      new Buffer.from(this.to.address !== null ? this.to.address : '', 'hex'),
      new numberToBuffer(this.value),
      new Buffer.from(this.code, 'hex'),
      new Buffer.from(this.abiString),
      new Buffer.from(this.method),
      this.timeBuffer
    ])).digest().toString('hex');
    return this._hash;
  }
  get id() {
    return this._id !== undefined ? this._id : this.hash;
  }

  set signature(signature) {
    if (signature !== undefined) {
      assert.isString(signature, messages.TRANSACTION_SIGNATURE_ISSTRING);
      this._signature = signature;
    }
  }
  get signature() {
    if (this._signature !== undefined) {
      return this._signature;
    }
    if (this.from.privateKey !== undefined) {
      const sig = secp256k1.sign(Buffer.from(this.hash, 'hex'), Buffer.from(this.from.privateKey, 'hex'));
      const signatureBytes = new Uint8Array(65);
      for (let i = 0; i < 64; i++) {
          signatureBytes[i] = sig.signature[i];
      }
      signatureBytes[64] = sig.recovery;
      this._signature = new Buffer(signatureBytes).toString('hex');
    }
    return this._signature;
  }

  set address(address) {
    if (address !== undefined) {
      assert.isString(address, messages.TRANSACTION_ADDRESS_ISSTRING);
      this._address = address;
    }
  }
  get address() {
    if (this._address === undefined && this.signature !== undefined) {
      // TODO - Fix this...
      // const publicKey = secp256k1.recover(Buffer.from(this.hash, 'hex'), Buffer.from(this.signature, 'hex').slice(0,64), 0);
      // const hash = keccak('keccak256').update(publicKey.slice(1)).digest();
      // this._address = hash.slice(12,32).toString('hex');
    }
    return this._address;
  }

  toJSON() {
    return {
      hash: this.hash,
      type: this.type,
      from: this.from.address,
      to: this.to.address,
      value: this.value,
      code: this.code,
      abi: this.abiString,
      method: this.method,
      params: this.params,
      time: +(this.time),
      signature: this.signature,
      hertz: this.hertz || 0,
      fromName: this.from.name,
      toName: this.to.name,
      address: this.address
    };
  }

  toString() {
    return JSON.stringify(this);
  }
  inspect() {
    return this.toString();
  }

/**
 * Sends the transaction to a delegate.
 *
 * ```js
 * let account = new DisNodeSDK.Account().init();
 * let tx = new DisNodeSDK.Transaction({from: account});
 * tx.send()
 *   .then((result) => {
 *     console.log(result);
 *   })
 *   .catch((err) => {
 *     console.error(err);
 *   });
 * ```
 *
 * @name send
 * @returns {Promise} Promise that will return the result of the Delegate request.
 * @api public
 */
  send() {
    if (!this._sendCall) {
      let network = new Network();
      this._sendCall = network.postToDelegate(
        {
          path: '/' + network.config.apiVersion + network.config.routes.transactionSend
        },
        this
      );
      this._sendCall.then((data) => {
        this._id = data.id;
        process.env.DEBUG ? console.log('Transaction.send result: ' + JSON.stringify(data)) : null;
      }, (err) => {
        this._sendError = err;
        process.env.DEBUG ? console.log('Transaction.send error: ' + err) : null;
      });
    }
    return this._sendCall;
  }

 /**
 * Requests the current status of the transaction from a delegate.
 *
 * ```js
 * let account = new DisNodeSDK.Account().init();
 * let tx = new DisNodeSDK.Transaction({from: account});
 * tx.send();
 * tx.status()
 *   .then((result) => {
 *     console.log(result);
 *   })
 *   .catch((err) => {
 *     console.error(err);
 *   });
 * ```
 *
 * @name status
 * @returns {Promise} Promise that will return the result of the status check.
 * @api public
 */
  status() {
    if (!this._statusCall) {
      this._statusCall = new Promise((resolve, reject) => {
        let network = new Network();
        const getStatus = () => {
          network.getFromDelegate(
            {
              path: '/' + network.config.apiVersion + network.config.routes.transactionStatus + this.id
            }
          ).then((d) => {
            if (d.status === 'Ok') {
              this.address = d.data.contractAddress;
              resolve(d.data);
            } else {
              reject(d);
            }
            delete this._statusCall;
          }, (e) => {
            reject(e);
            delete this._statusCall;
          });
        }
        if (this._sendCall) {
          this._sendCall.then((data) => {
            getStatus();
          }, (e) => {
            reject(e);
            delete this._statusCall;
          });
        } else if (this._sendError) {
          reject(this._sendError);
        } else {
          getStatus();
        }
      });
    }
    return this._statusCall;
  }

 /**
 * Waits until the status of the transaction matches the value provided, then resolves. Rejects after 5 seconds or when the transaction hits a non-matching final state.
 *
 * ```js
 * let account = new DisNodeSDK.Account().init();
 * let tx = new DisNodeSDK.Transaction({from: account});
 * tx.send();
 * tx.whenStatusEquals('Ok')
 *   .then((result) => {
 *     console.log(result);
 *   })
 *   .catch((err) => {
 *     console.error(err);
 *   });
 * ```
 *
 * @name whenStatusEquals
 * @param {string} status - Desired status for the transaction to acheive.
 * @returns {Promise} Promise that will return the result of the status check. If a timeout occured, the returned data will be the latest known state along with a key of `SDKTimeout: true`.
 * @api public
 */
  whenStatusEquals(status) {
    const self = this;
    return new Promise((resolve, reject) => {
      const maxTries = 10;
      let currentTry = 0,
          last;

      function getStatus() {
        currentTry++;
        if (currentTry > maxTries) {
          if (last !== undefined) {
            last.SDKTimeout = true;
          }
          reject(last);
          return;
        }
        self.status()
          .then((data) => {
            if (data.status === status) {
              resolve(data);
            } else {
              if (['Pending','NotFound'].indexOf(data.status) > -1) {
                last = data;
                setTimeout(getStatus, 500);
              } else {
                reject(data);
              }
            }
          })
          .catch((e) => {
            reject(e);
        });
      }
      getStatus();
    });
  }

/**
 * @typedef {Object} compiledContract
 * @property {string} contract The name of the contract.
 * @property {string} bytecode The bytecode of the contract.
 * @property {Array} abi The ABI structure for the contract.
 */

/**
 * @typedef {Object} compiledSource
 * @property {compiledContract[]} contracts The compiled contracts from the source provided.
 * @property {Object[]} errors Any fatal errors thrown during compilation.
 * @property {Object[]} warnings Any warnings thrown during compilation.
 */

 /**
 * Static method to compile Solidity code directly.
 *
 * ```js
 * let account = new DisNodeSDK.Account().init();
 * let compiled = DisNodeSDK.Transaction.compileSource('contract x { function g() { } }');
 * if (compiled.errors.length > 0) {
 *   // Errors are fatal
 *   console.error(compiled.errors);
 * } else {
 *   // Warnings are non-fatal
 *   if (compiled.warnings.length > 0) {
 *     console.log(compiled.warnings);
 *   }
 *   // compiled.contracts contains the name, bytecode, and abi for each contract contained within the source
 *   const contract = account.createContract(compiled.contracts[0].bytecode, compiled.contracts[0].abi);
 * }
 * ```
 *
 * @name compileSource
 * @memberOf Transaction
 * @param {string} source - Solidity source code containing one or more contracts.
 * @returns {compiledSource} Compiled output JSON.
 * @api public
 */
  static compileSource(source) {
    assert.isString(source, messages.TRANSACTION_COMPILESOURCE_ISSTRING);
    assert.isLengthGTZero(source, messages.TRANSACTION_COMPILESOURCE_ISSTRING);
    let input = {
      language: 'Solidity',
      sources: {
        source: {
          content: source
        }
      }
    };
    let compiled = this.compile(input);
    let ret = {
      contracts: [],
      errors: [],
      warnings: []
    };
    Object.keys(compiled.contracts.source).forEach((k) => {
      ret.contracts.push({
        contract: k,
        bytecode: compiled.contracts.source[k].evm.bytecode.object,
        abi: compiled.contracts.source[k].abi
      });
    });
    (compiled.errors || []).forEach((e) => {
      if (e.severity === 'warning') {
        ret.warnings.push(e);
      } else {
        ret.errors.push(e);
      }
    });
    return ret;
  }

 /**
 * Static method to compile complex Solidity JSON structures.
 *
 * ```js
 * let compiled = DisNodeSDK.Transaction.compile({language: 'Solidity', sources: { source: { content: 'contract x { function g() { } }' }}});
 * ```
 *
 * @name compile
 * @memberOf Transaction
 * @param {object} input - Full Solidity JSON structure. See [Compiler Input and Output JSON Description](https://solidity.readthedocs.io/en/develop/using-the-compiler.html#compiler-input-and-output-json-description).
 * @returns {object} Compiled output JSON.
 * @api public
 */
  static compile(input, findImports) {
    assert.isObject(input, messages.TRANSACTION_COMPILE_ISOBJECT);
    const find = (path) => {
      if (findImports === undefined) {
        return { error: 'Files not supported' };
      } else {
        return findImports(path);
      }
    };
    input.settings = Object.assign({
      optimizer: { enabled: true },
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object']
        }
      }
    }, input.settings);
    const ret = solc.compileStandardWrapper(JSON.stringify(input), find);
    return JSON.parse(ret);
  }
};

const Account = require('./Account');
