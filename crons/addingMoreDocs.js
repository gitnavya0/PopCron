const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/crons', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB database.');

        const job = mongoose.model('job'); // Reuse the existing model, dont have to define the schema again.

        const newDocuments = [
            { description: '', url: '', time: '', next_execution_time: '' },
            { description: '', url: '', time: '', next_execution_time: '' },
            { description: '', url: '', time: '', next_execution_time: '' }
        ];

        return job.insertMany(newDocuments)
            .then(() => {
                console.log(`${newDocuments.length} documents inserted`);
                mongoose.connection.close();
                console.log('Connection closed.');
            });
    })
    .catch(error => {
        console.error('An error occurred:', error);
        mongoose.connection.close();
        console.log('Connection closed due to error.');
    });
