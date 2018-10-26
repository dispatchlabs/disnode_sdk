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

describe('Transaction creation', () => {

  it('Should be a named constructor', () => {
    const t = new DisNodeSDK.Transaction({ from: '' });
    assert.equal(t.constructor.name, 'Transaction');
  });

  it('Should be able to be instantiated with a string (hash)', () => {
    const t = new DisNodeSDK.Transaction(stubData.Transaction.T1.hash);
    assert.equal(t.hash, stubData.Transaction.T1.hash);
  });

  it('Transaction.from may be an Account or an object with a privateKey value', () => {
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '' }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: new DisNodeSDK.Account(stubData.Account.A1) }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: {privateKey: stubData.Account.A1.privateKey} }); });
  });

  it('Transaction.toJSON returns as expected', () => {
    assert.deepEqual(new DisNodeSDK.Transaction(stubData.Transaction.T1).toJSON(), stubData.Transaction.T1);
  });

  it('Transaction.toString returns as expected', () => {
    assert.equal(new DisNodeSDK.Transaction(stubData.Transaction.T1).toString(), stubData.Transaction.T1_str);
    assert.equal(new DisNodeSDK.Transaction(stubData.Transaction.T1).inspect(), stubData.Transaction.T1_str);
  });

  it('Transaction.type must be undefined (default: 0), 0, 1, or 2', () => {
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', type: '' }); }, TypeError);
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', type: -1 }); }, RangeError);
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', type: 3 }); }, RangeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '' }); });
    assert.equal(new DisNodeSDK.Transaction({ from: '' }).type, 0);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', type: 0 }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', type: 1 }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', type: 2 }); });
  });

  it('Transaction.typeBuffer returns correct value', () => {
    assert.deepEqual(new DisNodeSDK.Transaction({ from: '' }).typeBuffer, new Buffer.from('00', 'hex'));
    assert.deepEqual(new DisNodeSDK.Transaction({ from: '', type: 1 }).typeBuffer, new Buffer.from('01', 'hex'));
    assert.deepEqual(new DisNodeSDK.Transaction({ from: '', type: 2 }).typeBuffer, new Buffer.from('02', 'hex'));
  });

  it('Transaction.from should contain an Account', () => {
    assert.equal(new DisNodeSDK.Transaction({ from: '' }).from.constructor.name, 'Account');
    assert.equal(new DisNodeSDK.Transaction({ from: '' }).from.address, '');
  });

  it('Transaction.to should contain an Account', () => {
    assert.equal(new DisNodeSDK.Transaction({ from: '', to: '' }).to.constructor.name, 'Account');
    assert.equal(new DisNodeSDK.Transaction({ from: '', to: '' }).to.address, '');
  });

  it('Transaction.value should contain a positive number', () => {
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', value: -1 }); }, RangeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '' }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', value: 0 }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', value: '0' }); });
  });

  it('Transaction.time should contain a date value (default: now)', () => {
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', time: 'foo' }); }, TypeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', time: new Date() }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', time: +(new Date()) }); });
    assert.isOk(new DisNodeSDK.Transaction({ from: '' }).time instanceof Date);
  });

  it('Transaction.timeBuffer returns correct value', () => {
    assert.deepEqual(new DisNodeSDK.Transaction({ from: '', time: stubData.Transaction.T1.time }).timeBuffer, new Buffer.from([59,132,200,213,100,1,0,0]));
  });

  it('Transaction.code must be a string', () => {
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', code: 0 }); }, TypeError);
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', code: '' }); }, RangeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', code: 'a' }); });
  });

  it('Transaction.abi must be an array', () => {
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', abi: 0 }); }, TypeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', abi: [] }); });
  });

  it('Transaction.method must be a string', () => {
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', method: 0 }); }, TypeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', method: '' }); });
  });

  it('Transaction.params must be an array', () => {
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', params: 0 }); }, TypeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', params: [] }); });
  });

  it('Transaction.hash must be a string', () => {
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', hash: 0 }); }, TypeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', hash: '' }); });
  });

  it('Transaction.hash requires Transaction.from.address to be a string', () => {
    const tx = new DisNodeSDK.Transaction({ from: new DisNodeSDK.Account() });
    assert.throws(() => { tx.hash; });
  });

  it('Transaction.hash should auto-populate', () => {
    assert.equal(new DisNodeSDK.Transaction(stubData.Transaction.type0).hash, stubData.Transaction.type0Hash);
    assert.equal(new DisNodeSDK.Transaction(stubData.Transaction.type1).hash, stubData.Transaction.type1Hash);
    assert.equal(new DisNodeSDK.Transaction(stubData.Transaction.type2).hash, stubData.Transaction.type2Hash);
  });

  it('Transaction.signature must be a string', () => {
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', signature: 0 }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', signature: '' }); });
  });

  it('Transaction.signature should auto-populate with privateKey', () => {
    assert.equal(new DisNodeSDK.Transaction({ from: '' }).signature, undefined);
    assert.equal(new DisNodeSDK.Transaction({ from: new DisNodeSDK.Account(stubData.Account.A1), time: stubData.Transaction.T1.time }).signature, stubData.Transaction.T1.signature);
  });

  it('Transaction.address must be a string', () => {
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', address: 0 }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', address: '' }); });
  });

  xit('Transaction.address should auto-populate with a signature and hash', () => {
    assert.equal(new DisNodeSDK.Transaction({ from: '' }).address, undefined);
    assert.equal(new DisNodeSDK.Transaction({ from: new DisNodeSDK.Account(stubData.Account.A1), time: stubData.Transaction.T1.time }).address, stubData.Transaction.T1.address);
  });

});

