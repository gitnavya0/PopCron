function getTaskStatus(taskType, schedule) {
    if (taskType === 'event') {
        const currentTime = new Date();
        const scheduledTime = new Date(schedule);

        if (currentTime < scheduledTime) {
            return 'Scheduled';
        }
        else if (currentTime > scheduledTime) {
            return 'Completed';
        }
        else {
            return 'In progress';
        }
    } else if (taskType === 'cron') {
        const currentTime = new Date();
        const nextScheduledTime = new Date(schedule);

        if (currentTime < nextScheduledTime) {
            return 'Scheduled';
        }
        else if (currentTime > nextScheduledTime) {
            return 'Completed';
        }
        else {
            return 'In progress';
        }
    } else {
        return 'Unknown';
    }
}

module.exports = { getTaskStatus };
