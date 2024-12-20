const { Api401Error, Api403Error, Api404Error, BusinessLogicError, BaseError } = require('@/core/error.response')

const returnError = (err, req, res, next) => {
  const statusCode = err.status || 500
  let error
  if (err instanceof BaseError) {
    error = {}
    error.name = err.name
    error.statusCode = err.statusCode
    error.isOperational = err.isOperational
    error.message = err.message
    error.errors = err.errors
  } else {
    error = { ...err }
    // mapping error
    if (err.name === 'CastError') error = handleCastErrorDB(err)
    if (err.code === 11000) error = handleDuplicateFieldsDB(err)
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err)
    if (err.name === 'JsonWebTokenError') error = handlerJWTError(err)
    if (err.name === 'TokenExpiredError') error = handlerJWTExpiredError(err)
  }

  // Include stack trace in development mode
  const response = {
    status: statusCode,
    message: error.message || 'Internal server error',
    errors: error.errors
  }

  if (process.env.NODE_ENV === 'local') {
    response.stack = err.stack // Add stack trace
  }

  return res.status(statusCode).json(response)
}

const isOperationalError = (error) => {
  if (error instanceof BaseError) {
    return error.isOperational
  }
  return false
}

const is404Handler = (req, res, next) => {
  const error = new Api404Error('Resource not found')
  next(error)
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new BusinessLogicError(message)
}

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
  console.log(value)
  const message = `Duplicate field value: ${value}. Please use another value!`
  return new BusinessLogicError(message)
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message)
  console.log(errors)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new BusinessLogicError(message)
}

const handlerJWTError = (err) => {
  console.error(err)
  const message = `Invalid token. Please login again!`
  return new Api401Error(message)
}

const handlerJWTExpiredError = (err) => {
  console.error(err)
  const message = `Your token has expired! Please login again.`
  return new Api403Error(message)
}

module.exports = {
  returnError,
  isOperationalError,
  is404Handler
}
