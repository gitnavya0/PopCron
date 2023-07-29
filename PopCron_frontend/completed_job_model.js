const mongoose = require('mongoose');

const CompletedJobSchema = new mongoose.Schema({
    version: Number,
    taskType: String,
    title: String,
    url: String,
    time: String
});

const Completed_Jobs = mongoose.model('Completed_Jobs', CompletedJobSchema);

module.exports = { Completed_Jobs };