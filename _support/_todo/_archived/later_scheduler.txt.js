//See
// -----------------------------------------------------------------------------
//
//  https://bunkat.github.io/schedule/
//  https://github.com/bunkat/schedule


// var sched = later.parse.text('every 5 seconds'),
//     occurrences = later.schedule(sched).next(10);
//
//
// for (var i = 0; i < 10; i++) {
//   console.log(occurrences[i]);
// }
//
// var tasks = [
//         {id:1, duration: 30, resources: ['A']},
//         {id:2, duration: 60, resources: ['B']}
//       ],
//     resources = [
//         {id: 'A'},
//         {id: 'B'}
//     ];
//
// schedule.create(tasks, resources, null, new Date());


/**
* Browser Example
* (c) 2013 Bill, BunKat LLC.
*
* Example of building a task schedule with Schedulejs. Shows how to create task
* and resource definitions from existing objects and how to fine tune the schedule
* using priorities, schedule lengths, and schedule availability.
*
* This example walks through a schedule for elevator reservations in a typical
* apartment building.
*
* Schedule is freely distributable under the MIT license.
* For all details and documentation:
*     http://github.com/bunkat/schedule
*/

// We'll use the Later text parser to create schedules that are readable
// var p = later.parse.text;
//
// // Step 1: Define our reservations (tasks)
// var reservations = [
//   {name: 'Joe', length: 4, availability: 'after 12:00'},
//   {name: 'Mike', length: 2},
//   {name: 'Frank', length: 8},
//   {name: 'John', length: 3, availability: 'on Thurs and Fri'},
//   {name: 'Peter', length: 1, availability: 'before 10:00am'},
//   {name: 'Sam', length: 2},
//   {name: 'Alan', length: 2},
//   {name: 'James', length: 8},
//   {name: 'Steve', length: 1, availability: 'after 12:00 and before 1:00pm'},
//   {name: 'Mark', length: 2},
//   {name: 'Alex', length: 8}
// ];
//
// // Step 2: Define our elevators (resources)
// var elevators = [
//   {name: 'E1', availability: 'every weekday after 8:00am and before 4:00pm'},
//   {name: 'E2', availability: 'every weekday after 8:00am and before 4:00pm'}
// ];
//
// // Step 3: Tasks aren't in the right format, need to create a generator
// var t = schedule.tasks()
//           .id(function(d) { return d.name; })
//           // our length is in hours, convert to minutes
//           .duration(function(d) { return d.length * 60; })
//           // use later.parse.text to parse text into a usable schedule
//           .available(function(d) { return d.availability ? p(d.availability) : undefined; })
//           // prioritize our reservations on first come first serve
//           .priority(function(d, i) { return 100 - i; })
//           // elevator reservations have to be contiguous
//           .minSchedule(function(d) { return d.length * 60; })
//           // assume that only one elevator is available for reservations to start
//           .resources(['E1']);
//
// var tasks = t(reservations);
//
// // Step 4: Resources aren't in the right format, need to create a generator
// var r = schedule.resources()
//           .id(function(d) { return d.name; })
//           .available(function(d) { return d.availability ? p(d.availability) : undefined; });
//
// var resources = r(elevators);
//
// // Step 5: Pick a start date for the schedule and set correct timezone
// var start = new Date(2022, 4, 20);
// schedule.date.localTime();
//
// // Step 6: Create the schedule
// var s = schedule.create(tasks, resources, null, start);
//
// for(var id in s.scheduledTasks) {
//   var st = s.scheduledTasks[id];
//   console.log(st);
//   document.write('<h2>' + id + '</h2>');
//   document.write('<p><b>Duration:</b> ' + st.duration + ' mins</p>');
//   document.write('<p><b>Start:</b> ' + new Date(st.earlyStart).toLocaleString() + '</p>');
//   document.write('<p><b>Finish:</b> ' + new Date(st.earlyFinish).toLocaleString() + '</p>');
// }
