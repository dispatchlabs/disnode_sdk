/*!
 * @dispatchlabs/disnode-sdk <https://github.com/dispatchlabs/disnode_sdk>
 *
 * Copyright © 2018, [Dispatch Labs](http://dispatchlabs.io).
 * Released under the LGPL v3 License.
 */

'use strict';

const assert = require('./../assert');
const messages = require('./../messages.json');
const defaultConfig = require('./../../config/config_' + (process.env.NODE_ENV || 'production') + '.json');

const http = require('http');

let networkInstance;

const Network = module.exports = class Network {
  constructor(config) {
    if (networkInstance !== undefined) {
      return networkInstance;
    }
    this.config = config || defaultConfig;
    networkInstance = this;
  }

  get delegates() {
    return new Promise((resolve, reject) => {
      if (this._delegates) {
        resolve(this._delegates);
        return;
      }

      process.env.DEBUG ? console.log('Getting delegates from '+ this.seedHost + ':' + this.seedPort) : null;

      this.GET({
        hostname: this.seedHost,
        port: this.seedPort,
        path: '/' + this.config.apiVersion + this.config.routes.delegateList
      }, (e, data) => {
        if (e) {
          reject(e);
        }
        process.env.DEBUG ? console.log('Delegate list: ' + JSON.stringify(data)) : null;
        this._delegates = data.data;
        resolve(this._delegates);
      });
    });
  }

  get seedHost() {
    assert.isString(this.config.seedNode, messages.SEEDNODEURL_ISSTRING);
    return this.config.seedNode.split(':')[0];
  }
  get seedPort() {
    assert.isString(this.config.seedNode, messages.SEEDNODEURL_ISSTRING);
    return this.config.seedNode.split(':')[1] || 80;
  }

  GET(options, callback) {
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    options.method = options.method || 'GET';

    process.env.DEBUG ? console.log('GET: ' + JSON.stringify(options)) : null;

    const req = http.request(options, (res) => {
      let out = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        out += chunk;
      });
      res.on('end', () => {
        try {
          out = JSON.parse(out);
        } catch (err) {
          callback(err);
        }
        callback(null, out);
      });
    });
    req.on('error', (e) => {
      callback(e);
    });
    req.end();
  }

  POST(options, data, callback) {
    data = JSON.stringify(data);

    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    options.method = options.method || 'POST';

    if (process.env.DEBUG) {
      if (data) {
        console.log('POST: ' + JSON.stringify(options) + ', ' + data);
      } else {
        console.log('POST: ' + JSON.stringify(options));
      }
    }

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');

      let out = '';
      res.on('data', (chunk) => {
        out += chunk;
      });

      res.on('end', () => {
        try {
          out = JSON.parse(out);
        } catch (err) {
          callback(err);
        }
        callback(null, out);
      });
    });
    req.on('error', (e) => {
      console.error(e);
      callback(e);
    });
    if (data) {
      req.write(data);
    }
    req.end();
  }

  postToDelegate(options, data) {
    const self = this;
    return new Promise((resolve, reject) => {
      self.delegates
        .then((delegates) => {
          let delgateNumber = 0;
          const errors = [];
          const tryDelegates = function() {
            options.hostname = delegates[delgateNumber].httpEndpoint.host;
            options.port = delegates[delgateNumber].httpEndpoint.port;
            self.POST(options, data, (e, d) => {
              if (e) {
                errors.push(e);
                delgateNumber++;
                if (delgateNumber < delegates.length - 1) {
                  tryDelegates();
                } else {
                  reject(errors);
                }
              } else {
                if (process.env.DEBUG) {
                  d._delegateInfo = delegates[delgateNumber];
                }
                resolve(d);
              }
            });
          };
          tryDelegates();
        })
        .catch((e) => {
          reject([e]);
        });
    });
  }

  getFromDelegate(options) {
    const self = this;
    return new Promise((resolve, reject) => {
      self.delegates
        .then((delegates) => {
          let delgateNumber = 0;
          const errors = [];
          const tryDelegates = function() {
            options.hostname = delegates[delgateNumber].httpEndpoint.host;
            options.port = delegates[delgateNumber].httpEndpoint.port;
            self.GET(options, (e, d) => {
              if (e) {
                errors.push(e);
                delgateNumber++;
                if (delgateNumber < delegates.length - 1) {
                  tryDelegates();
                } else {
                  reject(errors);
                }
              } else {
                if (process.env.DEBUG) {
                  d._delegateInfo = delegates[delgateNumber];
                }
                resolve(d);
              }
            });
          };
          tryDelegates();
        })
        .catch((e) => {
          reject([e]);
        });
    });
  }
};
