const { isMainThread } = require('worker_threads');
const { fetchJobs } = require('./fetch_jobs.js');

if (!isMainThread) {
    const { sendGetRequests } = require('./sending_get_request.js');

    const intervalTime = 60 * 1000;

    async function performFetch() {
        const executable_jobs = await fetchJobs();
        sendGetRequests(executable_jobs);
        setTimeout(performFetch, intervalTime);
    }

    performFetch();
}
