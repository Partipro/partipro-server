import Joi from "joi";
import express from "express";
import dayjs from "dayjs";

import Auth from "@shared/middlewares/Auth";
import WrapAsync from "@shared/middlewares/WrapAsync";
import BodyHandler from "@shared/middlewares/BodyHandler";
import WrapTransactionAsync from "@shared/middlewares/WrapTransactionAsync";

import { httpStatusCodes } from "@shared/constants";
import { PlanHsSku } from "@shared/models/plan/plan.interface";

import authenticationController from "../controllers/authentication.controller";
import { Roles } from "@shared/models/user/user.interface";

const authenticationRoute = express.Router();

authenticationRoute.post(
  "/auth",
  BodyHandler(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  ),
  WrapAsync(async (req, res) => {
    const token = await authenticationController.login(req.body);
    res
      .cookie("ccToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: dayjs().add(3, "days").toDate(),
      })
      .status(httpStatusCodes.OK)
      .json({
        token,
      });
  }),
);

authenticationRoute.post(
  "/auth/register",
  BodyHandler(
    Joi.object({
      email: Joi.string().email().trim().required(),
      password: Joi.string().required(),
      name: Joi.string().required(),
      plan_hs_sku: Joi.string()
        .valid(...Object.values(PlanHsSku))
        .default(PlanHsSku.FREE),
    }),
  ),
  WrapTransactionAsync(async (req, res, session) => {
    const token = await authenticationController.register({ ...req.body, role: Roles.ADMIN }, { session });

    res
      .cookie("ccToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: dayjs().add(3, "days").toDate(),
      })
      .status(httpStatusCodes.CREATED)
      .json({
        token,
      });
  }),
);

authenticationRoute.get(
  "/auth/logout",
  Auth,
  WrapAsync(async (_req, res) => {
    res.status(200).clearCookie("ccToken").send("Token cleared from the cookies.");
  }),
);

export default authenticationRoute;