describe('Transaction methods', () => {
  it('Transaction.send', () => {
    const tx = new DisNodeSDK.Transaction({ from: {privateKey: stubData.Account.A1.privateKey} });
    tx.send();
    assert.equal(tx.constructor.name, 'Transaction');
    assert.equal(tx.type, 0);
    assert.exists(tx._sendCall);
  });

  it('Transaction.status', () => {
    const tx = new DisNodeSDK.Transaction(stubData.Transaction.type1);
    return tx.status()
      .then((data) => {
        assert.equal(tx.address, stubData.Contract.C1.address);
      });
  });

  it('Transaction.whenStatusEquals', () => {
    const tx = new DisNodeSDK.Transaction(stubData.Transaction.type1);
    return tx.whenStatusEquals('Ok')
      .then((data) => {
        assert.isOk(true);
      });
  });

});


describe('Transaction globals', () => {
  it('Transaction.compileSource should require "code" as a string', () => {
    assert.throws(() => { DisNodeSDK.Transaction.compileSource(); }, TypeError);
    assert.throws(() => { DisNodeSDK.Transaction.compileSource(0); }, TypeError);
    assert.throws(() => { DisNodeSDK.Transaction.compileSource(''); }, RangeError);
    assert.doesNotThrow(() => { DisNodeSDK.Transaction.compileSource('aaa'); });
  });

  it('Transaction.compileSource should return as expected', () => {
    let compiled = DisNodeSDK.Transaction.compileSource(stubData.Contract.C1.source);
    assert.equal(compiled.contracts[0].contract, stubData.Contract.C1.name);
    assert.equal(compiled.contracts[0].bytecode, stubData.Contract.C1.bytecode);
    assert.deepEqual(compiled.contracts[0].abi, stubData.Contract.C1.abi);
    assert.equal(compiled.errors.length, 0);
    assert.equal(compiled.warnings.length, 2);
  });

  it('Transaction.compile should require "input" as an object', () => {
    assert.throws(() => { DisNodeSDK.Transaction.compile(); }, TypeError);
    assert.throws(() => { DisNodeSDK.Transaction.compile(0); }, TypeError);
    assert.doesNotThrow(() => { DisNodeSDK.Transaction.compile({}); });
  });

  it('Transaction.compile should return as expected', () => {
    let compiled = DisNodeSDK.Transaction.compile({sources: { source: { content: stubData.Contract.C1.source }}});
    assert.exists(compiled.contracts.source[stubData.Contract.C1.name]);
    assert.equal(compiled.contracts.source[stubData.Contract.C1.name].evm.bytecode.object, stubData.Contract.C1.bytecode);
    assert.deepEqual(compiled.contracts.source[stubData.Contract.C1.name].abi, stubData.Contract.C1.abi);
    assert.equal(compiled.errors.length, 2);
  });

});
