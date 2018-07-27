/*!
 * @dispatchlabs/disnode-sdk <https://github.com/dispatchlabs/disnode_sdk>
 *
 * Copyright © 2018, [Dispatch Labs](http://dispatchlabs.io).
 * Released under the LGPL v3 License.
 */

'use strict'

const DisNodeSDK = require('./../');

module.exports = () => {
  console.log('--- TRANSACTION EXAMPLES ---\n');

// START SETUP

  console.log('Setting up...');
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

              // Transactions may be created and executed directly
              tx = new DisNodeSDK.Transaction({
                from: temp,
                to: test,
                value: 5
              });
              console.log('New Transaction:\n' + tx + '\n');

              // Transactions can also be sent directly, which returns a Promise
              tx.send()
                .then((result) => {
                  console.log('Transaction submission:\n' + JSON.stringify(result) + '\n');

                  // Use 'whenStatusEquals' (returns a Promise) to wait for the transaction to finish
                  tx.whenStatusEquals('Ok')
                    .then(
                      (result) => {
                        console.log('Transaction result:\n' + JSON.stringify(result) + '\n');

                        // Reset
                        temp.sendTokens(test, 5);

                      }, (err) => {
                        console.error('Transaction result:\n' + JSON.stringify(err) + '\n');
                      }
                    );
                }, (err) => {
                  console.error('Transaction result:\n' + JSON.stringify(err) + '\n');
                });


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
};
