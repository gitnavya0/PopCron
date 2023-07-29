const { Job } = require('./job_model.js');
const { connectToDatabase } = require('./db.js');
const { Completed_Jobs } = require('./completed_job_model.js');
const {getNextCronExecutionTime}  = require('./next_cron_execution.js')
const {getNextEventExecutionTime} = require('./next_cron_execution.js')

const getCurrentTime = () => {
    const currentTimeUTC = Date.now();
    const currentTimeIST = new Date(currentTimeUTC + (5 * 60 + 30) * 60 * 1000);
    currentTimeIST.setSeconds(0);
    currentTimeIST.setMilliseconds(0);
    return currentTimeIST.toISOString();
};


const fetchJobs = async () => {
    try {
        const currentTime = getCurrentTime();
        console.log('current time:', currentTime);
        const query = { schedule: currentTime };
        const executable_jobs = await Job.find(query).exec();
        
        console.log('executable jobs:');
        console.log(executable_jobs);

        
        const completedJobs = [];


        for (const job of executable_jobs) {
            if (job.taskType === 'cron') {
                // For cron jobs, update the version to version + 1 after execution
                job.version += 1;
                await job.save();

                // Add the completed cron job to the completed tasks list
                completedJobs.push({
                    version: job.version - 1,
                    taskType: job.taskType,
                    title: job.title,
                    url: job.url,
                    time: new Date(),
                });

                // Add the next scheduled cron job with version + 1 to the list of created tasks
                const nextCronExecutionTime = getNextCronExecutionTime(job.cron_exp);
                const nextCronJob = new Job({
                    taskType: job.taskType,
                    title: job.title,
                    description: job.description,
                    url: job.url,
                    cron_exp: job.cron_exp,
                    version: job.version,
                    status : 'Created', 
                    schedule: nextCronExecutionTime,
                });
                await nextCronJob.save();
            } else {
                job.status = 'running';
                await job.save();

                completedJobs.push({
                    version: job.version,
                    taskType: job.taskType,
                    title: job.title,
                    url: job.url,
                    time: new Date(),
                });
            }
        }

        // Insert completed cron jobs to the completed tasks list
        if (completedJobs.length > 0) {
            await Completed_Jobs.insertMany(completedJobs);
        }

        // Remove all executed jobs
        await Job.deleteMany(query);

        return executable_jobs;
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
};

connectToDatabase();
module.exports = { fetchJobs };

