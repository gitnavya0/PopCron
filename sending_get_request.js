const http = require('http');
const { getNextCronExecutionTime } = require('./next_cron_execution.js');
const { Job } = require('./job_model.js');

const sendGetRequests = async (executable_jobs) => {
    try {

        if (executable_jobs.length === 0) {
            console.log("No jobs to execute.");
            return;
        }

        for (const job of executable_jobs) {
            const { url, _id, title, time } = job;

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
                        status: 'failed'
                    };

                    Job.create(completedCron);
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
                const encodedTitle = encodeURIComponent(title);

                const sendMailOptions = {
                    hostname: 'localhost',
                    port: 4000,
                    path: `/send-email?status=${responseReceived}&title=${encodedTitle}`,
                    method: 'GET'
                };

                const sendMailRequest = http.request(sendMailOptions, (response) => {
                    if (response.statusCode === 200) {
                        console.log(`GET request to sendMail.js for job ${_id} sent successfully`);
                    } else {
                        console.error(`Received a non-successful response for job ${_id} from sendMail.js`);
                    }
                });

                sendMailRequest.on('error', (error) => {
                    console.error(`Error while sending GET request to sendMail.js for job ${_id}:`, error.message);
                });

                sendMailRequest.end();
            }
        }
    } catch (error) {
        console.error('Error while sending GET requests:', error.message);
    }
};

module.exports = { sendGetRequests };
