/*!
 * @dispatchlabs/disnode-sdk <https://github.com/dispatchlabs/disnode_sdk>
 *
 * Copyright © 2018, [Dispatch Labs](http://dispatchlabs.io).
 * Released under the LGPL v3 License.
 */

'use strict';

require('./account')()
	.then(() => {
		return require('./transactions')();		
	})
	.then(() => {
		return require('./contracts')();
	})
	.catch((e) => {
		console.log(e);
	});
