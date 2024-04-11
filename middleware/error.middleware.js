module.exports = (fn) => (req, res, next) => {
  console.log("error");
  fn(req, res, next).catch((err) => {
    res.status(500).json({
      message: err?.message || "Something went wrong.",
    });
  });
};
