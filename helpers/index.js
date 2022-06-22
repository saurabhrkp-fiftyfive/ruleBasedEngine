const createError = require('http-errors');

exports.sendResponse = async (res, status = 200, body = { messsage: 'OK' }) => {
  return res.status(status).json({ ...body });
};

exports.sendErrorResponse = async (next, status = 500, error = { messsage: 'NOT OK' }) => {
  return next(createError(status, error, { expose: true }));
};