import express from "express";
import Joi from "joi";

import { httpStatusCodes } from "@shared/constants";

import WrapAsync from "@shared/middlewares/WrapAsync";
import BodyHandler from "@shared/middlewares/BodyHandler";
import QueryHandler from "@shared/middlewares/QueryHandler";

import renterController from "../controllers/renter.controller";
import NotFoundError from "@shared/errors/NotFoundError";

const renterRoute = express.Router();

const createSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  business: Joi.string(),
});

const searchSchema = Joi.object({
  criteria: Joi.string().allow(null, ""),
  business: Joi.string().allow(null, ""),
});

renterRoute.get(
  "/renters",
  QueryHandler(searchSchema),
  WrapAsync(async (req, res) => {
    res.status(httpStatusCodes.OK).json(
      await renterController.list({
        filters: {
          contract: req.user.contract,
          ...(req.filters.business && {
            business: {
              $regex: req.filters.business,
              $options: "i",
            },
          }),
          ...(req.filters.criteria && {
            $or: [
              {
                name: {
                  $regex: req.filters.criteria,
                  $options: "i",
                },
              },
              {
                email: {
                  $regex: req.filters.criteria,
                  $options: "i",
                },
              },
            ],
          }),
        },
      }),
    );
  }),
);

renterRoute.get(
  "/renters/:id",
  WrapAsync(async (req, res) => {
    const renter = await renterController.findById(req.params.id);

    if (!renter) {
      throw new NotFoundError("renter_not_found", "Locatário não encontrado");
    }

    res.status(httpStatusCodes.OK).json(renter);
  }),
);

renterRoute.post(
  "/renters",
  BodyHandler(createSchema),
  WrapAsync(async (req, res) => {
    const property = await renterController.insert({
      ...req.body,
      contract: req.user.contract,
    });

    res.status(httpStatusCodes.CREATED).json(property);
  }),
);

renterRoute.put(
  "/renters/:id",
  BodyHandler(searchSchema),
  WrapAsync(async (req, res) => {
    const renters = await renterController.update(req.params.id, {
      props: req.body,
    });

    res.status(httpStatusCodes.OK).json(renters);
  }),
);

renterRoute.delete(
  "/renters/:id",
  WrapAsync(async (req, res) => {
    const renters = await renterController.delete(req.params.id);

    res.status(httpStatusCodes.OK).json(renters);
  }),
);

export default renterRoute;
