'use strict'

const assert = require('./../assert');
const messages = require('./../messages.json');

const Transaction = require('./Transaction');
const HTTP = require('./HTTP');

const secp256k1 = require('secp256k1');
const keccak = require('keccak');
const { randomBytes } = require('crypto');

const conn = new HTTP();

const Account = class Account {
  constructor(data) {
    // Object argument is a full account
    if (Object.prototype.toString.call(data) === '[object Object]') {
      this.name = data.name;
      this.privateKey = data.privateKey;
      this.balance = data.balance;

    // String argument is assumed to be an address
    } else if (Object.prototype.toString.call(data) === '[object String]') {
      this.address = data;
    }
  }

  set name(name) {
    if (name !== undefined) {
      assert.isString(name, messages.ACCOUNT_NAME_ISSTRING);
      assert.isLengthGTZero(name, messages.ACCOUNT_NAME_ISSTRING);
      this._name = name;
    }
  }
  get name() {
    return this._name;
  }

  set privateKey(privateKey) {
    if (privateKey !== undefined) {
      assert.isString(privateKey, messages.ACCOUNT_PRIVATEKEY_ISSTRING);
      assert.isLengthEqualTo(new Buffer.from(privateKey, 'hex'), 32, messages.ACCOUNT_PRIVATEKEY_ISSTRING);
      this._privateKey = privateKey;
    }
  }
  get privateKey() {
    return this._privateKey;
  }

  set balance(balance) {
    if (balance !== undefined) {
      assert.isNumber(balance, messages.ACCOUNT_BALANCE_ISNUMBER);
      assert.isLengthGTZero(balance, messages.ACCOUNT_BALANCE_ISNUMBER);
      this._balance = balance;
    }
  }
  get balance() {
    return this._balance;
  }

  set publicKey(publicKey) {
    if (publicKey !== undefined) {
      assert.isString(publicKey, messages.ACCOUNT_PUBLICKEY_ISSTRING);
      assert.isLengthEqualTo(new Buffer.from(publicKey, 'hex'), 32, messages.ACCOUNT_PUBLICKEY_ISSTRING);
      this._publicKey = publicKey;
    }
  }
  get publicKey() {
    if (this._publicKey !== undefined) {
      return this._publicKey;
    }
    if (this._privateKey) {
      this._publicKey = secp256k1.publicKeyCreate(new Buffer.from(this._privateKey, 'hex'), false).toString('hex');
      return this._publicKey;
    }
    throw new Error(messages.ACCOUNT_PUBLICKEY_MISSINGPRIVATEKEY);
  }

  set address(address) {
    if (address !== undefined) {
      assert.isString(address, messages.ACCOUNT_ADDRESS_ISSTRING);
      this._address = address;
    }
  }
  get address() {
    if (this._address !== undefined) {
      return this._address;
    }
    let hash = keccak('keccak256').update(new Buffer.from(this.publicKey, 'hex').slice(1)).digest();
    this._address = hash.slice(12,32).toString('hex');
    return this._address;
  }

  toJSON() {
    return {
      name: this.name,
      address: this.address,
      privateKey: this.privateKey,
      publicKey: this.publicKey,
      balance: this.balance,
      created: this.created,
      updated: this.updated
    };
  }

  toString() {
    return JSON.stringify(this);
  }
  inspect() {
    return this.toString();
  }

  refresh() {
    if (!this._refreshCall) {
      this._refreshCall = new Promise((resolve, reject) => {
        conn.getFromDelegate(
          {
            path: '/' + conn.config.apiVersion + conn.config.routes.accountStatus + this.address
          }
        ).then((d) => {
          if (d.status === 'Ok') {
            this.balance = d.data.balance;
            this.created = d.data.created;
            this.updated = d.data.updated;
            resolve(d.data);
          } else {
            reject(d);
          }
          delete this._refreshCall;
        }, (e) => {
          reject(e);
          delete this._refreshCall;
        });
      });
    }
    return this._refreshCall;
  }

  init() {
    let privateKey;
    do {
      privateKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));
    this.privateKey = privateKey.toString('hex');
    delete this._publicKey;
    return this;
  }

  sendTokens(to, tokens) {
    assert.isNumber(tokens, messages.TRANSACTION_TOKENS_ISNUMBER);
    const tx = new Transaction({
      from: this,
      to: to,
      tokens: tokens
    });
    tx.send()
      .then((d) => {
        // console.log(d);
        this._balance = this._balance - tokens;
        to.balance = to.balance + tokens;
      })
      .catch((e) => {
        console.error(e);
      });
    return tx;
  }

  createContract(code, abi, tokens) {
    const tx = new Transaction({
      type: 1,
      from: this,
      to: new Account(''),
      tokens: tokens,
      code: code,
      abi: abi
    });
    tx.send()
      .then((d) => {
        // console.log(d);
        this._balance = this._balance - (tokens || 0);
      })
      .catch((e) => {
        console.error(e);
      });
    return tx;
  }

  executeContract(to, method, params, abi, tokens) {
    if (to.constructor.name === 'Transaction') {
      to = new Account(to.address);
    }
    const tx = new Transaction({
      type: 2,
      from: this,
      to: to,
      tokens: tokens,
      method: method,
      params: params,
      abi: abi
    });
    tx.send()
      .then((d) => {
        // console.log(d);
        this._balance = this._balance - (tokens || 0);
      })
      .catch((e) => {
        console.error(e);
      });
    return tx;
  }
};

module.exports = Account;