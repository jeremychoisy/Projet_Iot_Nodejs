const fleetRouter = require('./Fleet/router');
const pingRouter = require('./Ping/router');
const positionRouter = require('./Position/router');


module.exports = (app) => {
    app.use('/fleet', fleetRouter);
    app.use('/ping', pingRouter);
    app.use('/position', positionRouter);
};
