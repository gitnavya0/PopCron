const http = require('http');
const https = require('https');
const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const mailgun = require('mailgun-js');

const OPENWEATHER_API_KEY = ' ';
const API_KEY = ' ';
const DOMAIN = ' ';

const agent = new https.Agent({
    rejectUnauthorized: false
});
const mg = mailgun({
    apiKey: API_KEY,
    domain: DOMAIN,
    httpsAgent: agent
});

const sendMail = function (sender_email, receiver_email, email_subject, status, title, time, Error) {
    const data = {
        from: sender_email,
        to: receiver_email,
        subject: email_subject,
        text: status
            ? `Your task titled '${title}' has completed successfully at ${time}!`
            : `Your task titled '${title}' has failed its execution at ${time} because ${Error}.`
    };

    mg.messages().send(data, (error, body) => {
        if (error) {
            console.log(error);
        } else {
            console.log(body);
        }
    });
};

const server1 = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url.startsWith('/send-email')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const status = urlParams.get('status') === 'true';

        const encodedTitle = urlParams.get('title');
        const decodedTitle = decodeURIComponent(encodedTitle);
        const encodedError = urlParams.get('Error');
        const decodedError = decodeURIComponent(encodedError);

        const Time = new Date();

        const sender_email = ' ';
        const receiver_email = ' ';
        const email_subject = 'PopCron Update!';

        sendMail(sender_email, receiver_email, email_subject, status, decodedTitle, Time, decodedError);

        res.statusCode = 200;
        res.statusMessage = 'Email sent successfully';
        res.end();
    } else {
        res.statusCode = 404;
        res.statusMessage = 'Not Found';
        res.end();
    }
});

const PORT1 = 3001;
server1.listen(PORT1, () => {
    console.log(`Server1 is running on port ${PORT1}`);
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

const sendAttendanceMail = function (sender_email, receiver_email, email_subject, email_body) {
    const data = {
        from: sender_email,
        to: receiver_email,
        subject: email_subject,
        html: email_body
    };

    mg.messages().send(data, (error, body) => {
        if (error) {
            console.log(error);
        } else {
            console.log(body);
        }
    });
};

const server2 = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url.startsWith('/sendAttendanceReport')) {

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
    } else {
        res.statusCode = 404;
        res.statusMessage = 'Not Found';
        res.end();
    }
});

const PORT2 = 3002;
server2.listen(PORT2, () => {
    console.log(`Server2 is running on port ${PORT2}`);
});

const sendWeatherMail = function (sender_email, receiver_email, email_subject, email_text) {
    const data = {
        from: sender_email,
        to: receiver_email,
        subject: email_subject,
        text: email_text
    };

    mg.messages().send(data, (error, body) => {
        if (error) {
            console.log(error);
        } else {
            console.log(body);
        }
    });
};

const server3 = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url.startsWith('/send-weather-report')) {
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
    } else {
        res.statusCode = 404;
        res.statusMessage = 'Not Found';
        res.end();
    }
});
const PORT3 = 3003;
server3.listen(PORT3, () => {
    console.log(`Server3 is running on port ${PORT3}`);
});
