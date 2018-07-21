'use strict';

const assert = require('./../assert');
const messages = require('./../messages.json');

const Account = require('./Account');
const HTTP = require('./HTTP');

const secp256k1 = require('secp256k1');
const keccak = require('keccak');

const conn = new HTTP();

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

const Transaction = class Transaction {
  constructor(data) {
    this._type = data.type || 0; // default to token transfer
    this.from = data.from;
    this.to = data.to || new Account('');
    this.tokens = data.tokens;
    this.time = data.time || +(new Date());

    this.code = data.code;
    this.abi = data.abi;
    this.method = data.method;

    this.hertz = data.hertz;
  }

  set type(type) {
    assert.isNumberInRange(type, 0, 2, messages.TRANSACTION_TYPE_ISNUMBERINRANGE);
    this._type = type;
  }
  get type() {
    return parseInt(this._type, 10);
  }
  get typeBuffer() {
    return Buffer.from(('0' + this.type).slice(-2), 'hex');
  }

  set from(from) {
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
    if (to.constructor.name !== 'Account') {
      this._to = new Account(to);
    } else {
      this._to = to;
    }
  }
  get to() {
    return this._to;
  }

  set tokens(tokens) {
    this._tokens = tokens || 0;
  }
  get tokens() {
    return parseInt(this._tokens, 10);
  }

  set code(code) {
    this._code = code;
  }
  get code() {
    return this._code || '';
  }

  set abi(abi) {
    this._abi = abi;
  }
  get abi() {
    return this._abi || '';
  }

  set method(method) {
    this._method = method;
  }
  get method() {
    return this._method || '';
  }

  set hash(hash) {
    this._hash = hash;
  }
  get hash() {
    if (this._hash) {
      return this._hash;
    }
    this._hash = keccak('keccak256').update(Buffer.concat([
      this.typeBuffer,
      new Buffer.from(this.from.address, 'hex'),
      new Buffer.from(this.to.address, 'hex'),
      new numberToBuffer(this.tokens),
      new Buffer.from(this.code, 'hex'),
      new Buffer.from(JSON.stringify(this.abi)),
      new Buffer.from(this.method),
      new numberToBuffer(this.time)
    ])).digest().toString('hex');
    return this._hash;
  }

  get signature() {
    if (this._signature) {
      return this._signature;
    }
    const sig = secp256k1.sign(Buffer.from(this.hash, 'hex'), Buffer.from(this.from.privateKey, 'hex'));
    const signatureBytes = new Uint8Array(65);
    for (let i = 0; i < 64; i++) {
        signatureBytes[i] = sig.signature[i];
    }
    signatureBytes[64] = sig.recovery;
    this._signature = new Buffer(signatureBytes).toString('hex');
    return this._signature;
  }

  toJSON() {
    return {
      hash: this.hash,
      type: this.type,
      from: this.from.address,
      to: this.to.address,
      value: this.tokens,
      code: this.code,
      abi: JSON.stringify(this.abi),
      method: this.method,
      params: this.params,
      time: this.time,
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

  send() {
    if (!this._sendCall) {
      this._sendCall = conn.postToDelegate(
        {
          path: '/' + conn.config.apiVersion + conn.config.routes.transactionSend
        },
        this
      );
      this._sendCall.then((data) => {
        this.id = data.id;
      });
    }
    return this._sendCall;
  }

  get status() {
    if (!this._statusCall) {
      this._statusCall = new Promise((resolve, reject) => {
        const getStatus = () => {
          conn.getFromDelegate(
            {
              path: '/' + conn.config.apiVersion + conn.config.routes.transactionStatus + this.id
            }
          ).then((d) => {
            if (d.status === 'Ok' && d.contractAddress) {
              this.address = d.contractAddress;
            }
            resolve(d);
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
        } else {
          getStatus();
        }
      });
    }
    return this._statusCall;
  }

  whenStatusEquals(status) {
    const self = this;
    return new Promise((resolve, reject) => {
      const maxTries = 10;
      let currentTry = 0,
          last;

      function getStatus() {
        currentTry++;
        if (currentTry > maxTries) {
          reject(last);
          return;
        }
        self.status
          .then((data) => {
            if (data.status === status) {
              resolve(data);
            } else {
              if (['Pending','NotFound'].indexOf(data.status) > -1) {
                last = data;
                setTimeout(getStatus, 200);
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
};

module.exports = Transaction;