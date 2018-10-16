/*!
 * @dispatchlabs/disnode-sdk <https://github.com/dispatchlabs/disnode_sdk>
 *
 * Copyright © 2018, [Dispatch Labs](http://dispatchlabs.io).
 * Released under the LGPL v3 License.
 */

'use strict'

const assert = require('./../assert');
const messages = require('./../messages.json');

const Network = require('./Network');

const secp256k1 = require('secp256k1');
const keccak = require('keccak');
const { randomBytes } = require('crypto');

/**
 * Account constructor. Create an instance of an account, which can then be used to interact with the network.
 *
 * ```js
 * // Create an empty account
 * let account = new DisNodeSDK.Account();
 * ```
 *
 * ```js
 * // Create an account using a known address
 * let account = new DisNodeSDK.Account('fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d');
 * ```
 *
 * ```js
 * // Create an account using an object
 * let account = new DisNodeSDK.Account({
 *  name: 'MyAccount',
 *  address: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
 *  privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e'
 * });
 * ```
 *
 * @name constructor
 * @constructor
 * @returns {Object} instance of `Account`
 * @api public
 */
const Account = module.exports = class Account {
  constructor(data) {
    // Object argument is a full account
    if (Object.prototype.toString.call(data) === '[object Object]') {
      this.name = data.name;
      this.privateKey = data.privateKey;
      this.balance = data.balance;
      this.address = data.address;

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
    if (this.publicKey) {
      const hash = keccak('keccak256').update(new Buffer.from(this.publicKey, 'hex').slice(1)).digest();
      this._address = hash.slice(12,32).toString('hex');
      return this._address;
    }
  }
  get abi() {
    if (this.transaction !== undefined) {
      return this.transaction.abi;
    }
  }

  toJSON() {
    return {
      name: this.name,
      address: this.address,
      privateKey: this.privateKey,
      publicKey: this.publicKey,
      balance: this.balance,
      transaction: this.transaction,
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

/**
 * Refreshes the account balance and access info (created and updated dates) from a delegate.
 *
 * ```js
 * let account = new DisNodeSDK.Account('fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d');
 * account.refresh()
 *   .then(() => {
 *     console.log(account);
 *   })
 *   .catch((err) => {
 *     console.error(err); 
 *   });
 * ```
 *
 * @name refresh
 * @returns {Promise} Promise that will return the result of the Delegate request after updating account object.
 * @api public
 */
  refresh() {
    assert.isString(this.address, messages.ACCOUNT_ADDRESS_ISSTRING);
    if (!this._refreshCall) {
      this._refreshCall = new Promise((resolve, reject) => {
        const network = new Network();
        network.getFromDelegate(
          {
            path: '/' + network.config.apiVersion + network.config.routes.accountStatus + this.address
          }
        ).then((d) => {
          if (d.status === 'Ok') {
            this.balance = d.data.balance;
            this.created = new Date(d.data.created);
            this.updated = new Date(d.data.updated);
            if (d.data.transactionHash !== undefined) {
              this.transaction = new Transaction(d.data.transactionHash);
              this.transaction.status()
                .then((tData) => {
                  resolve(d.data);
                }, (err) => {
                  process.env.DEBUG ? console.log('Account.transaction.status() error: ' + err) : null;
                  resolve(d.data);
                });
            } else {
              resolve(d.data);
            }
          } else {
            reject(d);
          }
          delete this._refreshCall;
        })
        .catch((e) => {
          reject(e);
          delete this._refreshCall;
        });
      });
    }
    return this._refreshCall;
  }

/**
 * Generaes a new private key for the account object (replacing one if present).
 *
 * ```js
 * let account = new DisNodeSDK.Account();
 * account.init();
 * console.log(account);
 * ```
 *
 * @name init
 * @returns {Account} Returns the account object for use in chaining.
 * @api public
 */
  init() {
    let privateKey;
    do {
      privateKey = randomBytes(32);
    } while (!secp256k1.privateKeyVerify(privateKey));
    this.privateKey = privateKey.toString('hex');
    delete this._publicKey;
    delete this._address;
    delete this._balance;
    delete this.created;
    delete this.updated;
    return this;
  }

/**
 * Creates and sends a transaction that will transfer tokens from the source account, to the target account.
 *
 * ```js
 * let account = new DisNodeSDK.Account('fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d');
 * // Send one (1) token
 * let tx = account.sendTokens(new DisNodeSDK.Account().init(), 1);
 * ```
 *
 * @name sendTokens
 * @param {string|Account} to - The address or Account to send the tokens to.
 * @param {number} value - The number of tokens to send.
 * @returns {Transaction} Returns a transaction which has already been sent.
 * @api public
 */
  sendTokens(to, value) {
    assert.isAccountable(to, messages.TRANSACTION_TO_ISACCOUNTABLE);
    assert.isPositiveNumber(value, messages.TRANSACTION_VALUE_ISPOSITIVENUMBER);
    const tx = new Transaction({
      from: this,
      to: to,
      value: value,
      time: +(new Date())-10
    });
    tx.send()
      .then((d) => {
        // console.log(d);
        this._balance = this._balance - value;
        if (to.constructor.name === 'Account' && to.balance !== undefined) {
          to.balance = to.balance + value;
        }
      })
      .catch((e) => {
        console.error(e);
      });
    return tx;
  }

/**
 * Creates and sends a transaction from the account that will create a new Smart Contract.
 *
 * ```js
 * let account = new DisNodeSDK.Account('fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d');
 * let compiled = DisNodeSDK.Transaction.compileSource('contract x { function g() { } }');
 * let contract = account.createContract(compiled.contracts[0].bytecode, compiled.contracts[0].abi, 5);
 * ```
 *
 * @name createContract
 * @param {string} code - Bytecode of a compiled contract.
 * @param {string|array} code - The ABI of the contract.
 * @param {number} value - The number of tokens to seed the contract with.
 * @returns {Transaction} Returns a transaction which has already been sent.
 * @api public
 */
  createContract(code, abi, value) {
    assert.isString(code, messages.TRANSACTION_CODE_ISSTRING);
    assert.isLengthGTZero(code, messages.TRANSACTION_CODE_ISSTRING);
    assert.isArray(abi, messages.TRANSACTION_ABI_ISARRAY);
    if (value !== undefined) {
      assert.isPositiveNumber(value, messages.TRANSACTION_VALUE_ISPOSITIVENUMBER);
    }
    const tx = new Transaction({
      type: 1,
      from: this,
      value: value,
      code: code,
      abi: abi,
      time: +(new Date())-10
    });
    tx.send()
      .then((d) => {
        // console.log(d);
        value !== undefined ? this._balance = this._balance - value : null;
      })
      .catch((e) => {
        console.error(e);
      });
    return tx;
  }

/**
 * Creates and sends a transaction from the account that will execute a method on an existing Smart Contract.
 *
 * ```js
 * let account = new DisNodeSDK.Account('fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d');
 * let compiled = DisNodeSDK.Transaction.compileSource('contract x { function g() { } }');
 * let contract = account.createContract(compiled.contracts[0].bytecode, compiled.contracts[0].abi, 5);
 * contract.whenStatusEquals('Ok')
 *   .then(() => {
 *     account.executeContract(contract, 'g', [], 5);
 *   })
 *   .catch((err) => {
 *     console.error(err);
 *   });
 * ```
 *
 * @name executeContract
 * @param {string|Account|Transaction} to - The address of an existing contract, an Account representing the contract, or the contract creation Transaction.
 * @param {string} method - The method in the contract to call.
 * @param {array} params - The parameters to use during the method call.
 * @param {number} value - The number of tokens to send to the contract for the method call.
 * @returns {Transaction} Returns a transaction which has already been sent.
 * @api public
 */
  executeContract(to, method, params, value) {
    assert.isAccountable(to, messages.TRANSACTION_TO_ISACCOUNTABLE);
    assert.isString(method, messages.TRANSACTION_METHOD_ISSTRING);
    assert.isArray(params, messages.TRANSACTION_PARAMS_ISARRAY);
    if (value !== undefined) {
      assert.isPositiveNumber(value, messages.TRANSACTION_VALUE_ISPOSITIVENUMBER);
    }
    if (to.constructor.name === 'Transaction') {
      to = new Account(to.address);
    } else if (Object.prototype.toString.call(to) === '[object String]') {
      to = new Account(to);
    }
    const tx = new Transaction({
      type: 2,
      from: this,
      to: to,
      value: value || 0,
      method: method,
      params: params,
      time: +(new Date())-10
    });
    tx.send()
      .then((d) => {
        // console.log(d);
        this._balance = this._balance - (value || 0);
      })
      .catch((e) => {
        console.error(e);
      });
    return tx;
  }
};

const Transaction = require('./Transaction');
