import Joi from "joi";
import express from "express";
import dayjs from "dayjs";

import WrapAsync from "partipro-shared/src/middlewares/WrapAsync";
import BodyHandler from "partipro-shared/src/middlewares/BodyHandler";
import { httpStatusCodes } from "partipro-shared/src/constants";

import authenticationCotroller from "../controllers/authentication.controller";

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
    const user = await authenticationCotroller.login(req.body);
    const token = await authenticationCotroller.generateToken(user);
    res
      .cookie("ccToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: dayjs().add(3, "days").toDate(),
      })
      .status(httpStatusCodes.CREATED)
      .json({
        id: user._id,
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
    }),
  ),
  WrapAsync(async (req, res) => {
    const user = await authenticationCotroller.register(req.body);
    const token = await authenticationCotroller.generateToken(user);

    res
      .cookie("ccToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: dayjs().add(3, "days").toDate(),
      })
      .status(httpStatusCodes.CREATED)
      .json({
        id: user._id,
        token,
      });
  }),
);

export default authenticationRoute;
