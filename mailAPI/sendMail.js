const csv = require('csv-parser');
const fs = require('fs');
const express = require('express');
const app = express();
const mailgun = require('mailgun-js');
const cron = require('node-cron'); // Import node-cron libraryconst https = require('https');
const https = require('https');
// Add this code before making API requests
const agent = new https.Agent({
    rejectUnauthorized: false // Bypass SSL verification (use with caution)
});

const API_KEY = '637341e905746c3918b65a000d483f80-28e9457d-9e5fa3f5';
const DOMAIN = 'sandboxe6358cd50f9c4f71afbb326b394298d3.mailgun.org';
const mg = mailgun({
    apiKey: API_KEY,
    domain: DOMAIN,
    httpsAgent: agent
});

// Function to calculate attendance
function calculateAttendance(row) {
    const attended = parseFloat(row.attended);
    const total = parseFloat(row.total);

    if (isNaN(attended) || isNaN(total) || total === 0) {
        return 'N/A';
    }

    const attendancePercentage = (attended / total) * 100;
    return attendancePercentage.toFixed(2) + '%';
}


// Function to generate attendance report HTML
function generateAttendanceReportHTML(attendanceReport) {
    let html = '<h2>Attendance Report</h2><table><thead><tr><th>Student Name</th><th>Attendance</th></tr></thead><tbody>';

    attendanceReport.forEach((entry) => {
        html += `<tr><td>${entry.studentName}</td><td>${entry.attendance}</td></tr>`;
    });

    html += '</tbody></table>';
    return html;
}


// Function to send attendance report email
function sendAttendanceReportEmail() {
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

            const sendMailOptions = {
                from: 'bdeepthi359@gmail.com',
                to: 'bdeepthi359@gmail.com',
                subject: 'Attendance Report',
                html: generateAttendanceReportHTML(attendanceReport),
            };

            mg.messages().send(sendMailOptions, (error, body) => {
                if (error) {
                    console.error('Error sending attendance report:', error);
                } else {
                    console.log('Attendance report sent successfully:', body);
                }
            });
        });
}

// Schedule the attendance report to be sent every day at 8 AM
cron.schedule('* * * * *', () => {
    sendAttendanceReportEmail();
});

app.listen(3009, () => {
    console.log('Server is running on port 3000');
});
