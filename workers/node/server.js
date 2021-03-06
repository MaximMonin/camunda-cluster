const { Client, logger, Variables, File } = require('camunda-external-task-client-js');
const axios = require ('axios'); axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const { router } = require ('./js/router.js');

// configuration for the Camunda Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)

//  - 'maxTasks': The maximum number of tasks to fetch from Camunda in batch
//  - 'maxParallelExecutions': The maximum number of tasks to be worked on simultaneously
//  Number of async execution threads = maxTasks if maxParallelExcecutions is not set
//  Else Number of async threads = min (MaxTasks,maxParallelExcecutions)

const url = process.env.CamundaUrl || 'http://camunda:8080/engine-rest';
const longPolling = process.env.LongPolling || 60000;
const tasktype = process.env.TaskType || 'service-task';
const loglevel = process.env.LogLevel || 'INFO';
const maxTasks = process.env.JobsToActivate || 25;
const workerId = process.env.workerId || "some-random-id"

// for fast parallel processing it is critical to reduse polling internal to low value (5ms)
const config = { baseUrl: url, workerId: workerId, use: logger.level(loglevel), asyncResponseTimeout: longPolling, maxTasks: maxTasks, interval: 5 };

// create a Client instance with custom configuration
console.log('Camunda Node worker is starting...')
const client = new Client(config);
const topicSubscription = client.subscribe(tasktype, {}, async function ({task, taskService}) {
//  console.log (JSON.stringify(task)); 

  await router (task, taskService);
});

// For docker enviroment it catch docker compose down/restart commands
// The signals we want to handle
// NOTE: although it is tempting, the SIGKILL signal (9) cannot be intercepted and handled
var signals = {
  'SIGHUP': 1,
  'SIGINT': 2,
  'SIGTERM': 15
};
// Do any necessary shutdown logic for our application here
const shutdown = (signal, value) => {
  console.log(`Camunda Node worker stopped`);
  process.exit(128 + value);
};
// Create a listener for each of the signals that we want to handle
Object.keys(signals).forEach((signal) => {
  process.on(signal, () => {
    console.log(`Camunda Node worker is shutdowning`);

    topicSubscription.unsubscribe();
    client.stop();

    shutdown(signal, signals[signal]);
  });
});
