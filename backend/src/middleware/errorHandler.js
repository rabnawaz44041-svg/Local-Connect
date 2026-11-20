const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Request body must be valid JSON.",
    });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "That value is already in use.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
};

module.exports = {
  notFound,
  errorHandler,
};
