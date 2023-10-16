import express from "express";
import Joi from "joi";

import WrapAsync from "partipro-shared/src/middlewares/WrapAsync";
import { httpStatusCodes } from "partipro-shared/src/constants";
import BodyHandler from "../../shared/partipro-shared/src/middlewares/BodyHandler";
import QueryHandler from "partipro-shared/src/middlewares/QueryHandler";

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

propertyRoute.get(
  "/properties",
  QueryHandler(
    Joi.object({
      name: Joi.string(),
      city: Joi.string(),
      address: Joi.string(),
      monthRent: Joi.number(),
      squareMeters: Joi.number(),
    }),
  ),
  WrapAsync(async (req, res) => {
    res.status(httpStatusCodes.OK).json(
      await propertyController.list({
        filters: {
          ...req.filters,
          contract: req.user.contract,
          ...(req.filters.name && {
            name: {
              $regex: req.filters.name,
              $options: "i",
            },
          }),
        },
      }),
    );
  }),
);

propertyRoute.post(
  "/properties",
  BodyHandler(schema),
  WrapAsync(async (req, res) => {
    const property = await propertyController.insert({ ...req.body, owner: req.user.id, contract: req.user.contract });

    res.status(httpStatusCodes.CREATED).json(property);
  }),
);

export default propertyRoute;
