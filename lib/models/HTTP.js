'use strict';

const assert = require('./../assert');
const messages = require('./../messages.json');
const defaultConfig = require('./../config.json');

const http = require('http');

const HTTP = class HTTP {
  constructor(config) {
    this.config = config || defaultConfig;
  }

  get delegates() {
    return new Promise((resolve, reject) => {
      if (this._delegates) {
        resolve(this._delegates);
        return;
      }
      this.GET({
        hostname: this.seedHost,
        port: this.seedPort,
        path: '/' + this.config.apiVersion + this.config.routes.delegateList
      }, (e, data) => {
        if (e) {
          reject(e);
        }
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

    // console.log('GET: ' + JSON.stringify(options));

    const req = http.request(options, (res) => {
      let out = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        out += chunk;
      });
      res.on('end', () => {
        callback(null, JSON.parse(out));
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

    if (data) {
      console.log('POST: ' + JSON.stringify(options) + ', ' + data);
    } else {
      console.log('POST: ' + JSON.stringify(options));
    }

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');

      let out = '';
      res.on('data', (chunk) => {
        out += chunk;
      });

      res.on('end', () => {
        callback(null, JSON.parse(out));
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
            options.hostname = delegates[delgateNumber].endpoint.host;
            options.port = 1975; // delegates[delgateNumber].endpoint.port;
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
                // d._delegateInfo = delegates[delgateNumber];
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
            options.hostname = delegates[delgateNumber].endpoint.host;
            options.port = 1975; // delegates[delgateNumber].endpoint.port;
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
                // d._delegateInfo = delegates[delgateNumber];
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

module.exports = HTTP;