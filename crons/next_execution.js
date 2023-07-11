const cron = require('cron-parser');

function getNextCronExecutionTime(cronExpression) {
    const interval = cron.parseExpression(cronExpression);
    const nextExecutionTime = interval.next();
    const getNextCronExecutionTime = nextExecutionTime.toISOString();

    return getNextCronExecutionTime;
}

module.exports = { getNextCronExecutionTime };

/*the nextExecutionTime is obtained directly from the interval.next() 
call without converting it to an ISO string with the toISOString() method. 
This will provide a valid date object that JavaScript's Date can parse.*/