const { isMainThread } = require('worker_threads');

if (!isMainThread) {
    const { fetchJobs } = require('./fetch_jobs.js');

    const intervalTime = 60 * 1000; // Interval in milliseconds (1 minute)

    function performFetch() {
        fetchJobs();
        setTimeout(performFetch, intervalTime);
    }

    performFetch();
}
