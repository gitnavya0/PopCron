const { fetchJobs } = require('./fetch_jobs.js');
const http = require('http');

const sendGetRequests = async () => {
    try {
        const executable_jobs = await fetchJobs();

        if (executable_jobs.length === 0) {
            console.log("No jobs to execute.");
            return;
        }

        for (const job of executable_jobs) {
            const { url, _id } = job;

            try {
                http.get(url, (response) => {
                    if (response.statusCode !== 200) {
                        throw new Error(`Received a non-successful response for job ${_id} from URL ${url}`);
                    }

                    console.log(`Response received for job ${_id} from URL ${url}`);
                }).on('error', (error) => {
                    console.error(`Error while fetching job ${_id} from URL ${url}:`, error.message);
                });
            } catch (error) {
                console.error(`Error while fetching job ${_id} from URL ${url}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error while sending GET requests:', error.message);
    }
};

module.exports = { sendGetRequests };




