const { connectToDatabase } = require("./db")
const { getNextCronExecutionTime } = require('./next_cron_execution.js');
const { Job } = require('./job_model.js');

const getCurrentTime = () => {
    const currentTimeUTC = Date.now();
    const currentTimeIST = new Date(currentTimeUTC + (5 * 60 + 30) * 60 * 1000);
    currentTimeIST.setSeconds(0);
    currentTimeIST.setMilliseconds(0);
    return currentTimeIST.toISOString();
};

async function updateJobs() {
    try {
        const currentTime = getCurrentTime();

        const cronJobs = await Job.find({ taskType: "cron", schedule: { $lt: currentTime }, priority: "low" }).exec();
        for (const cron of cronJobs) {
            const nextExecutionTime = getNextCronExecutionTime(cron.cron_exp);
            await Job.updateOne(
                { _id: cron._id },
                {
                    $set: {
                        schedule: nextExecutionTime
                    }
                }
            ).exec();
        }

        await Job.updateMany(
            {
                $or: [
                    { taskType: "event", schedule: { $lt: currentTime } },
                    { taskType: "cron", schedule: { $lt: currentTime }, priority: "high" }
                ]
            },
            {
                $set: {
                    schedule: currentTime
                }
            }
        ).exec();
    } catch (err) {
        console.error('Error updating jobs:', err);
    }
};

connectToDatabase();
module.exports = { updateJobs };
