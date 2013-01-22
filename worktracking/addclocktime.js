var sp = require('./sp');
var util = require('util');

var BANKED_HOURS_SCHED_ID = '179863';

function addSchedule(userId, callback) {
  sp.sendSpRequest({
    module: 'staff.employee',
    method: 'UPDATE',
    id: userId,
    addschedule: BANKED_HOURS_SCHED_ID
  }, function(data) {
    util.debug(util.inspect(data));
    callback();
  });
}

function addClockTime(userId, hours) {
  if (!hours) {
    util.log('No hours specified');
    return;
  }
  var dateIn = new Date(Date.parse('Jan 1, 2010'));
  var dateOut = new Date(dateIn.getTime() + hours * 60 * 60 * 1000);
  util.debug(util.format('in %s, out %s', dateIn, dateOut));

  sp.sendSpRequest({
    module: 'timeclock.addclocktime',
    employee: userId,
    datein: dateIn,
    dateout: dateOut,
    schedule: BANKED_HOURS_SCHED_ID,
    notes: "Migrated from worktracking spreadsheet."
  }, function(data) {
    util.debug(util.inspect(data));
  });
}

var userId = process.argv[2];
var hours = parseInt(process.argv[3]);
util.log(util.format('Adding %d hours to userid %s', hours, userId));
sp.login(addSchedule.bind(this, userId,
          addClockTime.bind(this, userId, hours)));
