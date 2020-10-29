const { Variables, File } = require('camunda-external-task-client-js');
const axios = require ('axios'); axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
const faker = require ('faker');

function paymentretrieval (task, taskService)
{
  const { processInstanceId, processDefinitionKey, activityId } = task;
  switch (activityId) {
  case 'generate':
    generate (task, taskService);
    break;
  case 'charge-card':
    charge (task, taskService);
    break;
  case 'charge-card-premium':
    chargepremium (task, taskService);
    break;
  default:
    {
      console.log('Unknown activityId in process ' + processDefinitionKey + ' (' + activityId + ')');
      taskService.handleFailure(task, {
        errorMessage: 'Unknown activityId in process ' + processDefinitionKey + ' (' + activityId + ')',
        errorDetails: '',
        retries: 0
      });
    }
  }
};

module.exports = {paymentretrieval};

function charge (task, taskService) {
  const amount = task.variables.get('amount');
  const item = task.variables.get('item');

  console.log(`Charging credit card with an amount of ${amount}€ for the item '${item}' ` + ' Process :' + task.processInstanceId );
  taskService.complete(task);
};

function chargepremium (task, taskService) {
  const amount = task.variables.get('amount');
  const item = task.variables.get('item');

  console.log(`Premium charging credit card with an amount of ${amount}€ for the item '${item}' ` + ' Process :' + task.processInstanceId );
  taskService.complete(task);
};

function generate (task, taskService) {
  console.log(`Generating amount and item for process...` + task.processInstanceId);
  const processVariables = new Variables();
  processVariables.set("amount", Number(faker.fake('{{finance.amount}}')));
  processVariables.set('item', faker.fake('{{commerce.product}}'));
  taskService.complete(task, processVariables);
};
