var http = require('http');
var util = require('util');
var spconfig = require('./spconfig');

DEBUG = true;

function debug(s) {
  DEBUG && util.debug(s);
}

var spConfig = spconfig.config;

var sendSpRequest = function(request, callback) {
  var payload = {
    request: request
  }
  if (request.module == 'staff.login') {
    payload.key = spConfig.apiKey;
  } else {
    payload.token = spConfig.token;
  }

  debug(util.inspect(payload));
  var spUrl = spConfig.urlPrefix + encodeURIComponent(JSON.stringify(payload));
  var body = '';
  http.get(spUrl, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(partialBody) {
      body += partialBody;
    }).on('end', function() {
      var sdk_response = [];
      try {
        eval(body);
      } catch (e) {
        util.error('Could not eval body: ' + e + ': ' + body);
      }
      callback(sdk_response['res']);
    });
  }).on('error', function(e) {
    util.error("Got error: " + e.message);
    callback(null);
  });
};

exports.login = function(callback) {
  sendSpRequest({
    module: 'staff.login',
    method: 'GET',
    username: spConfig.username,
    password: spConfig.password
  }, function(data) {
    if (!data) {
      util.error('No data came back');
    }
    spConfig.token = data.token;
    debug(util.inspect(data.data.employee.schedules));
    debug('token: ' + spConfig.token);
    callback();
  });
};

exports.sendSpRequest = sendSpRequest;
exports.debug = debug;
