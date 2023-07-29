const express = require('express');
const cronParser = require('cron-parser');
const { getNextCronExecutionTime } = require('./next_cron_execution.js');
const { getNextEventExecutionTime } = require('./next_event_execution.js');
const { Job } = require('./job_model.js');
const { Completed_Jobs } = require('./completed_job_model.js');
const { connectToDatabase } = require('./db.js');
const { Worker } = require('worker_threads');

const worker = new Worker('./fetch_jobs_worker.js');
worker.on('error', (error) => {
    console.error('Worker Error:', error);
});
worker.on('exit', (code) => {
    console.log(`Worker Thread Exited with Code: ${code}`);
});

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// Middleware to set up CORS headers (This part allows to fetch all headers even when their official website denies the permissions)
app.use((req, res, next) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Max-Age', 86400); // 1 day (86400 seconds)
    next();
});

app.get('/', (req, res, next) => {
    Promise.all([
        Job.find().exec(),
        Completed_Jobs.find().exec()
    ])
        .then(([jobs, completed_jobs]) => {
            res.render('create_task', { jobs, completed_jobs });
        })
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
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

// Endpoint to handle the fetch request from the client using GET method
app.get('/fetch-data', async (req, res) => {
    try {
        const urlToFetch = req.query.url;

        // Make a GET request to the specified URL
        const fetchResponse = await fetch(urlToFetch);

        // Check if the response is successful (status 200-299)
        if (!fetchResponse.ok) {
            throw new Error('Network response was not ok');
        }
        const responseData = await fetchResponse.text();
        console.log("Response fetched");
        res.send(responseData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the data.' });
    }
});

connectToDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('Error starting the server:', err);
    });
