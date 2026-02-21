const errorMiddleware = async (err, req, res, next) => {
  res.status(500).send({
    success: false,
    message: "Something went wrong",
    err,
  });
};

module.exports = errorMiddleware;
