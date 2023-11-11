import express from "express";
import Joi from "joi";

import { httpStatusCodes } from "partipro-shared/src/constants";

import WrapAsync from "partipro-shared/src/middlewares/WrapAsync";
import BodyHandler from "partipro-shared/src/middlewares/BodyHandler";
import QueryHandler from "partipro-shared/src/middlewares/QueryHandler";
import FileUploadHandler from "partipro-shared/src/middlewares/FileUploadHandler";

import propertyController from "../controllers/property.controller";
import { PropertyType } from "partipro-shared/src/models/property/property.interface";
import NotFoundError from "partipro-shared/src/errors/NotFoundError";

const propertyRoute = express.Router();

const baseSchema = {
  city: Joi.string(),
  address: Joi.string(),
  contract: Joi.string(),
  monthRent: Joi.number(),
  squareMeters: Joi.number(),
};

const createSchema = Joi.object({
  ...baseSchema,
  name: Joi.string().required(),
  type: Joi.string().valid(PropertyType.COMMERCIAL, PropertyType.RESIDENTIAL).required(),
});

const searchSchema = Joi.object({
  ...baseSchema,
  name: Joi.string(),
  type: Joi.string().valid(PropertyType.COMMERCIAL, PropertyType.RESIDENTIAL),
});

propertyRoute.get(
  "/properties",
  QueryHandler(searchSchema),
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

propertyRoute.get(
  "/properties/:id",
  WrapAsync(async (req, res) => {
    const property = await propertyController.findById(req.params.id);

    if (!property) {
      throw new NotFoundError("property_not_found", "Propriedade não encontrada");
    }

    res.status(httpStatusCodes.OK).json(property);
  }),
);

propertyRoute.post(
  "/properties",
  FileUploadHandler([{ name: "image", type: "image" }]),
  BodyHandler(createSchema),
  WrapAsync(async (req, res) => {
    const property = await propertyController.insert({
      ...req.body,
      file: (req.files as Express.Multer.File[])?.find((file) => file.fieldname === "image"),
      owner: req.user.id,
      contract: req.user.contract,
    });

    res.status(httpStatusCodes.CREATED).json(property);
  }),
);

propertyRoute.put(
  "/properties/:id",
  FileUploadHandler([{ name: "image", type: "image" }]),
  BodyHandler(searchSchema),
  WrapAsync(async (req, res) => {
    const property = await propertyController.update(req.params.id, {
      props: req.body,
      file: (req.files as Express.Multer.File[])?.find((file) => file.fieldname === "image"),
    });

    res.status(httpStatusCodes.OK).json(property);
  }),
);

propertyRoute.delete(
  "/properties/:id",
  WrapAsync(async (req, res) => {
    const property = await propertyController.delete(req.params.id);

    res.status(httpStatusCodes.OK).json(property);
  }),
);

export default propertyRoute;
