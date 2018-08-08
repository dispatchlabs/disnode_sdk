/*!
 * @dispatchlabs/disnode-sdk <https://github.com/dispatchlabs/disnode_sdk>
 *
 * Copyright © 2018, [Dispatch Labs](http://dispatchlabs.io).
 * Released under the LGPL v3 License.
 */

'use strict'

const DisNodeSDK = require('./../');

module.exports = () => {
  return new Promise((resolve, reject) => {
    console.log('\n\n--- SMART CONTRACT EXAMPLES ---\n');

  // SETUP
    console.log('Setting up...');
    const tearDown = () => {
      temp.sendTokens(test, 5).send()
        .then(() => {
          resolve();
        })
        .catch((e) => {
          resolve();
        });
    };

    // Account is a constructor with no required inputs
    const temp = new DisNodeSDK.Account();
    // It can also accept any account fields; the most prominant being the privateKey
    const test = new DisNodeSDK.Account({name: 'NodeSDKTest', privateKey: '70dcae0f1020d5b35f2be2df6146b432be594407121ac7c8cb48540ecc5e7ede' });

    // Use account.init() to generate a private key
    temp.init();

    // Account objects can send tokens to other accounts directly; returning the resulting Transaciton
    let tx = test.sendTokens(temp, 5);

    // Calling "send" on the Transaction will return the original Promise (not re-send the tx)
    tx.send()
      .then(
        (ok) => {
          // Use 'whenStatusEquals' (returns a Promise) to wait for the transaction to finish
          tx.whenStatusEquals('Ok')
            .then(
              (result) => {

  // END SETUP
                // Provide source code as a string
                const sourceCode = 'pragma solidity ^0.4.24;contract math { function plusOne(uint y) pure public returns(uint x) { x = y + 1; } }';
                console.log('Source code:\n' + sourceCode + '\n');

                // Use Transaction.compileSource to easily compile solidity code
                const compiled = DisNodeSDK.Transaction.compileSource(sourceCode);
                console.log('Compiled contract:');
                console.log(compiled);

                // Accounts can create Smart Contracts using compiled values
                const contract = test.createContract(compiled.contracts[0].bytecode, compiled.contracts[0].abi);
                console.log('New contract:\n' + contract + '\n');

                // Calling "send" on the Transaction will return the original Promise (not re-send the tx)
                contract.send()
                  .then(
                    (ok) => {
                      // Once a contract is created, it can be executed
                      contract
                        .whenStatusEquals('Ok')
                          .then((result) => {

                            console.log('Contract creation result:\n' + JSON.stringify(result) + '\n');

                            // Exection happens from the account, to the contract, along with the method and parameters
                            const execute = test.executeContract(contract, 'plusOne', [1], compiled.contracts[0].abi);
                            console.log('Contract execution:\n' + execute + '\n');
                            execute
                              .whenStatusEquals('Ok')
                                .then((result) => {
                                  console.log('Contract execution result:\n' + JSON.stringify(result) + '\n');

                                  // Reset
                                  tearDown();

                                }, (err) => {
                                  console.log('Contract execution result error:\n' + JSON.stringify(err) + '\n');
                                  // Reset
                                  tearDown();
                                });

                          }, (err) => {
                            console.log('Contract creation result error:\n' + JSON.stringify(err) + '\n');
                            // Reset
                            tearDown();
                          });
                    },
                    (err) => {
                      console.log('Contract creation result error:\n' + JSON.stringify(err) + '\n');
                    }
                  );


              }, (err) => {
                console.log('Setup failed!');
                console.error(err);
              }
            );
        },
        (err) => {
          console.log('Setup failed!');
          console.error(err);
        }
      );
  });

};
