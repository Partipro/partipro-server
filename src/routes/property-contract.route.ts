import Joi from "joi";
import express from "express";

import PageHandler from "@shared/middlewares/PageHandler";
import WrapAsync from "@shared/middlewares/WrapAsync";
import { httpStatusCodes } from "@shared/constants";

import propertyContractController from "../controllers/property-contract.controller";
import { PropertyContractStatus } from "@shared/models/propertyContract/propertyContract.interface";
import BodyHandler from "@shared/middlewares/BodyHandler";
import FileUploadHandler from "@shared/middlewares/FileUploadHandler";

const propertiesContract = express.Router();

propertiesContract.get(
  "/properties-contracts",
  PageHandler(
    Joi.object({
      signedAt: Joi.string().isoDate().allow(null, ""),
      property: Joi.string(),
      renter: Joi.string(),
      status: Joi.string().allow(
        PropertyContractStatus.ACTIVE,
        PropertyContractStatus.EXPIRED,
        PropertyContractStatus.AWAITING_SIGN,
      ),
    }),
  ),
  WrapAsync(async (req, res) => {
    res.status(httpStatusCodes.OK).json(
      await propertyContractController.paginate({
        ...req.pagination,
        populate: [{ path: "property" }, { path: "renter" }],
        filters: req.filters,
      }),
    );
  }),
);

propertiesContract.post(
  "/properties-contracts",
  FileUploadHandler([{ name: "document", type: "pdf" }]),
  BodyHandler(
    Joi.object({
      property: Joi.string().required(),
      renter: Joi.string().required(),
      expiresAt: Joi.string().isoDate().required(),
    }),
  ),
  WrapAsync(async (req, res) => {
    res.status(httpStatusCodes.OK).json(
      await propertyContractController.insert({
        ...req.body,
        document: (req.files as Express.Multer.File[])?.find((file) => file.fieldname === "document"),
        contract: req.user.contract,
      }),
    );
  }),
);

export default propertiesContract;
