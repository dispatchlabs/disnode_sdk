/*!
 * @dispatchlabs/disnode-sdk <https://github.com/dispatchlabs/disnode_sdk>
 *
 * Copyright © 2018, [Dispatch Labs](http://dispatchlabs.io).
 * Released under the LGPL v3 License.
 */

'use strict'

const assert = require('chai').assert;

const DisNodeSDK = require('../');

const stubData = require('./stubs')(DisNodeSDK);

describe('Account creation', () => {

  it('Should be able to be instantiated empty', () => {
    const a = new DisNodeSDK.Account();
    assert.equal(a.constructor.name, 'Account');
    assert.equal(a.toString(), '{}');
    assert.equal(a.inspect(), '{}');
    assert.deepEqual(a.toJSON(), stubData.Account.empty);
  });

  it('Should be able to be instantiated with a string (address)', () => {
    const a = new DisNodeSDK.Account(stubData.Account.A1.address);
    assert.equal(a.address, stubData.Account.A1.address);
    assert.equal(a.toString(), '{"address":"' + stubData.Account.A1.address + '"}');
    assert.equal(a.inspect(), '{"address":"' + stubData.Account.A1.address + '"}');
    assert.deepEqual(a.toJSON(), Object.assign({}, stubData.Account.empty, {address: stubData.Account.A1.address}));
  });

  it('Should be able to be instantiated with an object', () => {
    const a = new DisNodeSDK.Account(stubData.Account.A1);
    assert.equal(a.toString(), stubData.Account.A1_str);
    assert.equal(a.inspect(), stubData.Account.A1_str);
    assert.deepEqual(a.toJSON(), stubData.Account.A1);
  });

  it('Should be able to auto-generate values with only the privateKey', () => {
    const a = new DisNodeSDK.Account({privateKey: stubData.Account.A1.privateKey, balance: 5});
    assert.equal(a.toString(), stubData.Account.A1_str);
    assert.equal(a.inspect(), stubData.Account.A1_str);
    assert.deepEqual(a.toJSON(), stubData.Account.A1);
  });

  it('Account.init() should generate a privateKey', () => {
    const a = new DisNodeSDK.Account().init();
    assert.exists(a.privateKey);
  });

});

describe('Account methods', () => {

  it('Account.refresh requires an address', () => {
    assert.throws(() => { new DisNodeSDK.Account().refresh(); }, TypeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Account(stubData.Account.A1.address).refresh() });
  });

  it('Account.refresh should update the data', () => {
    let a = new DisNodeSDK.Account(stubData.Account.A1);
    assert.equal(a.balance, 5);
    assert.equal(a.created, undefined);
    assert.equal(a.updated, undefined);
    return a.refresh()
      .then(() => {
        assert.equal(a.balance, 10);
        assert.equal(a.created.getTime(), new Date('2018-07-21T06:14:31.300253473Z').getTime());
        assert.equal(a.updated.getTime(), new Date('2018-07-21T06:14:31.300253473Z').getTime());
      });
  });

  it('Account.sendTokens requires "to" and "tokens"', () => {
    const a = new DisNodeSDK.Account(stubData.Account.A1);
    assert.throws(() => { a.sendTokens(); }, TypeError);
    assert.throws(() => { a.sendTokens(1); }, TypeError);
    assert.throws(() => { a.sendTokens(stubData.Account.A2); }, TypeError);
    assert.throws(() => { a.sendTokens(stubData.Account.A2, ''); }, TypeError);
    assert.throws(() => { a.sendTokens(stubData.Account.A2, -1); }, RangeError);
    assert.doesNotThrow(() => { a.sendTokens(stubData.Account.A2, 1); });
  });

  it('Account.sendTokens should return a sent Transaction', () => {
    const a = new DisNodeSDK.Account(stubData.Account.A1);
    const tx = a.sendTokens(stubData.Account.A2, 1);
    assert.equal(tx.constructor.name, 'Transaction');
    assert.equal(tx.type, 0);
    assert.exists(tx._sendCall);
  });

  it('Account.sendTokens should update the local balances of the from and to accounts', () => {
    const a = new DisNodeSDK.Account(stubData.Account.A1);
    const b = new DisNodeSDK.Account(stubData.Account.A2);
    return a.sendTokens(b, 1).send().then(() => {
      assert.equal(a.balance, 4);
      assert.equal(b.balance, undefined);
      b.balance = 0;
      return a.sendTokens(b, 1).send().then(() => {
        assert.equal(a.balance, 3);
        assert.equal(b.balance, 1);
      });
    });
  });

  it('Account.createContract requires "code" and "abi", optionally "value" as a number', () => {
    const a = new DisNodeSDK.Account(stubData.Account.A1);
    assert.throws(a.createContract, TypeError);
    assert.throws(() => { a.createContract(0); }, TypeError);
    assert.throws(() => { a.createContract(''); }, RangeError);
    assert.throws(() => { a.createContract('a',''); }, TypeError);
    assert.throws(() => { a.createContract('a',[],''); }, TypeError);
    assert.throws(() => { a.createContract('a',[],-1); }, RangeError);
    assert.doesNotThrow(() => { a.createContract('a',[],0); });
  });

  it('Account.createContract should return a sent Transaction', () => {
    const a = new DisNodeSDK.Account(stubData.Account.A1);
    const tx = a.createContract('a', []);
    assert.equal(tx.constructor.name, 'Transaction');
    assert.equal(tx.type, 1);
    assert.exists(tx._sendCall);
  });

  it('Account.executeContract requires "to", "method", "params", "abi", and optionally "tokens"', () => {
    const a = new DisNodeSDK.Account(stubData.Account.A1);
    assert.throws(() => { a.executeContract(); }, TypeError);
    assert.throws(() => { a.executeContract(0); }, TypeError);
    assert.throws(() => { a.executeContract(''); }, TypeError);
    assert.throws(() => { a.executeContract('',''); }, TypeError);
    assert.throws(() => { a.executeContract('','',0); }, TypeError);
    assert.throws(() => { a.executeContract('','',[]); }, TypeError);
    assert.throws(() => { a.executeContract('','',[],''); }, TypeError);
    assert.throws(() => { a.executeContract('','',[],[],''); }, TypeError);
    assert.doesNotThrow(() => { a.executeContract('a','a',[],[],0); });
  });

  it('Account.executeContract should accept a Transaction as "to"', () => {
    const a = new DisNodeSDK.Account(stubData.Account.A1);
    const c1 = new DisNodeSDK.Transaction(stubData.Transaction.T1);
    const tx = a.executeContract(c1,'a',[],[],0);
    assert.equal(tx.constructor.name, 'Transaction');
    assert.equal(tx.type, 2);
    assert.exists(tx._sendCall);
  });

  it('Account.executeContract should return a sent Transaction', () => {
    const a = new DisNodeSDK.Account(stubData.Account.A1);
    const tx = a.executeContract('a','a',[],[],0);
    assert.equal(tx.constructor.name, 'Transaction');
    assert.equal(tx.type, 2);
    assert.exists(tx._sendCall);
  });

});