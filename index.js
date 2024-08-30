const { exec } = require('child_process');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const dbConfigs = require('./data');

// Backup file name with date format
const getBackupFileName = (dbConfig) => {
    const date = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
    return `${dbConfig.backupDir}/${dbConfig.dbName}-${date}.sql.gz`;
};

// Function to back up the database
const backupDatabase = (dbConfig) => {
    const backupFile = getBackupFileName(dbConfig);
    const dumpCommand = `mysqldump -u ${dbConfig.user} -h ${dbConfig.host} --port=${dbConfig.port} -p${dbConfig.password} ${dbConfig.dbName} | gzip > ${backupFile}`;

    exec(dumpCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error creating backup for ${dbConfig.dbName}: ${error.message}`);
            sendNotification(`Backup failed for ${dbConfig.dbName}`, `Error: ${error.message}`);
            return;
        }

        console.log(`Backup created: ${backupFile}`);
        transferBackup(backupFile, dbConfig);
    });
};

// Function to transfer the backup to another server
const transferBackup = (backupFile, dbConfig) => {
    const remotePath = 'user@another_server:/path/to/destination/dir/';
    const transferCommand = `scp ${backupFile} ${remotePath}`;

    exec(transferCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error transferring backup for ${dbConfig.dbName}: ${error.message}`);
            sendNotification(`Backup transfer failed for ${dbConfig.dbName}`, `Error: ${error.message}`);
            return;
        }

        console.log(`Backup transferred: ${backupFile}`);
        sendNotification(`Backup successful for ${dbConfig.dbName}`, `Backup file: ${backupFile}`);
    });
};

// Function to send email notifications
const sendNotification = (subject, message) => {
    // let transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: 'your_email@gmail.com',
    //         pass: 'your_email_password',
    //     },
    // });

    // let mailOptions = {
    //     from: 'your_email@gmail.com',
    //     to: 'recipient_email@example.com',
    //     subject: subject,
    //     text: message,
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         return console.log(`Error sending email: ${error.message}`);
    //     }
    //     console.log('Email sent: ' + info.response);
    // });
};

// Schedule the backup according to each database's schedule
dbConfigs.forEach((dbConfig) => {
    cron.schedule(dbConfig.schedule, () => {
        console.log(`Running database backup for ${dbConfig.dbName}...`);
        backupDatabase(dbConfig);
    });
});

// Start the cron jobs
console.log('Scheduled backup tasks started.');
