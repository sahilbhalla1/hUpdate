module.exports = (err, req, res, next) => {
  res.status(400).json({
    message: err.message || 'Server error',
  });
};
