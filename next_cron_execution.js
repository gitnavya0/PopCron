const cron = require('cron-parser');

function getNextCronExecutionTime(cronExpression) {
    const interval = cron.parseExpression(cronExpression, { tz: 'Asia/Kolkata' }); 
    const now = new Date(); 
    const nextExecutionTime = interval.next().toDate();
    const nextExecutionTimeIST = new Date(nextExecutionTime.getTime() + (5.5 * 60 * 60 * 1000)); 
    
    return nextExecutionTimeIST.toISOString();
}

module.exports = { getNextCronExecutionTime };
