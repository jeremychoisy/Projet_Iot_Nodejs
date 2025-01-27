module.exports = {
    apps : [{
        name: 'IOT_Project',
        script: './server.js',
        instances: 1,
        autorestart: true,
        error_file: 'err.log',
        out_file: 'out.log',
        log_file: 'combined.log',
        time: true,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
        }
    }],
};
