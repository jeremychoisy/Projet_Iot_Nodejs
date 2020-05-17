const fleetRouter = require('./Fleet/router');
const pingRouter = require('./Ping/router');
const positionRouter = require('./Position/router');
const configRouter = require('./Config/router');
const APRouter = require('./AccessPoint/router');
const StatisticsRouter = require('./Statistics/router');

module.exports = (app) => {
    app.use('/fleet', fleetRouter);
    app.use('/ping', pingRouter);
    app.use('/position', positionRouter);
    app.use('/config', configRouter);
    app.use('/access-point', APRouter);
    app.use('/statistics', StatisticsRouter);
};
