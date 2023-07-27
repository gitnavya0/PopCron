//status rn changes only when refreshed. 
function updateJobStatus(jobs) {
    const currentTimeUTC = Date.now();

    for (const job of jobs) {
        const scheduledTime = new Date(job.schedule).getTime();
        const currentTimeIST = new Date(currentTimeUTC + (5 * 60 + 30) * 60 * 1000);

        if (job.taskType === 'event') {
            if (currentTimeIST < scheduledTime) {
                job.status = 'scheduled';
            } else if (currentTimeIST >= scheduledTime && currentTimeIST < scheduledTime + 60000) {
                job.status = 'in progress'; // doesnt check if the event was actually run but just shows in progress for a minute. 
            } else {
                job.status = 'completed';
            } //refresh after a minute it'll show completed. 
        } else if (job.taskType === 'cron') {
            if (currentTimeIST < scheduledTime) {
                job.status = 'scheduled';
            } //this shows in progress for a minute doesnt check if cron was actually run.
            else if (currentTimeIST >= scheduledTime && currentTimeIST < scheduledTime + 60000) {
                job.status = 'in progress';
            } else { // once executed, calculate next time of execution and make it scheduled again. 
                //job.schedule = getNextCronExecutionTime(job.cron_exp).toISOString();
                job.status = 'calculate next execution time then scheduled.';
            }
        }
    }
}

module.exports = { updateJobStatus };
