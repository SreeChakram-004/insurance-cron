// middlewares/errorMiddleware.js

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
  };
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
  
    // Determine the error response based on the environment mode
    res.json({
      error: {
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        status: statusCode,
      },
    });
  };

module.exports = {notFound , errorHandler}
  