const express = require('express');
const mongoose = require('mongoose');
const cronParser = require('cron-parser');
const { getNextCronExecutionTime } = require('./next_cron_execution.js');
const { getNextEventExecutionTime } = require('./next_event_execution.js');

const app = express();
const port = 3000;

const mongoURI = 'mongodb+srv://<username>:<password>@cluster0.xwmgvag.mongodb.net/POPCRON?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const jobSchema = new mongoose.Schema({
    taskType: String,
    title: String,
    description: String,
    url: String,
    time: String,
    cron_exp: String,
    date: String,
    schedule: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        default: null,
    }

});


app.use(express.urlencoded({ extended: true }));

const Job = mongoose.model('Job', jobSchema);

app.set('view engine', 'ejs');

app.get('/', (req, res , next) => {
    Job.find()
        .then(jobs => {
            res.render('create_task', { jobs });
        });
});


app.post('/', async (req, res) => {
    const { taskType, title, description, url, time, date, cron_exp } = req.body;
    const job = new Job({ taskType, title, description, url, time, date, cron_exp });

    if (taskType === 'event') {
        const timePattern = /^([0-1]?[0-9]|2[0-3])[.:][0-5][0-9]$/;
        if (!timePattern.test(time)) {
            res.send('<script>alert("Invalid time. Please use hh:mm or hh.mm"); window.location.href="/";</script>');
            return;
        }

        const nextEventExecutionTime = getNextEventExecutionTime(time, date);
        job.schedule = nextEventExecutionTime;
    } else if (taskType === 'cron') {
        try {
            cronParser.parseExpression(cron_exp);
        } catch (error) {
            res.send('<script>alert("Invalid cron expression. Please provide a valid cron expression."); window.location.href="/";</script>');
            return;
        }
        const nextCronExecutionTime = getNextCronExecutionTime(cron_exp);
        job.schedule = nextCronExecutionTime;
    }

    try {
        await job.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.send('<script>alert("Error occurred while saving the job."); window.location.href="/";</script>');
    }
});

app.post('/delete', async (req, res) => {
    const { id } = req.body;
    await Job.findByIdAndDelete(id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
