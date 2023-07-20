const cronParser = require('cron-parser');

function getNextCronExecutionTime(cronExpression) {
    const interval = cronParser.parseExpression(cronExpression);
    const nextExecutionTime = interval.next();
    const getNextCronExecutionTime = nextExecutionTime.toISOString();

    return getNextCronExecutionTime;
}

module.exports = { getNextCronExecutionTime };
