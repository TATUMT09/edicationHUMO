/*
  Catch Errors Handler

  With async/await, you need some way to catch errors
  Instead of using try{} catch(e) {} in each controller, we wrap the function in
  catchErrors(), catch any errors they throw, and pass it along to our express middleware with next()
*/

// Only the error name ever reaches the client (the frontend uses it to spot
// JsonWebTokenError and force a logout) — never the full error object, since
// e.g. a Joi ValidationError carries `_original`, the raw request body
// (passwords included) that was being validated.
const safeError = (error) => (error?.name ? { name: error.name } : undefined);

exports.catchErrors = (fn) => {
  return function (req, res, next) {
    return fn(req, res, next).catch((error) => {
      if (error.name == 'ValidationError') {
        return res.status(400).json({
          success: false,
          result: null,
          message: 'Required fields are not supplied',
          controller: fn.name,
          error: safeError(error),
        });
      } else {
        // Server Error
        return res.status(500).json({
          success: false,
          result: null,
          message: error.message,
          controller: fn.name,
          error: safeError(error),
        });
      }
    });
  };
};

/*
  Not Found Error Handler

  If we hit a route that is not found, we mark it as 404 and pass it along to the next error handler to display
*/
exports.notFound = (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: "Api url doesn't exist ",
  });
};

/*
  Development Error Handler

  In development we show good error messages so if we hit a syntax error or any other previously un-handled error, we can show good info on what happened
*/
exports.developmentErrors = (error, req, res, next) => {
  error.stack = error.stack || '';
  const errorDetails = {
    message: error.message,
    status: error.status,
    stackHighlighted: error.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>'),
  };

  return res.status(500).json({
    success: false,
    message: error.message,
    error: safeError(error),
  });
};

/*
  Production Error Handler

  No stacktraces are leaked to admin
*/
exports.productionErrors = (error, req, res, next) => {
  return res.status(500).json({
    success: false,
    message: error.message,
    error: safeError(error),
  });
};
