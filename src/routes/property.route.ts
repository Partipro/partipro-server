import express from "express";
import Joi from "joi";

import WrapAsync from "partipro-shared/src/middlewares/WrapAsync";
import { httpStatusCodes } from "partipro-shared/src/constants";
import BodyHandler from "../../shared/partipro-shared/src/middlewares/BodyHandler";
import propertyController from "../controllers/property.controller";

const propertyRoute = express.Router();

const schema = Joi.object({
  city: Joi.string(),
  address: Joi.string(),
  contract: Joi.string(),
  monthRent: Joi.number(),
  squareMeters: Joi.number(),
  name: Joi.string().required(),
});

propertyRoute.post(
  "/properties",
  BodyHandler(schema),
  WrapAsync(async (req, res) => {
    const property = await propertyController.insert({ ...req.body, owner: req.user.id });

    res.status(httpStatusCodes.CREATED).json(property);
  }),
);

export default propertyRoute;
