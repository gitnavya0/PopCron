const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    version: {
        type: Number,
        default: 0,
    },
    taskType: String,
    title: String,
    description: String,
    url: String,
    time: String,
    date: String,
    cron_exp: String,
    priority: {
        type: String,
        default: "No Priority",
    },
    schedule: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ['successful', 'failed', 'pending'],
        default: 'pending'
    }
});

const Job = mongoose.model('Job', jobSchema);
Job.createIndexes({ schedule: 1 });
module.exports = { Job };
