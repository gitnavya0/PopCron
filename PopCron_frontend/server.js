const express = require('express');
const mongoose = require('mongoose');
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

app.use(express.urlencoded({ extended: true }));

const Job = mongoose.model('Job', jobSchema);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    Job.find()
        .then(jobs => {
            res.render('create_task', { jobs });
        });
});

app.post('/', (req, res) => {
    const { taskType, title, description, url, time, date, cron_exp } = req.body;
    const job = new Job({ taskType, title, description, url, time, date, cron_exp });

    job.save()
        .then(async (savedJob) => {
            if (taskType === 'cron') {
                const nextCronExecutionTime = getNextCronExecutionTime(cron_exp);
                await Job.findByIdAndUpdate(
                    savedJob._id,
                    { schedule: nextCronExecutionTime },
                    { new: true }
                );
            }
            else if (taskType === 'event') {
                const nextEventExecutionTime = getNextEventExecutionTime(time, date);
                await Job.findByIdAndUpdate(
                    savedJob._id,
                    { schedule: nextEventExecutionTime },
                    { new: true }
                );
            }
            res.redirect('/');
        });
});

app.post('/delete', async (req, res) => {
    const { id } = req.body;
    await Job.findByIdAndDelete(id);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
