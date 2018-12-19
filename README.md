# @dispatchlabs/disnode-sdk [![NPM version](https://img.shields.io/npm/v/@dispatchlabs/disnode-sdk.svg?style=flat)](https://www.npmjs.com/package/@dispatchlabs/disnode-sdk) [![NPM monthly downloads](https://img.shields.io/npm/dm/@dispatchlabs/disnode-sdk.svg?style=flat)](https://npmjs.org/package/@dispatchlabs/disnode-sdk) [![NPM total downloads](https://img.shields.io/npm/dt/@dispatchlabs/disnode-sdk.svg?style=flat)](https://npmjs.org/package/@dispatchlabs/disnode-sdk) [![Linux Build Status](https://img.shields.io/travis/dispatchlabs/dispatchlabs.svg?style=flat&label=Travis)](https://travis-ci.org/dispatchlabs/dispatchlabs)

# This library has been deprecated. [Please Use dispatch-js here](https://github.com/dispatchlabs/dispatch-js)

> The Dispatch SDK for Node and JavaScript developers.

Please consider following this project's author, [Dispatch Labs](https://github.com/David Hutchings), and consider starring the project to show your :heart: and support.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save git+https://git@github.com/dispatchlabs/disnode_sdk.git
```

## CDN

The JavaScript version of the SDK may be included on the pae with the following CDN location:

```html
<script src="https://cdn.jsdelivr.net/npm/@dispatchlabs/disnode-sdk/dist/disJS.js"></script>
```

## Usage

Node:

```js
var DisNodeSDK = require('@dispatchlabs/disnode-sdk');
```

JavaScript:

For JavaScript, the top-level object is `DisJS`. Any of the models and methods below (unless otherwise stated) can be used in the browser by replacing `DisNodeSDK` with `DisJS`. For example;

```js
// Create an empty account
var account = new DisJS.Account();
account.init();
```

### Running examples

Examples are contained in the [examples folder](examples) and can be executed in Node using:

```sh
$ npm install && npm run examples
```

To execute the JavaScript examples, open the `examples/js/index.html` file in a browser window.

# Models

## Account

### [constructor](lib/models/Account.js#L47)

Account constructor. Create an instance of an account, which can then be used to interact with the network.

* `returns` **{Object}**: instance of `Account`

**Examples**

```js
// Create an empty account
let account = new DisNodeSDK.Account();
account.init();
```

```js
// Create an account using a known address
let account = new DisNodeSDK.Account('fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d');
```

```js
// Create an account using a private key (the address and public key will be filled in automatically)
let account = new DisNodeSDK.Account({
 name: 'MyAccount',
 privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e'
});
```

### [refresh](lib/models/Account.js#L172)

Refreshes the account balance and access info (created and updated dates) from a delegate.

* `returns` **{Promise}**: Promise that will return the result of the Delegate request after updating account object.

**Example**

```js
let account = new DisNodeSDK.Account('fa61c18114f8ff8aafbeb5d32e1b108e3f6cf30d');
account.refresh()
  .then(() => {
    console.log(account);
  })
  .catch((err) => {
    console.error(err);
  });
```

### [init](lib/models/Account.js#L225)

Generaes a new private key for the account object (replacing one if present).

* `returns` **{Account}**: Returns the account object for use in chaining.

**Example**

```js
let account = new DisNodeSDK.Account();
account.init();
console.log(account);
```

### [sendTokens](lib/models/Account.js#L254)

Creates and sends a transaction that will transfer tokens from the source account, to the target account.

**Params**

* **{string|Account}**: to - The address or Account to send the tokens to.
* **{number}**: value - The number of tokens to send.
* `returns` **{Transaction}**: Returns a transaction which has already been sent.

**Example**

```js
let account = new DisNodeSDK.Account({
 name: 'MyAccount',
 privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e'
});
// Send one (1) token
let tx = account.sendTokens(new DisNodeSDK.Account().init(), 1);
```

### [createContract](lib/models/Account.js#L293)

Creates and sends a transaction from the account that will create a new Smart Contract.

**Params**

* **{string}**: code - Bytecode of a compiled contract.
* **{string|array}**: code - The ABI of the contract.
* **{number}**: value - The number of tokens to seed the contract with.
* `returns` **{Transaction}**: Returns a transaction which has already been sent.

**Example**

```js
let account = new DisNodeSDK.Account({
 name: 'MyAccount',
 privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e'
});
let compiled = DisNodeSDK.Transaction.compileSource('contract x { function g() { } }');
let contract = account.createContract(compiled.contracts[0].bytecode, compiled.contracts[0].abi);
```

### [executeContract](lib/models/Account.js#L343)

Creates and sends a transaction from the account that will execute a method on an existing Smart Contract.

**Params**

* **{string|Account|Transaction}**: to - The address of an existing contract, an Account representing the contract, or the contract creation Transaction.
* **{string}**: method - The method in the contract to call.
* **{array}**: params - The parameters to use during the method call.
* **{number}**: value - The number of tokens to send to the contract for the method call.
* `returns` **{Transaction}**: Returns a transaction which has already been sent.

**Example**

```js
let account = new DisNodeSDK.Account({
 name: 'MyAccount',
 privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e'
});
let compiled = DisNodeSDK.Transaction.compileSource('contract x { function g() { } }');
let contract = account.createContract(compiled.contracts[0].bytecode, compiled.contracts[0].abi);
contract.whenStatusEquals('Ok')
  .then(() => {
    account.executeContract(contract, 'g', [], compiled.contracts[0].abi);
  })
  .catch((err) => {
    console.error(err);
  });
