const dbConfigs = [
    {
        user: '',
        password: '',
        host: '',
        dbName: '',
        port: '',
        backupDir: '/bk',
        schedule: '* * * * *', // Every 1 minute
    },
    // Add more database configurations as needed
];

module.exports = dbConfigs;
