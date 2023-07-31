const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://<username>:<password>@cluster0.xwmgvag.mongodb.net/POPCRON?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
    try {
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        //console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
    }
}

module.exports = { connectToDatabase };
