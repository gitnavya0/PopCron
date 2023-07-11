const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/crons', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB database.');

        const jobSchema = new mongoose.Schema({
            description: String,
            url: String,
            time: String,
            next_execution_time: String,
            priority: Number
        });

        const job = mongoose.model('job', jobSchema);

        const jobsToAdd = [
            { description: 'hit google At 04:05 on Sunday', url: 'www.google.com', time: '5 4 * * sun', next_execution_time: "-", priority: " " },
            { description: 'hit youtube At 14:15 on day-of-month 1.', url: 'www.youtube.com', time: '15 14 1 * *', next_execution_time: "-", priority: " " },
            { description: 'hit ....', url: 'this is the url', time: '*****', next_execution_time: "-", priority: " " },
        ];

        return job.insertMany(jobsToAdd)
            .then(() => {
                console.log(`${jobsToAdd.length} documents inserted`);
                mongoose.connection.close();
                console.log('Connection closed.');
            });
    })
    .catch(error => {
        console.error('An error occurred:', error);
        mongoose.connection.close();
        console.log('Connection closed due to error.');
    });
//everytime you run this, three new docs will be added to jobs
//change jobs to add more jobs and run it everytime. 
