const { isMainThread } = require('worker_threads');

if (!isMainThread) {
    const { sendGetRequests } = require('./sending_get_request.js');

    const intervalTime = 60 * 1000; // Interval in milliseconds (1 minute)

    function performFetch() {
        sendGetRequests();
        setTimeout(performFetch, intervalTime);
    }

    performFetch();
}
