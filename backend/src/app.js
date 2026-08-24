const express = require('express');

const cors = require('cors');
const compression = require('compression');

const cookieParser = require('cookie-parser');

const coreAuthRouter = require('./routes/coreRoutes/coreAuth');
const coreApiRouter = require('./routes/coreRoutes/coreApi');
const coreDownloadRouter = require('./routes/coreRoutes/coreDownloadRouter');
const corePublicRouter = require('./routes/coreRoutes/corePublicRouter');
const adminAuth = require('./controllers/coreControllers/adminAuth');

const portalAuthRouter = require('./routes/portalRoutes/portalAuth');
const portalApiRouter = require('./routes/portalRoutes/portalApi');
const studentAuth = require('./controllers/portalControllers/studentAuth');

const errorHandlers = require('./handlers/errorHandlers');
const erpApiRouter = require('./routes/appRoutes/appApi');

const fileUpload = require('express-fileupload');
// create our Express app
const app = express();

// The app always sits behind nginx in production (see the /etc/nginx site
// config), which sets X-Forwarded-For — without this, Express reports every
// request's IP as nginx's own loopback address, so express-rate-limit
// throws (ERR_ERL_UNEXPECTED_X_FORWARDED_FOR) and silently rate-limits the
// entire site as if it were a single visitor instead of per real client IP.
app.set('trust proxy', 1);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
// A malformed JSON body throws here, before any route runs — without this it
// falls through to the generic 500 handler instead of a client-error 400.
app.use((error, req, res, next) => {
  if (error?.type === 'entity.parse.failed' || error instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Invalid JSON in request body.',
    });
  }
  next(error);
});
app.use(express.urlencoded({ extended: true }));

app.use(compression());

// // default options
// app.use(fileUpload());

// Here our API Routes

app.use('/api', coreAuthRouter);
// Student ("portal") routes must be mounted before the blanket Admin gate
// below — that gate matches every /api/* path (including /api/portal/*)
// and would 401 these requests if registered after it.
app.use('/api/portal', portalAuthRouter);
app.use('/api/portal', studentAuth.isValidAuthToken, portalApiRouter);
app.use('/api', adminAuth.isValidAuthToken, coreApiRouter);
app.use('/api', adminAuth.isValidAuthToken, erpApiRouter);
app.use('/download', coreDownloadRouter);
app.use('/public', corePublicRouter);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
