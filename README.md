# Crons-scheduling-platform
ongoing project.

the server runs on localhost:3000. it displays a form that asks user to enter the following details of the task he wants to create. 
- if the user wants to create an _event_  - Title, Description, URL, time and date 
- if the user wants to create a _cron_  - Title, Description, URL, linux cron expression 

these details are saved in a mongodb collection called "jobs". they are also displayed in a table with their details under the form. their status is made "created" and if task Type is:
- _cron_ - its next execution time is calculated using a cron parser and the current time. saved in ISO format following Indian Standard Time (IST)
- _event_ - its time and date is simply converted to an ISO string following Indian Standard Time (IST)

every minute, a worker thread runs and sends a query to the db to check if theres any task that needs to be run at the current moment (by comparing its scheduled time with the current time) and adds these tasks to an "executable_jobs" array. From here a get request is sent for all these tasks, a response is received and a success (or failure) message is displayed on the console along with the title, id and url of all tasks that were just executed. 

once a task is executed it is moved to another collection called "completed_jobs" with a status of "successful" or "failed" depending on whether or not a response was recieved for its respective get request. this is also displayed in the form of a table under under the above table. 

if due to some error the server was down for some time and the tasks could not be executed, the following is done:
- if a cron - its next execution time is calculated with respect to the current time (when server started again)
- if an event - its runs the next mintue the server starts.

to make this more dynamic the main localhost:3000 page is refreshed every mintue and reflects all updates that have occured. 
  
