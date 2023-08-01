const { fetchJobs } = require('./fetch_jobs.js');
const http = require('http');
const { Completed_Jobs } = require('./completed_job_model.js');
const { getNextCronExecutionTime } = require('./next_cron_execution.js');
const { Job } = require('./job_model.js');

const sendGetRequests = async () => {
    try {
        const executable_jobs = await fetchJobs();

        if (executable_jobs.length === 0) {
            console.log("No jobs to execute.");
            return;
        }

        for (const job of executable_jobs) {
            const { url, _id } = job;

            let responseReceived = false;

            try {
                const response = await new Promise((resolve, reject) => {
                    http.get(url, (response) => resolve(response)).on('error', reject);
                });

                if (response.statusCode === 200) {
                    console.log(`Response received for job ${_id} from URL ${url}`);
                    responseReceived = true;
                } else {
                    console.error(`Received a non-successful response for job ${_id} from URL ${url}`);
                    responseReceived = false;
                }
            } catch (error) {
                console.error(`Error while fetching job ${_id} from URL ${url}:`, error.message);
            } finally {
                if (job.taskType === 'cron') {
                    job.version += 1;
                    job.schedule = getNextCronExecutionTime(job.cron_exp);

                    await job.save();

                    await Job.findByIdAndRemove(_id).exec();

                    const updatedJob = new Job({
                        taskType: job.taskType,
                        priority: job.priority,
                        title: job.title,
                        description: job.description,
                        url: job.url,
                        cron_exp: job.cron_exp,
                        version: job.version,
                        status: 'Created',
                        schedule: job.schedule
                    });
                    await updatedJob.save();

                    const completedJob = {
                        version: job.version - 1,
                        taskType: job.taskType,
                        priority: job.priority,
                        title: job.title,
                        url: job.url,
                        time: new Date(),
                        status: responseReceived ? 'successful' : 'failed'
                    };

                    Completed_Jobs.create(completedJob);
                } else if (job.taskType === 'event') {

                    const completedJob = {
                        version: job.version,
                        taskType: job.taskType,
                        priority: job.priority,
                        title: job.title,
                        url: job.url,
                        time: new Date(),
                        status: responseReceived ? 'successful' : 'failed'
                    };

                    Completed_Jobs.create(completedJob);
                    await Job.findByIdAndRemove(_id).exec();
                }
            }
        }
    } catch (error) {
        console.error('Error while sending GET requests:', error.message);
    }
};

module.exports = { sendGetRequests };
