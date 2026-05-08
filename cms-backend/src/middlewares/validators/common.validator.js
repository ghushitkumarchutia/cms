const mongoose = require("mongoose");

exports.validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} provided`,
      });
    }
    next();
  };
};
