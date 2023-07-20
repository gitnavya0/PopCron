const cron = require('cron-parser');

function getNextCronExecutionTime(cronExpression) {
    const interval = cron.parseExpression(cronExpression, { tz: 'Asia/Kolkata' }); // Set timezone to IST
    const now = new Date(); // Get the current time in UTC
    const nextExecutionTime = interval.next().toDate();
    const nextExecutionTimeIST = new Date(nextExecutionTime.getTime() + (5.5 * 60 * 60 * 1000)); // Convert to IST
    
    return nextExecutionTimeIST.toISOString();
}

module.exports = { getNextCronExecutionTime };
