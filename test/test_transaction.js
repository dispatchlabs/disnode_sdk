/*!
 * @dispatchlabs/disnode-sdk <https://github.com/dispatchlabs/disnode_sdk>
 *
  * Released under the LGPL v3 License.
 */

'use strict'

const assert = require('chai').assert;

const DisNodeSDK = require('../');

const T1 = {
  hash: '1d6aca3a91c9ad81f36d0e52e47992257ba4c5309916ca370a2a37e9abad2e1f',
  type: 0,
  from: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
  to: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
  value: 5,
  time: +(new Date(1532595045435)),
  code: 'a',
  abi: '[]',
  method: 'foo',
  params: [],
  signature: '',
  hertz: 0,
  fromName: undefined,
  toName: undefined,
  address: ''
};
const T1_str = '{"hash":"1d6aca3a91c9ad81f36d0e52e47992257ba4c5309916ca370a2a37e9abad2e1f","type":0,"from":"fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d","to":"fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d","value":5,"code":"a","abi":"[]","method":"foo","params":[],"time":1532595045435,"signature":"","hertz":0,"address":""}';

describe('Transaction creation', () => {

  it('Should be a named constructor', () => {
    const t = new DisNodeSDK.Transaction({ from: '' });
    assert.equal(t.constructor.name, 'Transaction');
  });

  it('Transaction.from must be an Account or an object with a privateKey value', () => {
    assert.throws(() => { new DisNodeSDK.Transaction(); }, TypeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '' }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: new DisNodeSDK.Account().init() }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: {privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e'} }); });
  });

  it('Transaction.toJSON returns as expected', () => {
    assert.deepEqual(new DisNodeSDK.Transaction(T1).toJSON(), T1);
  });

  it('Transaction.toString returns as expected', () => {
    assert.equal(new DisNodeSDK.Transaction(T1).toString(), T1_str);
    assert.equal(new DisNodeSDK.Transaction(T1).inspect(), T1_str);
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
    assert.deepEqual(new DisNodeSDK.Transaction({ from: '' }).typeBuffer, new Buffer('00', 'hex'));
    assert.deepEqual(new DisNodeSDK.Transaction({ from: '', type: 1 }).typeBuffer, new Buffer('01', 'hex'));
    assert.deepEqual(new DisNodeSDK.Transaction({ from: '', type: 2 }).typeBuffer, new Buffer('02', 'hex'));
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
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', value: '' }); }, TypeError);
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', value: -1 }); }, RangeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', value: 0 }); });
  });

  it('Transaction.time should contain a date value (default: now)', () => {
    assert.throws(() => { new DisNodeSDK.Transaction({ from: '', time: 'foo' }); }, TypeError);
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', time: new Date() }); });
    assert.doesNotThrow(() => { new DisNodeSDK.Transaction({ from: '', time: +(new Date()) }); });
    assert.isOk(new DisNodeSDK.Transaction({ from: '' }).time instanceof Date);
  });

  it('Transaction.timeBuffer returns correct value', () => {
    assert.deepEqual(new DisNodeSDK.Transaction({ from: '', time: 1532595045435 }).timeBuffer, new Buffer([59,132,200,213,100,1,0,0]));
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

  it('Transaction.hash should auto-populate', () => {
    assert.equal(new DisNodeSDK.Transaction({ from: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d', time: 1532595045435 }).hash, 'ee650494a12137c13c25cbe30307d4fc83710fd63de99da4c9d6ff98794ba678');
    assert.equal(new DisNodeSDK.Transaction({
      from: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
      to: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
      value: 5,
      time: 1532595045435
    }).hash, '15cd4cb6215143dde9165a253636f757a37417db698ffd290e119841a6d1fcd9');
    
    assert.equal(new DisNodeSDK.Transaction({
      type: 1,
      from: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
      value: 5,
      time: 1532595045435,
      code: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
      abi: []
    }).hash, '97f04a20fb7eec7d69fcc1a7bfe707de49a03c55f80ea8e91376c5951a4b13ac');
    
    assert.equal(new DisNodeSDK.Transaction({
      type: 2,
      from: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
      to: 'fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d',
      time: 1532595045435,
      method: 'x',
      abi: []
    }).hash, 'd1b8c5185abed4345a58a9ff2f2d83e1a483ff78f9dc57006bdf2f27deff9748');
  });

  it('Transaction.signature should auto-populate with privateKey', () => {
    assert.equal(new DisNodeSDK.Transaction({ from: '' }).signature, undefined);
    assert.equal(new DisNodeSDK.Transaction({ from: new DisNodeSDK.Account({ privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e'}), time: 1532595045435 }).signature,
      'b82f8165a22fb9a7cc46e862ac83042e1295119f98eb940428074fe49396109f1eaa7087f2623a0abbaafa9a35d3ac19c6086fd96f4a1eec7ef683373425d6f900'
    );
  });

});

describe('Transaction methods', () => {
  before(function() {
    this.skip();
  });
  
  it('Transaction.send', () => {
    // TODO: Stub Network and test
  });

  it('Transaction.status', () => {
    // TODO: Stub Network and test
  });

  it('Transaction.whenStatusEquals', () => {
    // TODO: Stub Network and test
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
    let compiled = DisNodeSDK.Transaction.compileSource('contract x { function g() { } }');
    assert.equal(compiled.contracts[0].contract, 'x');
    assert.equal(compiled.contracts[0].bytecode, '6080604052348015600f57600080fd5b5060868061001e6000396000f300608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063e2179b8e146044575b600080fd5b348015604f57600080fd5b5060566058565b005b5600a165627a7a7230582049207ee8e40a7cec5e02ae4b17430f6213404d65ec20007be0695e4b613fcc4e0029');
    assert.deepEqual(compiled.contracts[0].abi, [
      {
        constant: false,
        inputs: [],
        name: 'g',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ]);
    assert.equal(compiled.errors.length, 0);
    assert.equal(compiled.warnings.length, 3);
  });

  it('Transaction.compile should require "input" as an object', () => {
    assert.throws(() => { DisNodeSDK.Transaction.compile(); }, TypeError);
    assert.throws(() => { DisNodeSDK.Transaction.compile(0); }, TypeError);
    assert.doesNotThrow(() => { DisNodeSDK.Transaction.compile({}); });
  });

  it('Transaction.compile should return as expected', () => {
    let compiled = DisNodeSDK.Transaction.compile({sources: { source: 'contract x { function g() { } }' }});
    assert.exists(compiled.contracts['source:x']);
    assert.equal(compiled.contracts['source:x'].bytecode, '6080604052348015600f57600080fd5b5060868061001e6000396000f300608060405260043610603f576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063e2179b8e146044575b600080fd5b348015604f57600080fd5b5060566058565b005b5600a165627a7a7230582049207ee8e40a7cec5e02ae4b17430f6213404d65ec20007be0695e4b613fcc4e0029');
    assert.deepEqual(JSON.parse(compiled.contracts['source:x'].interface), [
      {
        constant: false,
        inputs: [],
        name: 'g',
        outputs: [],
        payable: false,
        stateMutability: 'nonpayable',
        type: 'function'
      }
    ]);
    assert.equal(compiled.errors.length, 3);
  });

});
