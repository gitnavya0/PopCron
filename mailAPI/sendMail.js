let API_KEY = 'add your api key here';
let DOMAIN = 'add your domain name here';
const mailgun = require('mailgun-js');
const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });
const http = require('http');

sendMail = function (sender_email, receiver_email, email_subject, status, title, time) {
    const data = {
        from: sender_email,
        to: receiver_email,
        subject: email_subject,
        text: status ? `your task titled '${title}' has completed successfully at ${time}!` : `Your task titled '${title}' has failed it's execution at ${time}.`
    };

    mg.messages().send(data, (error, body) => {
        if (error) {
            console.log(error);
        } else {
            console.log(body);
        }
    });
}
const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url.startsWith('/send-email')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const status = urlParams.get('status') === 'true';

        const encodedTitle = urlParams.get('title');
        const decodedTitle = decodeURIComponent(encodedTitle);

        const Time = new Date();

        const sender_email = 'add your email here';
        const receiver_email = 'add your email here';
        const email_subject = 'PopCron Update!';

        sendMail(sender_email, receiver_email, email_subject, status, decodedTitle, Time);

        res.statusCode = 200;
        res.statusMessage = 'Email sent successfully';
        res.end();
    } else {
        res.statusCode = 404;
        res.statusMessage = 'Not Found';
        res.end();
    }
});
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});