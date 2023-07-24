function getTaskStatus(taskType, schedule) {
    if (taskType === 'event') {
        const currentTime = new Date();
        const scheduledTime = new Date(schedule);
        
        if (currentTime < scheduledTime) {
            return 'Yet to be done';
        } 
        else if(currentTime > scheduledTime) {
            return 'Already done';
        }
        else {
            return 'In progress';
        }
    } else if (taskType === 'cron') {
        const currentTime = new Date();
        const nextScheduledTime = new Date(schedule);
        
        if (currentTime < nextScheduledTime) {
            return 'In progress';
        } else {
            return 'Yet to be done';
        }
    } else {
        return 'Unknown';
    }
}

module.exports = { getTaskStatus };
