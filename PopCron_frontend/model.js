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
    schedule: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        default: null,
    }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = { Job };