const mongoose = require('mongoose');

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

async function sortDocumentsAndAssignPriority() {
    try {
        await Job.updateMany({}, { priority: null });

        const documents = await Job.find().lean();
        documents.sort((a, b) => {
            const nextExecutionTimeA = new Date(a.next_execution_time);
            const nextExecutionTimeB = new Date(b.next_execution_time);
            return nextExecutionTimeA - nextExecutionTimeB;
        });

        for (let i = 0; i < documents.length; i++) {
            const document = documents[i];
            await Job.findByIdAndUpdate(document._id, { priority: i + 1 });
        }

        const sortedDocuments = await Job.find().sort({ priority: 1 }).lean();
        console.log('Sorted documents:', sortedDocuments);

    } catch (error) {
        console.error('Error sorting documents:', error);
    } finally {
        mongoose.connection.close();
        console.log('Connection closed.');
    }
}

sortDocumentsAndAssignPriority();