```

## Transaction

### [constructor](lib/models/Transaction.js#L45)

Transaction constructor. Create an instance of a transaction, which can then be sent to a delegate.

* `returns` **{Object}**: instance of `Transaction`

**Example**

```js
// Create a new transaction
let account = new DisNodeSDK.Account().init();
let tx = new DisNodeSDK.Transaction({from: account});
```

### [send](lib/models/Transaction.js#L316)

Sends the transaction to a delegate.

* `returns` **{Promise}**: Promise that will return the result of the Delegate request.

**Example**

```js
let account = new DisNodeSDK.Account({
 name: 'MyAccount',
 privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e'
});
let tx = new DisNodeSDK.Transaction({from: account});
tx.send()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  });
```

### [status](lib/models/Transaction.js#L357)

Requests the current status of the transaction from a delegate.

* `returns` **{Promise}**: Promise that will return the result of the status check.

**Example**

```js
let account = new DisNodeSDK.Account({
 name: 'MyAccount',
 privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e'
});
let tx = new DisNodeSDK.Transaction({from: account});
tx.send();
tx.status()
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  });
```

### [whenStatusEquals](lib/models/Transaction.js#L427)

Waits until the status of the transaction matches the value provided, then resolves. Rejects after 5 seconds or when the transaction hits a non-matching final state.

**Params**

* **{string}**: status - Desired status for the transaction to acheive.
* `returns` **{Promise}**: Promise that will return the result of the status check. If a timeout occured, the returned data will be the latest known state along with a key of `SDKTimeout: true`.

**Example**

```js
let account = new DisNodeSDK.Account({
 name: 'MyAccount',
 privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e'
});
let tx = new DisNodeSDK.Transaction({from: account});
tx.send();
tx.whenStatusEquals('Ok')
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  });
```

### [compileSource](lib/models/Transaction.js#L511)

Static method to compile Solidity code directly.

**Params**

* **{string}**: source - Solidity source code containing one or more contracts.
* `returns` **{compiledSource}**: Compiled output JSON.

**Example**

```js
let account = new DisNodeSDK.Account({
 name: 'MyAccount',
 privateKey: '472ba91402425b58a2eebf932812f20c6d7f6297bba1f83d9a58116ae6512d9e'
});
let compiled = DisNodeSDK.Transaction.compileSource('contract x { function g() { } }');
if (compiled.errors.length > 0) {
  // Errors are fatal
  console.error(compiled.errors);
} else {
  // Warnings are non-fatal
  if (compiled.warnings.length > 0) {
    console.log(compiled.warnings);
  }
  // compiled.contracts contains the name, bytecode, and abi for each contract contained within the source
  const contract = account.createContract(compiled.contracts[0].bytecode, compiled.contracts[0].abi);
}
```

### [compile](lib/models/Transaction.js#L564)

Static method to compile complex Solidity JSON structures.

**Params**

* **{object}**: input - Full Solidity JSON structure. See [Compiler Input and Output JSON Description](https://solidity.readthedocs.io/en/develop/using-the-compiler.html#compiler-input-and-output-json-description).
* `returns` **{object}**: Compiled output JSON.

**Example**

```js
let compiled = DisNodeSDK.Transaction.compile({language: 'Solidity', sources: { source: { content: 'contract x { function g() { } }' }}});
```

## About

<details>
<summary><strong>Contributing</strong></summary>

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

</details>

<details>
<summary><strong>Running Tests</strong></summary>

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

</details>

<details>
<summary><strong>Building docs</strong></summary>

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

</details>

### Author

**Dispatch Labs**

* [GitHub Profile](https://github.com/David Hutchings)
* [Twitter Profile](https://twitter.com/David Hutchings)
* [LinkedIn Profile](https://linkedin.com/in/jonschlinkert)

### License

Copyright © 2018, [Dispatch Labs](http://dispatchlabs.io).
Released under the [LGPL-2.1 License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.8.0, on October 16, 2018._
