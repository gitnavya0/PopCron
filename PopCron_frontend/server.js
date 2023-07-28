const express = require('express');
const cronParser = require('cron-parser');
const { getNextCronExecutionTime } = require('./next_cron_execution.js');
const { getNextEventExecutionTime } = require('./next_event_execution.js');
const { updateJobStatus } = require('./status.js');
const { Job } = require('./model.js');
const { connectToDatabase } = require('./db.js');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res, next) => {
    Job.find()
        .then(jobs => {
            updateJobStatus(jobs);
            res.render('create_task', { jobs });
        });
});
app.post('/', async (req, res) => {
    const { taskType, title, description, url, time, date, cron_exp } = req.body;
    const job = new Job({ taskType, title, description, url, time, date, cron_exp });

    if (taskType === 'event') {
        const timePattern = /^(\d{1,2}):(\d{2})\s(AM|PM)$/i;
        if (!timePattern.test(time)) {
            res.send('<script>alert("Invalid time. Please use hh:mm AM/PM"); window.location.href="/";</script>');
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
