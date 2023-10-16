import express from "express";
import Joi from "joi";

import { httpStatusCodes } from "partipro-shared/src/constants";

import WrapAsync from "partipro-shared/src/middlewares/WrapAsync";
import BodyHandler from "../../shared/partipro-shared/src/middlewares/BodyHandler";
import QueryHandler from "partipro-shared/src/middlewares/QueryHandler";
import FileUploadHandler from "partipro-shared/src/middlewares/FileUploadHandler";

import propertyController from "../controllers/property.controller";
import { PropertyType } from "../../shared/partipro-shared/src/models/property/property.interface";

const propertyRoute = express.Router();

const schema = Joi.object({
  city: Joi.string(),
  address: Joi.string(),
  contract: Joi.string(),
  monthRent: Joi.number(),
  squareMeters: Joi.number(),
  name: Joi.string().required(),
  type: Joi.string().valid(PropertyType.COMMERCIAL, PropertyType.RESIDENTIAL).required(),
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
      type: Joi.string().valid(PropertyType.COMMERCIAL, PropertyType.RESIDENTIAL),
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
  FileUploadHandler([{ name: "photo", type: "image" }]),
  BodyHandler(schema),
  WrapAsync(async (req, res) => {
    const property = await propertyController.insert({ ...req.body, owner: req.user.id, contract: req.user.contract });

    res.status(httpStatusCodes.CREATED).json(property);
  }),
);

export default propertyRoute;
