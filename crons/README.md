this is just to save multiple docs in a database called crons with a collection called jobs using mongoose and nodejs manually. 
no front end required. 

```index.js``` - adds three new documents to the collection whose schema is defined as - 
```ruby
const jobSchema = new mongoose.Schema({
            description: String,
            url: String,
            time: String,
            next_execution_time: String,
            priority: Number
        });
```

```next_execution.js``` - simply returns the next execution time directly from the interval.next() call without converting it to an ISO string with the toISOString() method. This will provide a valid date object that JavaScript's Date can parse. 

```updating_net.js``` - calculates the next execution time for each job using the function from the above file and updates it in the database. 
