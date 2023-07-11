//displayes all the jobs in the database with their next execution times. 
// also updates the next execution time of all the docs. 
const mongoose = require('mongoose');
const { getNextCronExecutionTime } = require('./next_execution.js');

mongoose.connect('mongodb://localhost:27017/crons', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
console.log('MongoDB connection established.');

const Jobschema = new mongoose.Schema({
    description: String,
    time: String,
    url: String,
    next_execution_time: String,
    priority: Number
});

const Job = mongoose.model('Job', Jobschema);

async function updateNextExecutionTime() {
    try {
        const documents = await Job.find().select('_id time').lean();
        console.log('Retrieved documents:', documents);

        for (const document of documents) {
            const nextExecutionTime = getNextCronExecutionTime(document.time);
            await Job.findByIdAndUpdate(
                document._id,
                { next_execution_time: nextExecutionTime },
                { new: true }
            );
            console.log(
                `Next execution time of Job ID ${document._id}: ${nextExecutionTime}\n`
            );
        }
    } catch (error) {
        console.error('Error updating next execution times:', error);
    } finally {
        mongoose.connection.close();
        console.log('Connection closed.');
    }
}

updateNextExecutionTime().then(() => {
    console.log('Next execution times updated successfully.');
}).catch((error) => {
    console.error(error);
});
