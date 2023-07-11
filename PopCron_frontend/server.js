const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

const mongoURI = 'mongodb+srv://navya2govil:homework@cluster0.xwmgvag.mongodb.net/POPCRON?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const jobSchema = new mongoose.Schema({
    description: String,
    url: String,
    time: String
});

const Job = mongoose.model('Job', jobSchema);

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    Job.find()
        .then(jobs => {
            res.render('popcron', { jobs });
        });
});b

app.post('/', (req, res) => {
    const { description, url, time } = req.body;
    const job = new Job({ description, url, time });

    job.save()
        .then(() => {
            res.redirect('/');
        });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
