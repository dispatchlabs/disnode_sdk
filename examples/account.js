/*!
 * @dispatchlabs/disnode-sdk <https://github.com/dispatchlabs/disnode_sdk>
 *
 * Copyright © 2018, [Dispatch Labs](http://dispatchlabs.io).
 * Released under the LGPL v3 License.
 */

'use strict'

const DisNodeSDK = require('./../');

module.exports = () => {
  console.log('--- ACCOUNT EXAMPLES ---\n');

  // Account is a constructor with no required inputs
  const temp = new DisNodeSDK.Account();
  // It can also accept any account fields; the most prominant being the privateKey
  const test = new DisNodeSDK.Account({name: 'NodeSDKTest', privateKey: '70dcae0f1020d5b35f2be2df6146b432be594407121ac7c8cb48540ecc5e7ede' });

  // Use account.init() to generate a private key
  temp.init();
  // Models output clean strings in logs and JSON.stringify
  console.log('Temp account:\n' + temp + '\n');

  // Account objects can send tokens to other accounts directly; returning the resulting Transaciton
  let tx = test.sendTokens(temp, 5);
  console.log('New "sendTokens" transaction:\n' + tx + '\n');

  // Calling "send" on the Transaction will return the original Promise (not re-send the tx)
  tx.send()
    .then(
      (ok) => {
        // Use 'whenStatusEquals' (returns a Promise) to wait for the transaction to finish
        tx.whenStatusEquals('Ok')
          .then(
            (result) => {
              console.log('Transaction result:\n' + JSON.stringify(result) + '\n');

              // Reset
              temp.sendTokens(test, 5);

            }, (err) => {
              console.log('Transaction result:\n' + JSON.stringify(err) + '\n');
            }
          );
      },
      (err) => {
        console.log('Transaction result:\n' + JSON.stringify(err) + '\n');
      }
    );

};
