import Joi from "joi";
import dayjs from "dayjs";
import express from "express";
import { Types } from "mongoose";

import PageHandler from "@shared/middlewares/PageHandler";
import WrapAsync from "@shared/middlewares/WrapAsync";
import { httpStatusCodes } from "@shared/constants";

import propertyContractController from "../controllers/property-contract.controller";
import { PropertyContractStatus } from "@shared/models/propertyContract/propertyContract.interface";
import BodyHandler from "@shared/middlewares/BodyHandler";
import FileUploadHandler from "@shared/middlewares/FileUploadHandler";
import { Roles } from "@shared/models/user/user.interface";
import NotFoundError from "@shared/errors/NotFoundError";
import { clicksignEnvelopApi } from "@shared/core/apis/clicksign.api";

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
        PropertyContractStatus.DRAFT,
      ),
    }),
  ),
  WrapAsync(async (req, res) => {
    res.status(httpStatusCodes.OK).json(
      await propertyContractController.paginate({
        ...req.pagination,
        populate: [{ path: "property" }, { path: "renter" }],
        filters: {
          ...req.filters,
          contract: new Types.ObjectId(req.user.contract),
          ...(req.user.role === Roles.RENTER ? { renter: req.user.id } : {}),
        },
        sort: { canceledAt: 1, signedAt: -1 } as any,
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

propertiesContract.patch(
  "/properties-contracts/:id/cancel",
  WrapAsync(async (req, res) => {
    const contract = await propertyContractController.findById(req.params.id);

    if (!contract) {
      throw new NotFoundError("contract_not_found", "Contract not found");
    }

    res.status(httpStatusCodes.OK).json(
      await propertyContractController.update(contract._id, {
        props: {
          status: PropertyContractStatus.CANCELED,
          canceledAt: dayjs().format(),
        },
      }),
    );
  }),
);

propertiesContract.head(
  "/properties-contracts/:id/send",
  WrapAsync(async (req, res) => {
    const contract = await propertyContractController.findById(req.params.id);

    if (!contract) {
      throw new NotFoundError("contract_not_found", "Contract not found");
    }

    await clicksignEnvelopApi.send({
      envelopeId: contract.clicksignEnvelopeId as string,
    });

    await propertyContractController.update(contract._id, {
      props: {
        status: PropertyContractStatus.AWAITING_SIGN,
      },
    });

    res.sendStatus(200);
  }),
);

export default propertiesContract;
