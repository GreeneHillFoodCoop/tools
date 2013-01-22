var moment = require('moment');
var sp = require('./sp');
var util = require('util');

var BEGIN_DATE = 'Jan 9, 2012';  // week B
var FORMAT = 'MM/DD/YY';

function applyFnEveryNWeeks(func, weeks, callback) {
  var now = moment();
  var start = moment(BEGIN_DATE);
  var end;
  var dates = [];

  // Build pairs of dates from the start date and every 8 week intervals.
  do {
    end = moment(start).add('weeks', weeks);
      (util.format('%s - %s',
        start.format(FORMAT), end.format(FORMAT)));
    dates.push([moment(start).toDate(), end.toDate()]);
    start.add('weeks', 8);
  } while (now.diff(end) > 0);

  // Now iterate backwards through the dates, chaining the functions.
  var nextFunc = callback;
  dates.reverse().forEach(function(pair) {
    nextFunc = func.bind(this, pair[0], pair[1], nextFunc);
  });

  // Finally, start the first function call.
  nextFunc();
}

function getHours(userId, startDate, endDate, nextFn) {
  sp.sendSpRequest({
    module: 'timeclock.timeclocks',
    employee: userId,
    start_date: startDate,
    end_date: endDate,
    status: 'approved'
  }, function(response) {
    //sp.debug(util.inspect(data));
    var totalHours = 0;
    response.data.forEach(function(event, i) {
      var hours = event.length.hours + ':' + event.length.mins;
      var durationHours = event.length.hours + event.length.mins / 60;
      var started = event.in_time.day + ' ' + event.in_time.time;
      var schedule = (event.schedule && event.schedule.name) || '';
      sp.debug(util.format("%s\t%s\t%s\t%s", hours, durationHours.toFixed(2),
         started, schedule));
      totalHours += durationHours;
    });
    util.log(util.format('%s-%s: %d hours',
        moment(startDate).format(FORMAT),
        moment(endDate).format(FORMAT),
        totalHours.toFixed(2)));
    nextFn && nextFn();
  });
}

var userId = process.argv[2];

sp.login(applyFnEveryNWeeks.bind(this, getHours.bind(this, userId), 8));
