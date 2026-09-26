function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({ message: err.message || 'Terjadi kesalahan pada server' })
}

module.exports = errorHandler