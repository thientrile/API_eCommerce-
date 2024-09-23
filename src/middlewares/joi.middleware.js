"use strict";


const { BadRequestError } = require("../core/error.response");
const validateSchema = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      next(new BadRequestError(error.details[0].message));
    }
  };
};

module.exports = { validateSchema };
