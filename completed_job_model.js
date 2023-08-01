const mongoose = require('mongoose');

const CompletedJobSchema = new mongoose.Schema({
    version: Number,
    taskType: String,
    priority: String,
    title: String,
    url: String,
    time: String,
    status: String
});

const Completed_Jobs = mongoose.model('Completed_Jobs', CompletedJobSchema);

module.exports = { Completed_Jobs };
