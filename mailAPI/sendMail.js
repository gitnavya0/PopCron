const http = require('http');
const https = require('https');
const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const mailgun = require('mailgun-js');

const OPENWEATHER_API_KEY = ' ';
const API_KEY = ' ';
const DOMAIN = ' ';
const PORT = 3001;

const agent = new https.Agent({
    rejectUnauthorized: false
});
const mg = mailgun({
    apiKey: API_KEY,
    domain: DOMAIN,
    httpsAgent: agent
});

const app = express();

const sendMail = async function (sender_email, receiver_email, email_subject, status, title, time, Error) {
    const data = {
        from: sender_email,
        to: receiver_email,
        subject: email_subject,
        text: status
            ? `Your task titled '${title}' has completed successfully at ${time}!`
            : `Your task titled '${title}' has failed its execution at ${time} because ${Error}.`
    };

    try {
        await new Promise((resolve, reject) => {
            mg.messages().send(data, (error, body) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log(body);
                    resolve(body);
                }
            });
        });
    } catch (error) {
        console.error('Error sending weather email:', error);
    }
};

app.get('/send-email', async (req, res) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const status = urlParams.get('status') === 'true';

    const encodedTitle = urlParams.get('title');
    const decodedTitle = decodeURIComponent(encodedTitle);
    const encodedError = urlParams.get('Error');
    const decodedError = decodeURIComponent(encodedError);

    const Time = new Date();

    const sender_email = ' ';
    const receiver_email = ' ';
    const email_subject = ' ';

    sendMail(sender_email, receiver_email, email_subject, status, decodedTitle, Time, decodedError);

    res.statusCode = 200;
    res.statusMessage = 'Email sent successfully';
    res.end();
});

function calculateAttendance(row) {
    const attended = parseFloat(row.attended);
    const total = parseFloat(row.total);

    if (isNaN(attended) || isNaN(total) || total === 0) {
        return 'N/A';
    }

    const attendancePercentage = (attended / total) * 100;
    return attendancePercentage.toFixed(2) + '%';
}

function generateAttendanceReportHTML(attendanceReport) {
    let html = '<h2>Attendance Report</h2><table><thead><tr><th>Name</th><th>Attendance</th></tr></thead><tbody>';

    attendanceReport.forEach((entry) => {
        html += `<tr><td>${entry.studentName}</td><td>${entry.attendance}</td></tr>`;
    });

    html += '</tbody></table>';
    return html;
}

app.get('/sendAttendanceReport', async (req, res) => {
    const sender_email = ' ';
    const receiver_email = ' ';
    const email_subject = 'PopCron Attendance report!';

    const attendanceData = [];
    fs.createReadStream('attendance.csv')
        .pipe(csv())
        .on('data', (row) => {
            attendanceData.push(row);
        })
        .on('end', async () => {
            const attendanceReport = attendanceData.map((row) => ({
                studentName: row.name,
                attendance: calculateAttendance(row),
            }));

            const email_body = generateAttendanceReportHTML(attendanceReport);
            sendAttendanceMail(sender_email, receiver_email, email_subject, email_body);

            res.statusCode = 200;
            res.statusMessage = 'Email sent successfully';
            res.end();
        });
});

const sendAttendanceMail = async function (sender_email, receiver_email, email_subject, email_body) {
    const data = {
        from: sender_email,
        to: receiver_email,
        subject: email_subject,
        html: email_body
    };

    try {
        await new Promise((resolve, reject) => {
            mg.messages().send(data, (error, body) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log(body);
                    resolve(body);
                }
            });
        });
    } catch (error) {
        console.error('Error sending weather email:', error);
    }
};

const sendWeatherMail = async function (sender_email, receiver_email, email_subject, email_text) {
    const data = {
        from: sender_email,
        to: receiver_email,
        subject: email_subject,
        text: email_text
    };

    try {
        await new Promise((resolve, reject) => {
            mg.messages().send(data, (error, body) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    console.log(body);
                    resolve(body);
                }
            });
        });
    } catch (error) {
        console.error('Error sending weather email:', error);
    }
};

app.get('/sendWeatherReport', async (req, res) => {
    const receiver_email = ' ';
    const sender_email = ' ';
    const email_subject = 'PopCron Weather Report';

    const city = 'Bangalore';
    const openWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}`;

    try {
        https.get(openWeatherURL, (response) => {
            let body = '';

            response.on('data', (chunk) => {
                body += chunk;
            });

            response.on('end', () => {
                const weatherData = JSON.parse(body);
                const weatherDescription = weatherData.weather[0].description;
                const temperature = (weatherData.main.temp - 273.15).toFixed(2);

                const email_text = `The weather in ${city} is currently ${weatherDescription}. The temperature is ${temperature}°C.`;
                sendWeatherMail(sender_email, receiver_email, email_subject, email_text);

                res.statusCode = 200;
                res.statusMessage = 'Email sent successfully';
                res.end();
            });
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.statusCode = 500;
        res.statusMessage = 'Internal Server Error';
        res.end();
    }
});

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
