const { fetchJobs } = require('./fetch_jobs.js');
const http = require('http');
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
                if (job.taskType === 'cron' && responseReceived == false) {
                    job.status = 'failed';
                    job.time = job.time;
                    await job.save();
                }
                else if (job.taskType === 'cron' && responseReceived == true) {
                    job.version += 1;
                    job.schedule = getNextCronExecutionTime(job.cron_exp);
                    await job.save();

                    const completedCron = {
                        version: job.version - 1,
                        taskType: job.taskType,
                        priority: job.priority,
                        title: job.title,
                        url: job.url,
                        time: new Date(),
                        status: 'successful'
                    };

                    Job.create(completedCron);
                }
                else {
                    job.status = responseReceived ? 'successful' : 'failed';
                    await job.save();
                }
            }
        }
    } catch (error) {
        console.error('Error while sending GET requests:', error.message);
    }
};

module.exports = { sendGetRequests };
