/*!
 * @dispatchlabs/disnode-sdk <https://github.com/dispatchlabs/disnode_sdk>
 *
  * Released under the LGPL v3 License.
 */

'use strict'

const assert = require('chai').assert;

const DisNodeSDK = require('../');

// Network Stubs
DisNodeSDK.Network.prototype.GET = (options, callback) => {
  switch (options.path) {
  case '/v1/delegates':
    callback(null, {
      data: [
        {
          address: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
          endpoint: {
            host: '127.0.0.1',
            port: 1000
          },
          type: 'Delegate'
        },
        {
          address: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
          endpoint: {
            host: '127.0.0.1',
            port: 1001
          },
          type: 'Delegate'
        }
      ]
    });
    break;
  case '/v1/accounts/fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d':
    callback(null, {
      status: 'Ok',
      data: {
        balance: 10,
        created: +(new Date('2018-07-21T06:14:31.300253473Z')),
        updated: +(new Date('2018-07-21T06:14:31.300253473Z'))
      }
    })
    break;
  }
};

const AEmpty = {
  name: undefined,
  address: undefined,
  privateKey: undefined,
  publicKey: undefined,
  balance: undefined,
  created: undefined,
  updated: undefined
};

const A1 = {
  name: undefined,
  address: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
  privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e',
  publicKey: '04775936b80a436491a386fbdbea04603b12689e3e2600085ecf956dc4dd1bed45240eb7fcabfebc98f24d28c5862d3e8a9d9a4b26265f35b727b98db24d9f0566',
  balance: 0,
  created: undefined,
  updated: undefined
};
const A1_str = '{"address":"fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d","privateKey":"472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e","publicKey":"04775936b80a436491a386fbdbea04603b12689e3e2600085ecf956dc4dd1bed45240eb7fcabfebc98f24d28c5862d3e8a9d9a4b26265f35b727b98db24d9f0566","balance":0}';

describe('Account creation', () => {

  it('Should be able to be instantiated empty', () => {
    const a = new DisNodeSDK.Account();
    assert.equal(a.constructor.name, 'Account');
    assert.equal(a.toString(), '{}');
    assert.equal(a.inspect(), '{}');
    assert.deepEqual(a.toJSON(), AEmpty);
  });

  it('Should be able to be instantiated with a string (address)', () => {
    const a = new DisNodeSDK.Account(A1.address);
    assert.equal(a.address, A1.address);
    assert.equal(a.toString(), '{"address":"' + A1.address + '"}');
    assert.equal(a.inspect(), '{"address":"' + A1.address + '"}');
    assert.deepEqual(a.toJSON(), Object.assign({}, AEmpty, {address: A1.address}));
  });

  it('Should be able to be instantiated with an object', () => {
    const a = new DisNodeSDK.Account(A1);
    assert.equal(a.toString(), A1_str);
    assert.equal(a.inspect(), A1_str);
    assert.deepEqual(a.toJSON(), A1);
  });

  it('Should be able to auto-generate values with only the privateKey', () => {
    const a = new DisNodeSDK.Account({privateKey: A1.privateKey, balance: 0});
    assert.equal(a.toString(), A1_str);
    assert.equal(a.inspect(), A1_str);
    assert.deepEqual(a.toJSON(), A1);
  });

  it('Account.init() should generate a privateKey', () => {
    const a = new DisNodeSDK.Account().init();
    assert.exists(a.privateKey);
  });

});

describe('Account methods', () => {

  it('Account.refresh requires an address', () => {
    assert.throws(() => { new DisNodeSDK.Account().refresh(); }, TypeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Account(A1.address).refresh() });
  });

  it('Account.refresh should update the data', () => {
    let a = new DisNodeSDK.Account(A1);
    assert.equal(a.balance, 0);
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
    const a = new DisNodeSDK.Account(A1);
    assert.throws(a.sendTokens, TypeError);
    assert.throws(() => { a.sendTokens(A1); }, TypeError);
    assert.throws(() => { a.sendTokens(A1, ''); }, TypeError);
    assert.throws(() => { a.sendTokens(A1, -1); }, RangeError);
  });

  xit('Account.sendTokens should return a sent Transaction', () => {
    // TODO: Stub Network and test
  });

  it('Account.createContract requires "code" and "abi"', () => {
    const a = new DisNodeSDK.Account(A1);
    assert.throws(a.createContract, TypeError);
    assert.throws(() => { a.createContract(0); }, TypeError);
    assert.throws(() => { a.createContract(''); }, RangeError);
    assert.throws(() => { a.createContract('a',''); }, TypeError);
  });

  xit('Account.createContract should return a sent Transaction', () => {
    // TODO: Stub Network and test
  });

  it('Account.executeContract requires "to", "method", "params", "abi", and optionally "tokens"', () => {
    const a = new DisNodeSDK.Account(A1);
    assert.throws(a.executeContract, TypeError);
    assert.throws(() => { a.executeContract(0); }, TypeError);
    assert.throws(() => { a.executeContract(''); }, TypeError);
    assert.throws(() => { a.executeContract('',''); }, TypeError);
    assert.throws(() => { a.executeContract('','',0); }, TypeError);
    assert.throws(() => { a.executeContract('','',[]); }, TypeError);
    assert.throws(() => { a.executeContract('','',[],''); }, TypeError);
    assert.throws(() => { a.executeContract('','',[],{},''); }, TypeError);
  });

  xit('Account.executeContract should return a sent Transaction', () => {
    // TODO: Stub Network and test
  });

});